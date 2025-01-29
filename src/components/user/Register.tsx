import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/api';
import { ApiError } from '../../utils/api';
import { useAuthStore } from '../../stores/authStore';

interface RegisterForm {
  userId: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const [form] = Form.useForm();

  const onFinish = async (values: RegisterForm) => {
    try {
      const response = await apiClient('REGISTER', {
        method: 'POST',
        requireAuth: false,
        body: JSON.stringify({
          user_id: values.userId.toLowerCase(),
          email: values.email,
          password: values.password,
        }),
      });

      // Log the user in with the received token
      login(values.userId.toLowerCase(), response.access_token);
      message.success('Registration successful!');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof ApiError) {
        message.error(error.message);
      } else {
        message.error('Registration failed. Please try again.');
      }
    }
  };

  const validateUserId = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject('Please input your user ID!');
    }
    if (!/^[a-z0-9]+$/.test(value)) {
      return Promise.reject('User ID can only contain lowercase letters and numbers!');
    }
    return Promise.resolve();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md dark:bg-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold dark:text-white">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign up to get started</p>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="userId"
            rules={[
              { validator: validateUserId }
            ]}
            validateTrigger="onChange"
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="User ID"
              size="large"
              onChange={e => {
                // Force lowercase while typing
                const value = e.target.value;
                e.target.value = value.toLowerCase();
              }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" size="large">
              Register
            </Button>
          </Form.Item>

          <div className="text-center">
            <span className="dark:text-gray-400">Already have an account? </span>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Log in
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
