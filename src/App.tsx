import { ConfigProvider, theme } from 'antd';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './components/Chat/ChatPage';
import Login from './components/User/Login';
import Register from './components/User/Register';
import Home from './components/Home';
import Header from './components/Layout/Header';
import './App.css';
import { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import BiographyPage from './components/Biography/BiographyPage';

function App() {
  const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className="w-full h-full">
        <Router>
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" /> : <Login />
            } />
            <Route path="/register" element={
              isAuthenticated ? <Navigate to="/" /> : <Register />
            } />
            <Route path="/chat" element={
              isAuthenticated ? (
                <AuthenticatedLayout>
                  <ChatPage />
                </AuthenticatedLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/user_chat" element={
              isAuthenticated ? (
                <AuthenticatedLayout>
                  <ChatPage />
                </AuthenticatedLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/" element={
              isAuthenticated ? (
                <AuthenticatedLayout>
                  <Home />
                </AuthenticatedLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/biography" element={
              isAuthenticated ? (
                <AuthenticatedLayout>
                  <BiographyPage />
                </AuthenticatedLayout>
              ) : <Navigate to="/login" />
            } />
          </Routes>
        </Router>
      </div>
    </ConfigProvider>
  );
}

export default App;
