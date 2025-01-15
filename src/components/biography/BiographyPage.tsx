import React, { useState, useEffect } from 'react';
import { Typography, Spin, Button, message, Space, Tooltip } from 'antd';
import { EditOutlined, FileMarkdownOutlined, FilePdfOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { Biography, Section, BiographyEdit } from '../../types/biography';
import { RenderSection } from './sections/RenderSection';
import { EditableSection } from './sections/EditableSection';
import { apiClient } from '../../utils/api';
import { EditableBiographyTitle } from './sections/EditableBiographyTitle';
import { exportToPDF, exportToMarkdown } from '../../utils/exportUtils';

const { Title, Paragraph } = Typography;

const addOrUpdateEdit = (prevEdits: BiographyEdit[], newEdit: BiographyEdit): BiographyEdit[] => {
  // For comments, we don't filter out previous edits
  if (newEdit.type === 'COMMENT') {
    return [...prevEdits, newEdit];
  }
  
  // For other edit types, filter out previous edits of the same type for the same section
  const filteredEdits = prevEdits.filter(edit => 
    !(edit.type === newEdit.type && edit.sectionId === newEdit.sectionId)
  );
  
  return [...filteredEdits, newEdit];
};

const BiographyPage: React.FC = () => {
  const [biography, setBiography] = useState<Biography | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedBiography, setEditedBiography] = useState<Biography | null>(null);
  const [edits, setEdits] = useState<BiographyEdit[]>([]);

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
      if (addEdits.length > 0) {
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

        // Get all existing section numbers
        const existingSectionNumbers = collectSectionTitles(editedBiography?.subsections || {});

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

      console.log('Saving biography with edits:', edits);
      // TODO: Uncomment this when the API is ready
      // await apiClient('BIOGRAPHY_UPDATE', {
      //   method: 'PUT',
      //   body: JSON.stringify({
      //     edits: edits
      //   }),
      // });
      setBiography(editedBiography);
      setEditMode(false);
      setEdits([]);
      message.success('Biography updated successfully');
    } catch (error) {
      console.error('Error updating biography:', error);
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

  const handleSectionTitleChange = (sectionId: string, oldTitle: string, newTitle: string) => {
    if (!editedBiography) return;
    
    const updateSectionTitle = (sections: Record<string, Section>, id: string): Record<string, Section> => {
      const newSections = { ...sections };
      
      for (const key in newSections) {
        if (key === id) {
          newSections[key] = { ...newSections[key], title: newTitle };
          return newSections;
        }
        newSections[key] = {
          ...newSections[key],
          subsections: updateSectionTitle(newSections[key].subsections, id)
        };
      }
      
      return newSections;
    };

    setEditedBiography({
      ...editedBiography,
      subsections: updateSectionTitle(editedBiography.subsections, sectionId)
    });

    setEdits(prev => addOrUpdateEdit(prev, {
      type: 'RENAME',
      sectionId,
      title: oldTitle,
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
      content:'AI Writing Suggestions:' + sectionPrompt,
      subsections: {},
      created_at: new Date().toISOString(),
      last_edit: new Date().toISOString()
    };

    // Helper function to sort sections by their section numbers
    const sortSectionsByNumber = (sections: Record<string, Section>): Record<string, Section> => {
      return Object.fromEntries(
        Object.entries(sections)
          .sort(([, a], [, b]) => {
            const aNum = a.title.split(' ')[0].split('.').map(Number);
            const bNum = b.title.split(' ')[0].split('.').map(Number);
            
            // Compare each level of the section numbers
            for (let i = 0; i < Math.max(aNum.length, bNum.length); i++) {
              const aVal = aNum[i] || 0;
              const bVal = bNum[i] || 0;
              if (aVal !== bVal) return aVal - bVal;
            }
            return 0;
          })
      );
    };

    // Function to find parent section by section number
    const findParentSection = (sections: Record<string, Section>, targetNumber: string): string | undefined => {
      const parentNumber = targetNumber.split('.').slice(0, -1).join('.');
      if (!parentNumber) return undefined;  // Top-level section

      for (const [name, section] of Object.entries(sections)) {
        const currentNumber = section.title.split(' ')[0];
        if (currentNumber === parentNumber) return name;
        
        const foundInSubsections = findParentSection(section.subsections, targetNumber);
        if (foundInSubsections) return foundInSubsections;
      }
      
      return undefined;
    };

    const parentTitle = findParentSection(editedBiography.subsections, sectionNumber);

    if (!parentTitle) {
      // Add as top-level section
      setEditedBiography({
        ...editedBiography,
        subsections: sortSectionsByNumber({
          ...editedBiography.subsections,
          [newSection.id]: newSection,
        }),
      });
    } else {
      // Add to parent section
      const updateSubsections = (sections: Record<string, Section>, id: string): Record<string, Section> => {
        const newSections = { ...sections };
        
        if (id in newSections) {
          newSections[id] = {
            ...newSections[id],
            subsections: sortSectionsByNumber({
              ...newSections[id].subsections,
              [newSection.id]: newSection,
            }),
          };
          return newSections;
        }

        for (const key in newSections) {
          newSections[key] = {
            ...newSections[key],
            subsections: updateSubsections(newSections[key].subsections, id),
          };
        }
        
        return newSections;
      };

      setEditedBiography({
        ...editedBiography,
        subsections: updateSubsections(editedBiography.subsections, parentTitle),
      });
    }

    setEdits(prev => addOrUpdateEdit(prev, {
      type: 'ADD',
      sectionId: newSection.id,
      title: fullTitle,
      data: { 
        parentTitle,
        sectionPrompt  // Save the content suggestion for AI
      },
      timestamp: Date.now()
    }));

    message.success('Section added successfully!');
  };

  const handleDeleteSection = (sectionId: string, title: string) => {
    if (!editedBiography) return;

    const deleteSection = (sections: Record<string, Section>, targetId: string): Record<string, Section> => {
      const newSections = { ...sections };
      
      // Check each section's id instead of using the object keys
      for (const [key, section] of Object.entries(newSections)) {
        if (section.id === targetId) {
          delete newSections[key];
          return newSections;
        }
        
        // Recursively check subsections
        section.subsections = deleteSection(section.subsections, targetId);
      }
      
      return newSections;
    };

    const updatedSubsections = deleteSection(editedBiography.subsections, sectionId);

    setEditedBiography({
      ...editedBiography,
      subsections: updatedSubsections
    });

    setEdits(prev => addOrUpdateEdit(prev, {
      type: 'DELETE',
      sectionId,
      title,
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

  useEffect(() => {
    const fetchBiography = async () => {
      try {
        setLoading(true);
        const data = await apiClient('BIOGRAPHY_LATEST', {
          method: 'GET',
        });
        setBiography(data);
      } catch (error) {
        console.error('Error fetching biography:', error);
        // Check if it's a 404 biography not found error
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
                onTitleChange={handleSectionTitleChange}
                onAddSection={handleAddSection}
                onDeleteSection={handleDeleteSection}
                onAddComment={handleAddComment}
                edits={edits}
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