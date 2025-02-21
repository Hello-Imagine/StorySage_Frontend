import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
// eslint-disable-next-line
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { apiClient, ApiError } from '../../utils/api';

interface LoginForm {
  userId: string;
  password: string;
}

const Login: React.FC = () => {
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: LoginForm) => {
    try {
      const data = await apiClient('LOGIN', {
        method: 'POST',
        requireAuth: false,
        body: JSON.stringify({
          user_id: values.userId.toLowerCase(),
          password: values.password,
        }),
      });

      login(values.userId.toLowerCase(), data.access_token);
      message.success('Login successful with userId: ' + values.userId.toLowerCase());
      navigate('/');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        message.error('Login failed: ' + (error as Error).message);
      } else {
        message.error('Login failed: ' + (error as Error).message);
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
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              value="123456" // TODO: remove this
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" size="large">
              Log in
            </Button>
          </Form.Item>
          
          {/* TODO: uncomment this when register is implemented */}
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
