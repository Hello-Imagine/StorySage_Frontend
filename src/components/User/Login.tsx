import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = async (values: LoginForm) => {
    // TODO: Implement actual login logic here
    console.log('Login form submitted:', values);
    message.success('Login successful!');
    // TODO: Redirect to chat page after successful login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md dark:bg-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold dark:text-white">Welcome Back!</h1>
          <p className="text-gray-600 dark:text-gray-400">Please sign in to continue</p>
        </div>
        
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" size="large">
              Log in
            </Button>
          </Form.Item>

          <div className="text-center">
            <span className="dark:text-gray-400">Don't have an account? </span>
            <Link to="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Register now
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
