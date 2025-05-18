import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../utils/AuthContext';
import MainFrame from './components/mainframe/MainFrame';
import TestReportFrame from './components/testreports/TestReportsFrame';
import ErrorCalculationFrame from './components/errorcalculationframe/ErrorCalculationFrame'
import ErrorAnalysisFrame from './components/erroranalysis/ErrorAnalysisFrame'
import logo from "../../assets/pictures/Logo.png";
import iconChat from "../../assets/pictures/iconChat.png";
import iconSettings from "../../assets/pictures/iconSettings.png";
import styles from './MainBase.module.css';
import { Button, Input, Modal } from 'antd';
import WebSocketClient from '../../utils/WebSocketClient';
import Request from '../../utils/Request';

const HomePage = () => <MainFrame/>;
const Page1 = ({ setCurrentPage }) => (
  <TestReportFrame onBack={() => setCurrentPage('home')} />
);
const Page2 = ({ setCurrentPage }) => (
  <ErrorCalculationFrame onBack={() => setCurrentPage('home')} />
);
const Page3 = ({ setCurrentPage }) => (
  <ErrorAnalysisFrame onBack={() => setCurrentPage('home')} />
);

const MainBase = () => {
  const { logout, user } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('home');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [editingMessage, setEditingMessage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'history') {
        setMessages(data.messages);
      } else if (data.type === 'message') {
        setMessages((prevMessages) => [...prevMessages, data.message]);
        if (!isModalVisible) {
          setUnreadMessages((prev) => prev + 1);
        }
      }
    };

    const handleOpen = () => {
      console.log('WebSocket connected');
    };

    const handleClose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
    };

    const handleError = (error) => {
      console.error('WebSocket error:', error);
    };

    WebSocketClient.connect('/api/messages/ws', handleMessage, handleOpen, handleClose, handleError);

    return () => {
      WebSocketClient.removeHandler('message', handleMessage);
      WebSocketClient.removeHandler('open', handleOpen);
      WebSocketClient.removeHandler('close', handleClose);
      WebSocketClient.removeHandler('error', handleError);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      try {
        const response = await Request.post('/api/messages/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data) {
          setMessages((prevMessages) => [...prevMessages, response.data]);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      WebSocketClient.send(newMessage);
      setNewMessage('');
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const response = await Request.put(`/api/messages/${messageId}`, {
        content: newContent
      });
      
      if (response.data) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? response.data : msg
          )
        );
        setEditingMessage(null);
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await Request.delete(`/api/messages/${messageId}`);
      
      if (response.data) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? response.data : msg
          )
        );
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
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
        return <Page2 setCurrentPage={setCurrentPage} />;
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
        <div>
              {user && (
                <>
                  {console.log("User in MainBase:", user)}
                  {console.log("User role:", user.role)}
                  {user.role === 'Администратор' && (
                    <button 
                      className={styles.adminButton} 
                      onClick={() => window.location.href = '/admin/users'}
                    >
                      <img className={styles.iconSettings} src={iconSettings} alt="Settings Icon" />
                    </button>
                  )}
                </>
              )}
            </div>
      </div>
      

      <Modal
        className={styles.chatModal}
        title="Чат"
        visible={isModalVisible}
        onCancel={handleCloseChat}
        footer={null}
        width={800}
      >
        <div className={styles.chatContainer}>
          <div className={styles.messages}>
            {messages.map((msg) => (
              <div key={msg.id} className={styles.message}>
                {!msg.is_deleted ? (
                  <>
                    {msg.user_role === 'Администратор' ? (
                      <span style={{ color: 'red', fontWeight: 'bold' }}>[{msg.user_role}] </span>
                    ) : msg.user_role === 'Инженер 1 категории' ? (
                      <span style={{ color: 'blue' }}>[{msg.user_role}] </span>
                    ) : msg.user_role === 'Инженер 2 категории' ? (
                      <span style={{ color: 'green' }}>[{msg.user_role}] </span>
                    ) : msg.user_role === 'Инженер 3 категории' ? (
                      <span style={{ color: 'purple' }}>[{msg.user_role}] </span>
                    ) : msg.user_role === 'Инженер - испытатель 3 категории' ? (
                      <span style={{ color: 'orange' }}>[{msg.user_role}] </span>
                    ) : msg.user_role === 'Ведущий инженер' ? (
                      <span style={{ color: 'teal' }}>[{msg.user_role}] </span>
                    ) : null}
                    <strong>{msg.user_name}:</strong>
                    
                    {editingMessage?.id === msg.id ? (
                      <div className={styles.editContainer}>
                        <Input
                          value={editingMessage.content}
                          onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                          onPressEnter={() => handleEditMessage(msg.id, editingMessage.content)}
                        />
                        <Button type="primary" onClick={() => handleEditMessage(msg.id, editingMessage.content)}>
                          Сохранить
                        </Button>
                        <Button onClick={() => setEditingMessage(null)}>
                          Отмена
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span>{msg.content}</span>
                        {msg.is_edited && (
                          <span className={styles.editedBadge}>
                            (ред.) {new Date(msg.edited_at).toLocaleString()}
                          </span>
                        )}
                        {msg.file_url && (
                          <div className={styles.fileAttachment}>
                            <a href={`${process.env.REACT_APP_API_URL}/api/messages/file/${msg.file_url.split('/').pop()}`} 
                               target="_blank" 
                               rel="noopener noreferrer">
                              📎 {msg.file_name}
                            </a>
                          </div>
                        )}
                        {msg.user_id === user.id && (
                          <div className={styles.messageActions}>
                            <Button type="link" onClick={() => setEditingMessage(msg)}>
                              ✏️
                            </Button>
                            <Button type="link" onClick={() => handleDeleteMessage(msg.id)}>
                              🗑️
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <span className={styles.deletedMessage}>
                    Сообщение удалено
                  </span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className={styles.inputContainer}>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onPressEnter={handleSendMessage}
              placeholder="Введите сообщение..."
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              📎
            </Button>
            {selectedFile && (
              <span className={styles.selectedFile}>
                {selectedFile.name}
                <Button type="link" onClick={() => setSelectedFile(null)}>
                  ✕
                </Button>
              </span>
            )}
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