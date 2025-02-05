import React from 'react';
import { Modal, Checkbox, Space, Input, Button, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { HeartTwoTone, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface TopicSelectionModalProps {
  isVisible: boolean;
  topics: string[];
  onOk: (selectedTopics: string[]) => void;
  loading?: boolean;
}

const TopicSelectionModal: React.FC<TopicSelectionModalProps> = ({
  isVisible,
  topics,
  onOk,
  loading = false,
}) => {
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
  const [customTopics, setCustomTopics] = React.useState<string[]>([]);
  const [inputErrors, setInputErrors] = React.useState<{ [key: number]: string }>({});

  const handleChange = (checkedValues: string[]) => {
    setSelectedTopics(checkedValues);
  };

  const handleCustomTopicChange = (index: number, value: string) => {
    const newCustomTopics = [...customTopics];
    newCustomTopics[index] = value;
    setCustomTopics(newCustomTopics);
    
    // Clear error when user starts typing
    if (inputErrors[index]) {
      const newErrors = { ...inputErrors };
      delete newErrors[index];
      setInputErrors(newErrors);
    }
  };

  const addCustomTopic = () => {
    setCustomTopics([...customTopics, '']);
  };

  const removeCustomTopic = (index: number) => {
    const newCustomTopics = customTopics.filter((_, i) => i !== index);
    setCustomTopics(newCustomTopics);
    
    // Remove any errors for this index
    const newErrors = { ...inputErrors };
    delete newErrors[index];
    setInputErrors(newErrors);
  };

  const handleOk = () => {
    // Validate custom topics
    const newErrors: { [key: number]: string } = {};
    customTopics.forEach((topic, index) => {
      if (topic.trim() === '') {
        newErrors[index] = 'Topic cannot be empty';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setInputErrors(newErrors);
      return;
    }

    // Combine checked topics and valid custom topics
    const validCustomTopics = customTopics.filter(topic => topic.trim() !== '');
    const allTopics = [...selectedTopics, ...validCustomTopics];
    onOk(allTopics);
  };

  return (
    <Modal
      title={
        <div className="text-center font-serif text-2xl text-blue-600 dark:text-blue-400">
          Thank You for Sharing Your Story!
        </div>
      }
      open={isVisible}
      onOk={handleOk}
      okButtonProps={{ 
        loading,
        className: "bg-blue-500 hover:bg-blue-600"
      }}
      okText="Continue Journey"
      closable={false}
      cancelButtonProps={{ style: { display: 'none' } }}
      maskClosable={false}
      width={600}
    >
      <div className="space-y-6 py-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <img 
            src="/stickers/thank.png" 
            alt="Thank you" 
            className="w-32 h-32 object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center space-y-3"
        >
          <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
            We've had such a wonderful conversation! <HeartTwoTone twoToneColor="#ff69b4" />
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400">
            To make your next session even more meaningful, would you like to explore any of these topics further?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="space-y-4">
            <Checkbox.Group 
              onChange={handleChange} 
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                {topics.map((topic, index) => (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Checkbox 
                      value={topic}
                      className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                        {topic}
                      </span>
                    </Checkbox>
                  </motion.div>
                ))}
              </Space>
            </Checkbox.Group>

            <div className="mt-6">
              {customTopics.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-base text-gray-600 dark:text-gray-400 mb-3"
                >
                  Or add your own topics:
                </motion.p>
              )}
              
              {customTopics.map((topic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center space-x-2 mb-2"
                >
                  <Input
                    value={topic}
                    onChange={(e) => handleCustomTopicChange(index, e.target.value)}
                    placeholder="Enter a topic you'd like to discuss..."
                    status={inputErrors[index] ? 'error' : ''}
                    className="flex-1"
                  />
                  <Tooltip title="Remove topic">
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={() => removeCustomTopic(index)}
                      className="flex items-center justify-center"
                      type="text"
                      danger
                    />
                  </Tooltip>
                </motion.div>
              ))}
              
              {inputErrors[customTopics.length - 1] && (
                <p className="text-red-500 text-sm mt-1">
                  {inputErrors[customTopics.length - 1]}
                </p>
              )}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  icon={<PlusOutlined />}
                  onClick={addCustomTopic}
                  type="dashed"
                  className="mt-2 w-full"
                >
                  {customTopics.length === 0 ? 'Add Your Own Topic' : 'Add Another Topic'}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-sm text-gray-500 dark:text-gray-400 text-center italic"
        >
          Don't worry if nothing catches your eye - we'll still have plenty to talk about!
        </motion.p>
      </div>
    </Modal>
  );
};

export default TopicSelectionModal; 