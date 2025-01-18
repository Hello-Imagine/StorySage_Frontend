import React, { useState, useEffect } from 'react';
import { Typography, Spin, Button, message, Space, Tooltip } from 'antd';
import { EditOutlined, FileMarkdownOutlined, FilePdfOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { Biography, Section, BiographyEdit } from '../../types/biography';
import { RenderSection } from './sections/RenderSection';
import { EditableSection } from './sections/EditableSection';
import { apiClient } from '../../utils/api';
import { EditableBiographyTitle } from './sections/EditableBiographyTitle';
import { exportToPDF, exportToMarkdown } from '../../utils/exportUtils';
import { addOrUpdateEdit, sortSectionsByNumber, findParentSection, isValidPathFormat, findSectionAndParent } from '../../utils/biographyUtils';

const { Title, Paragraph } = Typography;

const BiographyPage: React.FC = () => {
  const [biography, setBiography] = useState<Biography | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedBiography, setEditedBiography] = useState<Biography | null>(null);
  const [edits, setEdits] = useState<BiographyEdit[]>([]);

  useEffect(() => {
    const fetchBiography = async () => {
      try {
        setLoading(true);
        const data = await apiClient('BIOGRAPHY_LATEST', {
          method: 'GET',
        });
        setBiography(data);
      } catch (error) {
        if (error instanceof Error && 'status' in error && error.status === 404) {
          setBiography(null);
        } else {
          setError(error instanceof Error ? error.message : 'Failed to load biography');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBiography();
  }, []);

  const handleExportPDF = () => {
    if (!biography) return;
    try {
      exportToPDF(biography);
      message.success('PDF exported successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Failed to export PDF');
    }
  };

  const handleExportMarkdown = () => {
    if (!biography) return;
    try {
      exportToMarkdown(biography);
      message.success('Markdown exported successfully');
    } catch (error) {
      console.error('Error generating Markdown:', error);
      message.error('Failed to export Markdown');
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setEditedBiography(JSON.parse(JSON.stringify(biography))); // Deep clone
  };

  const handleSave = async () => {
    try {
      // Validate new sections
      const addEdits = edits.filter(edit => edit.type === 'ADD');
      if (addEdits.length > 0 && biography) {
        // Helper function to collect all section titles
        const collectSectionTitles = (sections: Record<string, Section>): string[] => {
          return Object.values(sections).reduce((titles: string[], section) => {
            // Get section number and text separately
            const [sectionNumber] = section.title.split(' ');
            titles.push(sectionNumber);
            
            // Recursively collect subsection titles
            return [...titles, ...collectSectionTitles(section.subsections)];
          }, []);
        };

        // Get all existing section numbers from the original biography
        const existingSectionNumbers = collectSectionTitles(biography.subsections);

        // Check for duplicates
        const duplicates = addEdits.filter(edit => {
          const [newSectionNumber] = edit.title.split(' ');
          return existingSectionNumbers.includes(newSectionNumber);
        });

        if (duplicates.length > 0) {
          const duplicateNumbers = duplicates.map(d => d.title.split(' ')[0]).join(', ');
          message.error(`Sections with numbers ${duplicateNumbers} already exist. Please use different numbers.`);
          return;
        }
      }

      console.log('Sending edits to backend: \n', edits);

      // Send edits to backend
      const updatedBiography = await apiClient('BIOGRAPHY_EDIT', {
        method: 'POST',
        body: JSON.stringify(edits)
      });

      // Update local state with the response from server
      setBiography(updatedBiography);
      setEditMode(false);
      setEdits([]);
      message.success('Biography updated successfully');
    } catch (error) {
      console.error('Error updating biography:', error);
      
      // Show more specific error messages based on the response
      if (error instanceof Error) {
        if ('status' in error && error.status === 400) {
          // Try to parse the error detail from the response
          try {
            const detail = JSON.parse(error.message).detail;
            message.error(`Failed to update biography: ${detail}`);
            return;
          } catch {
            // If can't parse detail, fall back to generic message
            message.error('Failed to update biography: Invalid edit operation');
            return;
          }
        }
      }
      
      // Generic error message as fallback
      message.error('Failed to update biography');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedBiography(null);
    setEdits([]);
  };

  const handleBiographyTitleChange = (sectionId: string, oldTitle: string, newTitle: string) => {
    if (!editedBiography) return;
    
    setEditedBiography({
      ...editedBiography,
      title: newTitle
    });

    setEdits(prev => addOrUpdateEdit(prev, {
      type: 'RENAME',
      sectionId,
      title: oldTitle,
      data: { newTitle },
      timestamp: Date.now()
    }));
  };

  const handleSectionTitleChange = (section: Section, newTitle: string) => {
    if (!editedBiography) return;
    
    // Validate the new section number format
    const newSectionNumber = newTitle.split(' ')[0];
    if (!isValidPathFormat(newSectionNumber)) {
      message.error('Invalid section format. Please use a number or dot-separated numbers (1 or 1.2) followed by a SPACE and your title');
      return;
    }

    // Find the section and its parent
    const result = findSectionAndParent(editedBiography.subsections, section.id);
    if (!result) {
      console.log('Section not found:', section.id);
      return;
    }

    // Update the key in parent's sections
    const { parent } = result;
    const updatedParent = { ...parent };
    delete updatedParent[section.title]; 
    updatedParent[newTitle] = {
      ...section,
      title: newTitle
    };

    // Sort the parent's sections
    const sortedParent = sortSectionsByNumber(updatedParent);

    // Update the biography state by replacing the parent's sections
    const updateParentSections = (sections: Record<string, Section>): Record<string, Section> => {
      const newSections = { ...sections };
      
      for (const [key, section] of Object.entries(sections)) {
        if (section.subsections === parent) {
          // Found the parent, update its subsections
          newSections[key] = {
            ...section,
            subsections: sortedParent
          };
          return newSections;
        }
        
        // Recursively update subsections
        newSections[key] = {
          ...section,
          subsections: updateParentSections(section.subsections)
        };
      }
      
      return newSections;
    };

    // If it's a top-level section, update directly
    if (parent === editedBiography.subsections) {
      setEditedBiography({
        ...editedBiography,
        subsections: sortedParent
      });
    } else {
      // Otherwise, update the parent's subsections recursively
      setEditedBiography({
        ...editedBiography,
        subsections: updateParentSections(editedBiography.subsections)
      });
    }

    setEdits(prev => addOrUpdateEdit(prev, {
      type: 'RENAME',
      sectionId: section.id,
      title: section.title,
      data: { newTitle },
      timestamp: Date.now()
    }));
  };

  const handleAddSection = (sectionNumber: string, title: string, sectionPrompt: string) => {
    if (!editedBiography) return;

    const fullTitle = `${sectionNumber} ${title}`;
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: fullTitle,
      content: 'AI Writing Suggestions:' + sectionPrompt,
      subsections: {},
      created_at: new Date().toISOString(),
      last_edit: new Date().toISOString(),
      isNew: true
    };

    const parentSection = findParentSection(editedBiography.subsections, sectionNumber);
    const parentTitle = parentSection ? parentSection.title : "";
    
    if (!parentTitle) {
      // Add as top-level section
      setEditedBiography({
        ...editedBiography,
        subsections: sortSectionsByNumber({
          ...editedBiography.subsections,
          [fullTitle]: newSection,
        }),
      });
    } else {
      // Add to parent section
      const updateSubsections = (sections: Record<string, Section>): Record<string, Section> => {
        const newSections = { ...sections };
        
        // Check if current level contains the parent section
        if (parentTitle in newSections) {
          newSections[parentTitle] = {
            ...newSections[parentTitle],
            subsections: sortSectionsByNumber({
              ...newSections[parentTitle].subsections,
              [fullTitle]: newSection,
            }),
          };
          return newSections;
        }

        // If not found, recursively check subsections
        for (const key in newSections) {
          newSections[key] = {
            ...newSections[key],
            subsections: updateSubsections(newSections[key].subsections)
          };
        }
        
        return newSections;
      };

      setEditedBiography({
        ...editedBiography,
        subsections: updateSubsections(editedBiography.subsections),
      });
    }

    setEdits(prev => addOrUpdateEdit(prev, {
      type: 'ADD',
      sectionId: newSection.id,
      title: fullTitle,
      data: { 
        parentTitle,
        sectionPrompt
      },
      timestamp: Date.now()
    }));

    message.success('Section added successfully!');
  };

  const handleDeleteSection = (section: Section) => {
    if (!editedBiography) return;

    const deleteSection = (sections: Record<string, Section>, targetId: string): Record<string, Section> => {
      const newSections = { ...sections };
      
      for (const [key, section] of Object.entries(newSections)) {
        if (section.id === targetId) {
          delete newSections[key];
          return newSections;
        }
        
        section.subsections = deleteSection(section.subsections, targetId);
      }
      
      return newSections;
    };

    const updatedSubsections = deleteSection(editedBiography.subsections, section.id);

    setEditedBiography({
      ...editedBiography,
      subsections: updatedSubsections
    });

    setEdits(prev => addOrUpdateEdit(prev, {
      type: 'DELETE',
      sectionId: section.id,
      title: section.title,
      timestamp: Date.now()
    }));
  };

  const handleAddComment = (
    section: Section,
    selectedText: string,
    comment: string
  ) => {
    setEdits(prev => addOrUpdateEdit(prev, {
      type: 'COMMENT',
      sectionId: section.id,
      title: section.title,
      data: {
        comment: {
          text: selectedText,
          comment
        }
      },
      timestamp: Date.now()
    }));

    message.success('Comment added successfully');
  };

  const handleContentChange = (section: Section, newContent: string) => {
    if (!editedBiography) return;

    const updateSectionContent = (sections: Record<string, Section>, id: string): Record<string, Section> => {
      const newSections = { ...sections };
      
      for (const key in newSections) {
        if (newSections[key].id === id) {
          newSections[key] = {
            ...newSections[key],
            content: newContent
          };
          return newSections;
        }
        newSections[key] = {
          ...newSections[key],
          subsections: updateSectionContent(newSections[key].subsections, id)
        };
      }
      
      return newSections;
    };

    setEditedBiography({
      ...editedBiography,
      subsections: updateSectionContent(editedBiography.subsections, section.id)
    });

    setEdits(prev => addOrUpdateEdit(prev, {
      type: 'CONTENT_CHANGE',
      sectionId: section.id,
      title: section.title,
      data: { newContent },
      timestamp: Date.now()
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!biography) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <img 
          src="stickers/404.png" 
          alt="No biography found" 
          className="w-32 h-32 object-contain"
        />
        <p className="text-gray-500 dark:text-gray-400">
          Sorry, you did not have a biography yet 😥. Please continue chatting with your AI to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-2">
          <Space>
            {editMode ? (
              <>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  className="flex items-center justify-center"
                >
                  Save
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={handleCancel}
                  className="flex items-center justify-center"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Tooltip title="Export as PDF">
                  <Button
                    shape="circle"
                    variant="dashed"
                    icon={<FilePdfOutlined />}
                    onClick={handleExportPDF}
                    className="flex items-center justify-center"
                  />
                </Tooltip>
                <Tooltip title="Export as Markdown">
                  <Button
                    shape="circle"
                    variant="dashed"
                    icon={<FileMarkdownOutlined />}
                    onClick={handleExportMarkdown}
                    className="flex items-center justify-center"
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button
                    shape="circle"
                    variant="dashed"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                    className="flex items-center justify-center"
                  />
                </Tooltip>
              </>
            )}
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        {editMode ? (
          <>
            <EditableBiographyTitle
              id={editedBiography!.id}
              title={editedBiography!.title}
              onTitleChange={handleBiographyTitleChange}
              onAddSection={handleAddSection}
            />
            {Object.values(editedBiography!.subsections).map((section) => (
              <EditableSection
                key={section.id}
                section={section}
                level={2}
                edits={edits}
                onTitleChange={handleSectionTitleChange}
                onAddSection={handleAddSection}
                onDeleteSection={handleDeleteSection}
                onAddComment={handleAddComment}
                onContentChange={handleContentChange}
              />
            ))}
          </>
        ) : (
          <>
            <Title className="text-center mb-8 text-blue-900 dark:text-blue-200">
              {biography!.title}
            </Title>
            {biography!.content && (
              <Paragraph className="text-gray-700 dark:text-gray-300 text-base whitespace-pre-line mb-8">
                {biography!.content}
              </Paragraph>
            )}
            {Object.values(biography!.subsections).map((section) => (
              <RenderSection key={section.id} section={section} level={2} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default BiographyPage;