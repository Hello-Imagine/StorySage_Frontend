import React from 'react';
import { Button, Dropdown, MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const items: MenuProps['items'] = [
    {
      key: 'history',
      label: 'Conversation History',
    },
    {
      key: 'logs',
      label: 'Logs',
    },
    {
      key: 'biography',
      label: 'My Biography',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('clicked', e.key);
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
      <Dropdown menu={{ items, onClick: handleMenuClick }}>
        <Button className="flex items-center gap-2">
          View Data <DownOutlined />
        </Button>
      </Dropdown>
      <Button onClick={() => navigate('/login')}>
        Logout
      </Button>
    </header>
  );
};

export default Header; 