import React from 'react';
import { Button, Row, Col, message, Timeline } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { MessageOutlined, EditOutlined, FileTextOutlined } from '@ant-design/icons';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const userId = useAuthStore(state => state.userId);

  const handleStart = async () => {
    if (!userId) {
      message.error('User ID not found! Please login.');
      navigate('/login');
      return;
    } else {
      navigate('/user_chat');
    }
  };

  return (
    <div className="h-screen overflow-y-auto 
      bg-gradient-to-b from-gray-100 to-blue-100 
      dark:from-gray-800 dark:to-blue-950">
      <div className="container mx-auto py-20 px-10">
        <Row gutter={16}>
          <Col xs={16} sm={12} md={10} lg={10} className="flex justify-center">
            <img
              src="stickers/chat.png"
              alt="Platform Illustration"
              className="w-full object-cover"
            />
          </Col>
          <Col
            xs={24}
            sm={12}
            md={14}
            lg={14}
            className="flex flex-col justify-center items-start p-10"
          >
            <h1 className="p-2 text-5xl font-bold font-serif text-blue-800 
              dark:text-blue-300">
              StorySage
            </h1>
            <p className="my-6 text-base font-serif text-neutral-700 
              dark:text-neutral-300">
              Transform your life stories into a beautifully crafted biography through natural conversations with our AI interviewer. No writing required - just chat and watch your story unfold.
            </p>

            <motion.div
              whileHover="hover"
              variants={{
                hover: {
                  scale: 1.2,
                  transition: {
                    duration: 0.2,
                  },
                },
              }}
            >
              <Button
                type="primary"
                size="large"
                className="bg-blue-600 hover:bg-blue-700 
                  dark:bg-blue-500 dark:hover:bg-blue-600"
                onClick={handleStart}
              >
                Let's Start
              </Button>
            </motion.div>
          </Col>
        </Row>

        <Row className="mt-12">
          <Col span={24} className="flex justify-center">
            <div className="max-w-2xl w-full">
              <h2 className="text-3xl font-serif text-center mb-8 
                text-blue-800 dark:text-blue-300">
                How It Works
              </h2>
              <Timeline
                items={[
                  {
                    dot: <MessageOutlined className="text-blue-500 text-xl" />,
                    children: (
                      <div className="pb-8">
                        <h3 className="text-xl font-semibold mb-2 
                          text-gray-800 dark:text-gray-200">
                          Have Coffee with Your AI Interviewer
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Relax and chat naturally with our AI interviewer, as if you're catching up with an old friend. 
                          Share your memories, achievements, and life experiences at your own pace - no pressure, just conversation.
                        </p>
                      </div>
                    ),
                  },
                  {
                    dot: <FileTextOutlined className="text-blue-500 text-xl" />,
                    children: (
                      <div className="pb-8">
                        <h3 className="text-xl font-semibold mb-2 
                          text-gray-800 dark:text-gray-200">
                          Watch Your Story Come to Life
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Like magic, your conversations transform into captivating biography chapters. Our AI weaves your 
                          memories into a coherent narrative, capturing your voice and preserving your unique life journey.
                        </p>
                      </div>
                    ),
                  },
                  {
                    dot: <EditOutlined className="text-blue-500 text-xl" />,
                    children: (
                      <div className="pb-8">
                        <h3 className="text-xl font-semibold mb-2 
                          text-gray-800 dark:text-gray-200">
                          Perfect Your Legacy
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Put the finishing touches on your story. Review, edit, and refine your biography until it perfectly 
                          captures your life's journey - creating a lasting legacy for generations to come.
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home;
