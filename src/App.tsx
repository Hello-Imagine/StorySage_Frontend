import { ConfigProvider, theme } from 'antd';
import ChatPage from './components/ChatWindow/ChatPage'
import './App.css'
import { useEffect, useState } from 'react';

function App() {
  const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className="w-full h-full">
        <ChatPage />
      </div>
    </ConfigProvider>
  )
}

export default App
