import React from 'react';
import { Button, Row, Col, message } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const userId = useAuthStore(state => state.userId);

  const handleStart = async () => {
    if (!userId) {
      message.error('User ID not found! Please login.');
      navigate('/login');
      return;
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-100 to-blue-100 dark:from-gray-800 dark:to-blue-950">
      <div className="py-20 px-10">
        <Row gutter={16}>
          <Col xs={16} sm={12} md={10} lg={10} className="flex justify-center">
            <img
              src="/chat.png"
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
            <h1 className="p-2 text-5xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-400 dark:from-blue-300 dark:to-blue-100">
              AI Biography
            </h1>
            <p className="my-6 text-base font-serif text-neutral-700 dark:text-neutral-300">
              AI Biography is an AI-powered system for generating your own biography.
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
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                onClick={handleStart}
              >
                Let's Start
              </Button>
            </motion.div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home;
