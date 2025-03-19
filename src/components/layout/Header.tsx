import React from 'react';
import { Button, Dropdown, MenuProps, message } from 'antd';
import { DownOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { userId, logout } = useAuthStore();

  const items: MenuProps['items'] = [
    {
      key: 'biography',
      label: 'My Biography',
    },
    {
      key: 'history',
      label: 'Conversation History',
    }
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'biography') {
      navigate('/biography');
    } else if (e.key === 'history') {
      navigate('/chat');
    } else if (e.key === 'logs') {
      message.info('Check files under /logs/' + userId + '/execution_logs/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 
      dark:border-gray-700 flex items-center justify-between px-4">
      <Dropdown menu={{ items, onClick: handleMenuClick }}>
        <Button className="flex items-center gap-2">
          View Data <DownOutlined />
        </Button>
      </Dropdown>
      <div className="flex items-center gap-4">
        <span className="dark:text-white">{userId}</span>
        <Button 
          type="default"
          icon={<HomeOutlined className="text-lg" />}
          onClick={() => navigate('/')}
        />
        <Button onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header; 