import React, { useState, useEffect } from 'react';
import { Input, Button, Space } from 'antd';
import { EditOutlined, CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { AddSectionModal } from '../modals/AddSectionModal';

interface EditableBiographyTitleProps {
  id: string;
  title: string;
  onTitleChange: (sectionId: string, oldTitle: string, newTitle: string) => void;
  onAddSection: (sectionNumber: string, title: string, sectionPrompt: string) => void;
}

export const EditableBiographyTitle: React.FC<EditableBiographyTitleProps> = ({
  id,
  title,
  onTitleChange,
  onAddSection,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [originalTitle, setOriginalTitle] = useState(title);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setTitleValue(title);
    setOriginalTitle(title);
  }, [title]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleConfirmClick = () => {
    setIsEditing(false);
    if (titleValue !== originalTitle) {
      onTitleChange(id, originalTitle, titleValue);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-8">
        <Input
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          disabled={!isEditing}
          className={`
            text-center text-2xl font-bold text-blue-900 dark:text-blue-200
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
          <Button
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalOpen(true)}
            size="small"
          />
        </Space>
      </div>

      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddSection}
      />
    </>
  );
}; 