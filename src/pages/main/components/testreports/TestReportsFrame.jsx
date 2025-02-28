import React, { useState, useEffect } from 'react';
import Card from './components/Card';
import Pagination from './components/Pagination';
import styles from './TestReportFrame.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getReports } from '../../../../redux/slices/reports';

const TestReportFrame = ({ onBack }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();
  const { cardsData, totalPages, loading, error } = useSelector((state) => state.reports);
  const cardsPerPage = 5;

  useEffect(() => {
    dispatch(getReports({ skip: (currentPage - 1) * cardsPerPage, max: cardsPerPage }));
  }, [currentPage, dispatch]);

  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className={styles.frameContent}>
      <div className={styles.topTitle}>
        Отчёты по испытаниям
      </div>
      <div className={styles.cardList}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingText}>Загрузка...</div>
          </div>
        ) : (
          cardsData.map(card => (
            <Card key={card.id} title={card.title} content={card.content} />
          ))
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
    </div>
  );
};

export default TestReportFrame;