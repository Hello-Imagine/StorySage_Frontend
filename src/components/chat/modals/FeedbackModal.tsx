import React from 'react';
import { Modal, Rate, Input, Form } from 'antd';
import { FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface FeedbackModalProps {
  isVisible: boolean;
  onOk: (rating: number, feedback: string) => void;
  loading?: boolean;
}

const customIcons: { [key: number]: React.ReactNode } = {
  1: <FrownOutlined />,
  2: <FrownOutlined />,
  3: <MehOutlined />,
  4: <SmileOutlined />,
  5: <SmileOutlined />,
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isVisible,
  onOk,
  loading
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    onOk(values.rating, values.feedback);
    form.resetFields();
  };

  return (
    <Modal
      title="Session Feedback"
      open={isVisible}
      onOk={handleOk}
      okText="Continue"
      cancelButtonProps={{ style: { display: 'none' } }}
      closable={false}
      maskClosable={false}
      confirmLoading={loading}
    >
      <div className="flex flex-col items-center mb-6">
        <img 
          src="stickers/thank.png" 
          alt="Thank You" 
          className="w-32 h-32 mb-4"
        />
        <p className="text-gray-600 text-center">
          Thank you for using our application! 
          Your feedback helps us improve and provide a better experience.
        </p>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="rating"
          label="How would you rate this interview session?"
          rules={[{ required: false, message: 'Please rate the session' }]}
        >
          <Rate 
            character={({ index = 0 }) => customIcons[index + 1]}
            className="text-2xl"
          />
        </Form.Item>
        <Form.Item
          name="feedback"
          label="Do you have any feedback about the interview? 💭"
          rules={[{ required: false, message: 'Please provide some feedback' }]}
        >
          <TextArea
            rows={4}
            placeholder="Please share your thoughts about the interview experience..."
            className="mt-2"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FeedbackModal; 