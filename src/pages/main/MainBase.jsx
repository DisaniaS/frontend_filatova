import React, { useState, useContext } from 'react';
import { AuthContext } from '../../utils/AuthContext'; 
import MainFrame from './components/mainframe/MainFrame';
import logo from "../../assets/pictures/Logo.png"
import styles from './MainBase.module.css';

// Компоненты для разных страниц
const HomePage = () => <MainFrame/>;
const Page1 = () => <div className={styles.pageContent}>Страница 1</div>;
const Page2 = () => <div className={styles.pageContent}>Страница 2</div>;
const Page3 = () => <div className={styles.pageContent}>Страница 3</div>;

const MainBase = () => {
  const { logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('home');

  const handleLogout = () => {
    logout();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'page1':
        return <Page1 />;
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
    </div>
  );
};

export default MainBase;