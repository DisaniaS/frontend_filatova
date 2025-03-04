import React, { useState, useEffect } from 'react';
import Card from './components/Card';
import Pagination from './components/Pagination';
import styles from './TestReportFrame.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getReports, getReportByNumber } from '../../../../redux/slices/reports';
import request from '../../../../utils/Request'
import { Modal, Upload } from 'antd';

const TestReportFrame = ({ onBack }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchNumber, setSearchNumber] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [productNumber, setProductNumber] = useState('');
  const dispatch = useDispatch();
  const { cardsData, totalPages, loading, error } = useSelector((state) => state.reports);
  const cardsPerPage = 5;

  useEffect(() => {
    dispatch(getReports({ skip: (currentPage - 1) * cardsPerPage, max: cardsPerPage }));
  }, [currentPage, dispatch]);

  const handleSearch = () => {
    if (searchNumber) {
        dispatch(getReportByNumber(searchNumber));
    }
};

  const handleUpload = (info) => {
    setFile(info.file);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('number', productNumber);
    formData.append('file', file);

    if(productNumber==='' || file===null){
      return
    }
    try {
        await request.post('/reports', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        setProductNumber('');
        setFile(null);
        alert('Отчёт успешно загружен');
        setIsModalVisible(false)
    } catch (error) {
      if (error.response) {
        if (error.response.status === 409) {
            alert('Ошибка: данный номер уже был использован.');
        } else {
            alert('Ошибка при загрузке отчёта: ' + error.response.data.message || 'Неизвестная ошибка');
        }
    } else {
        alert('Ошибка при загрузке отчёта: ' + error.message);
    }
    }
};

  return (
    <div className={styles.frameContent}>
      <div className={styles.topTitle}>
        Отчёты по испытаниям
      </div>

      <div className={styles.controls}>
        <input
          className={styles.inputInForm}
          placeholder="Поиск по номеру изделия"
          value={searchNumber}
          onChange={(e) => setSearchNumber(e.target.value)}
          style={{ width: 200, marginRight: 8 }}
        />
        <button className={styles.homeButton} type="primary" onClick={handleSearch}>
          Поиск
        </button>
        <button className={styles.homeButton}
          type="primary" 
          onClick={() => setIsModalVisible(true)}
          style={{ marginLeft: 'auto' }}
        >
          Загрузить новый отчёт
        </button>
      </div>

      <div className={styles.cardList}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingText}>Загрузка...</div>
          </div>
        ) : (
          <div className={styles.cardList}>
            {error!=null ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingText}>Ошибка: {error}</div>
              </div>
            ) : (
              cardsData.map(card => (
                <Card 
                  key={card.id} 
                  id={card.id}
                  reportNumber={card.number}
                  createdBy={card.user_fio}
                  createdAt={card.ts}
                />
              ))
            )}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.homeButton} onClick={onBack}>
          Вернуться на главную
        </button>
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </div>

      <Modal
        className={styles.uploadModal}
        title="Загрузка отчёта"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <button className={styles.buttonInForm} key="back" onClick={() => setIsModalVisible(false)}>
            Отмена
          </button>,
          <button className={styles.buttonInForm} key="submit" type="primary" onClick={handleSubmit}>
            Загрузить
          </button>,
        ]}
      >
        <input
          className={styles.inputInForm}
          placeholder="Номер изделия"
          value={productNumber}
          onChange={(e) => setProductNumber(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Upload
          beforeUpload={() => false}
          onChange={handleUpload}
          showUploadList={false}
        >
          <button className={styles.buttonInForm}>Выберите файл</button>
        </Upload>
        {file && <div style={{ marginTop: 8 }}>{file.name}</div>}
      </Modal>
    </div>
  );
};

export default TestReportFrame;