import React, { useState, useContext, useEffect } from 'react';
import styles from './AuthPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginRequest } from '../../redux/slices/user';
import { AuthContext } from '../../utils/AuthContext'; 
import RegistrationModal from './components/RegistrationModal';
import { validateField } from '../../utils/Validation';

const AuthPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { isAuthenticated, login } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loginData, setLoginData] = useState({
      login: '',
      password: ''
    });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });

    if (!validateField(name, value)) {
      setErrors((prev) => ({ ...prev, [name]: true }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateField('username', loginData.username) || !validateField('password', loginData.password)) {
      alert('Проверьте правильность ввода данных');
      return;
    }
    try {
      const data = await dispatch(loginRequest(loginData));
      if ('token' in data.payload) {
        login(data.token)
      } else {
        alert('Неверные логин или пароль');
      }
    } catch (error) {
      alert('Произошла ошибка при входе. Попробуйте позже.');
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <h1>Авторизация</h1>
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="login"
              value={loginData.login}
              placeholder="Логин"
              onChange={handleChange}
              required
              className={errors.login ? styles.errorInput : ''}
            />
            {errors.login && (
              <span className={styles.errorText}>
                Доступные символы: a-z; A-Z; 0-9; _; .; минимум 3 символа
              </span>
            )}
          </div>
          <div className={styles.formGroup}>
            <input
              type="password"
              name="password"
              value={loginData.password}
              placeholder="Пароль"
              onChange={handleChange}
              required
              className={errors.password ? styles.errorInput : ''}
            />
            {errors.password && (
              <span className={styles.errorText}>
                Пароль должен содержать минимум 6 символов
              </span>
            )}
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