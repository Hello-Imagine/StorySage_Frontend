import React, { useState, useEffect } from 'react';
import { Input, Button, Space, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import { Section } from '../../../types/biography';
import { AddSectionModal } from './AddSectionModal';

interface EditableSectionProps {
  section: Section;
  level: number;
  onTitleChange: (sectionId: string, oldTitle: string, newTitle: string) => void;
  onAddSection: (sectionNumber: string, title: string, contentSuggestion: string) => void;
  onDeleteSection: (sectionId: string, title: string) => void;
}

export const EditableSection: React.FC<EditableSectionProps> = ({
  section,
  level,
  onTitleChange,
  onAddSection,
  onDeleteSection,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(section.title);
  const [originalTitle, setOriginalTitle] = useState(section.title);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {section.content}
            </p>
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
    </>
  );
}; 