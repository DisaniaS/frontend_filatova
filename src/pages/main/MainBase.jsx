import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../utils/AuthContext';
import MainFrame from './components/mainframe/MainFrame';
import TestReportFrame from './components/testreports/TestReportsFrame';
import logo from "../../assets/pictures/Logo.png";
import iconChat from "../../assets/pictures/iconChat.png";
import styles from './MainBase.module.css';
import { Button, Input, Modal } from 'antd';

const HomePage = () => <MainFrame/>;
const Page1 = ({ setCurrentPage }) => (
  <TestReportFrame onBack={() => setCurrentPage('home')} />
);
const Page2 = () => <div className={styles.pageContent}>Страница 2</div>;
const Page3 = () => <div className={styles.pageContent}>Страница 3</div>;

const MainBase = () => {
  const { logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('home');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const ws = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    ws.current = new WebSocket(`ws://localhost:8000/api/ws/messages?token=${token}`);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
      if (!isModalVisible) {
        setUnreadMessages((prev) => prev + 1);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(newMessage);
      setNewMessage('');
    }
  };

  const handleOpenChat = () => {
    setIsModalVisible(true);
    setUnreadMessages(0);
  };

  const handleCloseChat = () => {
    setIsModalVisible(false);
  };

  const handleLogout = () => {
    logout();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'page1':
        return <Page1 setCurrentPage={setCurrentPage} />;
      case 'page2':
        return <Page2 />;
      case 'page3':
        return <Page3 />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className={styles.mainBaseContainer}>
      <div className={styles.sideMenu}>
        <div className={styles.logo}>
          <img src={logo} alt="vnii signal" className={styles.logoPictire}/>
        </div>
        <div className={styles.blueLine}></div>
        <div className={styles.menuButtonsConteiner}>
          <button
            className={styles.menuButton}
            onClick={() => setCurrentPage('page1')}
          >
            Отчёты по<br/> 
            испытаниям
          </button>
          <button
            className={styles.menuButton}
            onClick={() => setCurrentPage('page2')}
          >
            Расчёт<br/>
            погрешностей
          </button>
          <button
            className={styles.menuButton}
            onClick={() => setCurrentPage('page3')}
          >
            Анализ<br/>
            погрешностей
          </button>
        </div>
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.topMenu}>
          <div className={styles.topMenuContent}>
            <div></div>
            <div className={styles.topMenuTitle}>
              Добро пожаловать в систему контроля качества<br/>
              проведённых испытаний!
            </div>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Выйти
            </button>
          </div>
          <div className={styles.blueLine}></div>
        </div>

        <div className={styles.content}>
          {renderPage()}
        </div>
      </div>

      <div className={styles.chatButtonContainer}>
        <img
          src={iconChat}
          alt="Чат"
          onClick={handleOpenChat}
          className={styles.chatIcon}
        />
        {unreadMessages > 0 && (
          <span className={styles.unreadBadge}>{unreadMessages}</span>
        )}
      </div>

      <Modal
        className={styles.chatModal}
        title="Чат"
        visible={isModalVisible}
        onCancel={handleCloseChat}
        footer={null}
      >
        <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {messages.map((msg, index) => (
            <div key={index} className={styles.message}>
              {msg.user_is_admin && (
                <span style={{ color: 'red', fontWeight: 'bold' }}>[Администратор] </span>
              )}
              <strong>{msg.user_name}:</strong> {msg.content}
            </div>
          ))}
        </div>
          <div className={styles.inputContainer}>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onPressEnter={handleSendMessage}
              placeholder="Введите сообщение..."
            />
            <Button type="primary" onClick={handleSendMessage}>
              Отправить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MainBase;