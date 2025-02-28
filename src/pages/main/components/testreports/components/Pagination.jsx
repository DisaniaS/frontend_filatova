import React from 'react';
import styles from './Components.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className={styles.pagination}>
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        Назад
      </button>
      <span>{currentPage} из {totalPages}</span>
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
      >
        Вперед
      </button>
    </div>
  );
};

export default Pagination;