import React, { useState, useEffect } from 'react';
import { Input, Button, Space, Popconfirm, Badge } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined, CommentOutlined } from '@ant-design/icons';
import { Section, BiographyEdit } from '../../../types/biography';
import { AddSectionModal } from '../modals/AddSectionModal';
import { CommentPopup } from '../comments/CommentPopup';
import { CommentsDrawer } from '../comments/CommentsDrawer';

interface EditableSectionProps {
  section: Section;
  level: number;
  onTitleChange: (sectionId: string, oldTitle: string, newTitle: string) => void;
  onAddSection: (sectionNumber: string, title: string, sectionPrompt: string) => void;
  onDeleteSection: (sectionId: string, title: string) => void;
  onAddComment: (
    section: Section,
    selectedText: string,
    comment: string
  ) => void;
  edits: BiographyEdit[];
}

export const EditableSection: React.FC<EditableSectionProps> = ({
  section,
  level,
  onTitleChange,
  onAddSection,
  onDeleteSection,
  onAddComment,
  edits,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(section.title);
  const [originalTitle, setOriginalTitle] = useState(section.title);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState(false);

  useEffect(() => {
    setTitleValue(section.title);
    setOriginalTitle(section.title);
  }, [section.title]);

  const handleEditClick = () => {
    setIsEditing(true);
    setOriginalTitle(section.title);
  };

  const handleConfirmClick = () => {
    setIsEditing(false);
    if (titleValue !== originalTitle) {
      onTitleChange(section.id, originalTitle, titleValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value);
  };

  // Extract section number from title (e.g., "1.2 Education" -> "1.2")
  const sectionNumber = section.title.split(' ')[0];
  const showAddButton = level <= 3;  // Only show add button for headings levels

  const handleTextSelection = () => {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    let content = range.commonAncestorContainer;
    
    // If the selection is a text node, get its parent element
    if (content.nodeType === Node.TEXT_NODE) {
      content = content.parentElement!;
    }

    // Check if the selection is within our content div by walking up the tree
    let currentElement = content as HTMLElement;
    while (currentElement && !currentElement.classList.contains('section-content')) {
      currentElement = currentElement.parentElement as HTMLElement;
    }
    
    // If we found the section-content div, process the selection
    if (currentElement) {
      const text = selection.toString().trim();
      if (text) {
        setSelectedText(text);
        setIsCommentModalOpen(true);
      }
    }
  };

  const handleCommentSubmit = (comment: string) => {
    onAddComment(
      section,
      selectedText,
      comment
    );
  };

  // Get comments for this section
  const sectionComments = edits.filter(
    edit => edit.type === 'COMMENT' && edit.sectionId === section.id
  );

  return (
    <>
      <div className="mb-6 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded">
        <div className="flex items-center gap-2 mb-2">
          <Input
            value={titleValue}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`
              font-bold
              ${!isEditing ? 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
            `}
          />
          <Space>
            <Button
              icon={isEditing ? <CheckOutlined /> : <EditOutlined />}
              onClick={isEditing ? handleConfirmClick : handleEditClick}
              size="small"
              type={isEditing ? "primary" : "default"}
            />
            {showAddButton && (
              <Button
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalOpen(true)}
                size="small"
              />
            )}
            <Popconfirm
              title="Are you sure you want to delete this section?"
              onConfirm={() => onDeleteSection(section.id, section.title)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Popconfirm>
          </Space>
        </div>
        {section.content && (
          <div className="relative">
            <div className="flex items-start gap-2">
              <Badge count={sectionComments.length} showZero={false}>
                <Button
                  icon={<CommentOutlined />}
                  size="small"
                  onClick={() => setIsCommentsDrawerOpen(true)}
                  title="View comments"
                />
              </Badge>
              <div 
                className="flex-1 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded section-content"
                onMouseUp={handleTextSelection}
              >
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            </div>
          </div>
        )}
        {Object.values(section.subsections).map((subsection) => (
          <EditableSection
            key={subsection.id}
            section={subsection}
            level={level + 1}
            onTitleChange={onTitleChange}
            onAddSection={onAddSection}
            onDeleteSection={onDeleteSection}
            onAddComment={onAddComment}
            edits={edits}
          />
        ))}
      </div>

      {showAddButton && (
        <AddSectionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={onAddSection}
          parentSectionNumber={sectionNumber}
        />
      )}

      <CommentPopup
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onSubmit={handleCommentSubmit}
        selectedText={selectedText}
      />

      <CommentsDrawer
        isOpen={isCommentsDrawerOpen}
        onClose={() => setIsCommentsDrawerOpen(false)}
        comments={sectionComments}
        sectionTitle={section.title}
      />
    </>
  );
}; 