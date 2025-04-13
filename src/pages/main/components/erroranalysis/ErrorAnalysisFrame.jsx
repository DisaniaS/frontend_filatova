import React, { useState } from 'react';
import styles from './ErrorAnalysisFrame.module.css';
import { Button } from 'antd';

const ErrorAnalysisFrame = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [chartType, setChartType] = useState('type1');

  // Заглушки данных
  const acceptedProducts = ['Изделие №123', 'Изделие №456', 'Изделие №789'];
  const rejectedProducts = ['Изделие №321', 'Изделие №654'];
  
  return (
    <div className={styles.frameContent}>
      <div className={styles.topTitle}>
        Анализ погрешностей
      </div>

      <div className={styles.tabs}>
        <Button
          type={activeTab === 'products' ? 'primary' : 'default'}
          onClick={() => setActiveTab('products')}
        >
          (Не)принятые изделия
        </Button>
        <Button
          type={activeTab === 'stats' ? 'primary' : 'default'}
          onClick={() => setActiveTab('stats')}
        >
          Статистика
        </Button>
        <Button
          type={activeTab === 'correlation' ? 'primary' : 'default'}
          onClick={() => setActiveTab('correlation')}
        >
          Корреляция
        </Button>
      </div>

      {activeTab === 'products' && (
        <div className={styles.productsContainer}>
          <div className={styles.productList}>
            <h3>Принятые изделия</h3>
            {acceptedProducts.map((product, index) => (
              <div key={index} className={styles.productItem}>
                {product}
              </div>
            ))}
          </div>
          
          <div className={styles.productList}>
            <h3>Непринятые изделия</h3>
            {rejectedProducts.map((product, index) => (
              <div key={index} className={styles.productItem}>
                {product}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className={styles.statsContainer}>
          <div className={styles.chartContainer}>
            {/* Здесь будет график */}
            <div className={styles.chartPlaceholder}>
              График статистики (тип: {chartType})
            </div>
            
            <div className={styles.chartControls}>
              <Button onClick={() => setChartType('type1')}>Тип 1</Button>
              <Button onClick={() => setChartType('type2')}>Тип 2</Button>
              <Button onClick={() => setChartType('type3')}>Тип 3</Button>
              <Button type="primary">Скачать график</Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'correlation' && (
        <div className={styles.correlationContainer}>
          <h3>Раздел корреляций (в разработке)</h3>
        </div>
      )}

      <div className={styles.footer}>
        <Button className={styles.homeButton} onClick={onBack}>
          Вернуться на главную
        </Button>
      </div>
    </div>
  );
};

export default ErrorAnalysisFrame;