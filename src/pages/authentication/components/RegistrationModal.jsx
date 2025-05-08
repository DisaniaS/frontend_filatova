import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../utils/AuthContext'; 
import { registerRequest } from '../../../redux/slices/user';
import { validateField, validateForm } from "../../../utils/Validation"
import styles from './RegistrationModal.module.css';

const RegistrationModal = ({ onClose }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { isAuthenticated, login } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    sname: '',
    login: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (!validateField(name, value)) {
      setErrors((prev) => ({ ...prev, [name]: true }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleNext = () => {
    if (validateForm(formData, 1)) {
      setStep(2);
    } else {
      alert('Заполните все поля корректно!');
    }
  };
  const handlePrevious = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: true }));
      alert('Пароли не совпадают');
      return;
    }
    if (!validateForm(formData, 2)) {
      alert('Проверьте правильность ввода данных');
      return;
    }
    const { confirmPassword, ...dataToSubmit } = formData;
    try {
      const data = await dispatch(registerRequest(dataToSubmit));
      if ('token' in data.payload) {
        window.localStorage.setItem('token', data.payload.token)
        login(data.payload.token, data.payload);
      } else {
        alert('Не удалось зарегистрироваться. Попробуйте другой логин.');
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      alert('Произошла ошибка при регистрации. Попробуйте позже.');
    }
  };
  return (
    <div className={styles.modalOverlay}>
      <motion.div
        className={styles.modalContent}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <h2>Регистрация</h2>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="fname"
                  placeholder="Имя"
                  value={formData.fname}
                  onChange={handleChange}
                  required
                  className={errors.fname ? styles.errorInput : ''}
                />
                {errors.fname && (
                  <span className={styles.errorText}>
                    Только русские буквы, минимум 3 символа
                  </span>
                )}
              </div>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="lname"
                  placeholder="Фамилия"
                  value={formData.lname}
                  onChange={handleChange}
                  required
                  className={errors.lname ? styles.errorInput : ''}
                />
                {errors.lname && (
                  <span className={styles.errorText}>
                    Только русские буквы, минимум 3 символа
                  </span>
                )}
              </div>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="sname"
                  placeholder="Отчество"
                  value={formData.sname}
                  onChange={handleChange}
                  className={errors.sname ? styles.errorInput : ''}
                />
                {errors.sname && (
                  <span className={styles.errorText}>
                    Только русские буквы, минимум 3 символа
                  </span>
                )}
              </div>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="login"
                  placeholder="Логин"
                  value={formData.login}
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
              <button
                type="button"
                className={styles.nextButton}
                onClick={handleNext}
                disabled={!validateForm(formData, 1)}
              >
                Далее
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.formGroup}>
                <input
                  type="password"
                  name="password"
                  placeholder="Придумайте пароль"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={errors.password ? styles.errorInput : ''}
                />
                {errors.password && (
                  <span className={styles.errorText}>Минимум 6 символов</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Подтвердите пароль"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={errors.confirmPassword ? styles.errorInput : ''}
                />
                {errors.confirmPassword && (
                  <span className={styles.errorText}>Пароли не совпадают</span>
                )}
              </div>
              <div className={styles.bottomButtons}>
                <button
                  type="button"
                  className={styles.previousButton}
                  onClick={handlePrevious}
                >
                  Назад
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  onClick={handleSubmit}
                >
                  Зарегистрироваться
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RegistrationModal;