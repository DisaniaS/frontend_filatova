import React, { useState } from 'react';
import styles from './AuthPage.module.css';
import RegistrationModal from './components/RegistrationModal';

const AuthPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Авторизация...');
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <h1>Авторизация</h1>
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Логин"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="password"
              placeholder="Пароль"
              required
            />
          </div>
          <button type="submit" className={styles.authButton}>
            Войти
          </button>
        </form>
        <button
          className={styles.registerButton}
          onClick={() => setIsModalOpen(true)}
        >
          Зарегистрироваться
        </button>
      </div>

      {isModalOpen && (
        <RegistrationModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default AuthPage;