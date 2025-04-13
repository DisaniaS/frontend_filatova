import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Button, Table, Spin, Badge, message } from 'antd';
import styles from './ErrorCalculationFrame.module.css';
import request from '../../../../utils/Request';
import { useDispatch, useSelector } from 'react-redux';
import { calculateInaccuracies, getCalculationStatus } from '../../../../redux/slices/inaccuracy';

const ErrorCalculationFrame = ({ onBack }) => {
    const dispatch = useDispatch();
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { 
      loading: calculationLoading,
      error: calculationError,
      calculationMessage,
      uncalculatedCount,
      hasUncalculated 
    } = useSelector((state) => state.inaccuracy);

    useEffect(() => {
      loadExcelData();
      dispatch(getCalculationStatus());
      
      const interval = setInterval(() => {
          dispatch(getCalculationStatus());
      }, 30000);

      return () => clearInterval(interval);
  }, [dispatch]);

    useEffect(() => {
      if (calculationMessage) {
          message.success(calculationMessage);
          loadExcelData();
      }
      if (calculationError) {
          message.error(calculationError);
      }
    }, [calculationMessage, calculationError]);

    const loadExcelData = async () => {
      setLoading(true);
      setError(null);
  
      try {
          const response = await request.get('/inaccuracy/download', {
              responseType: 'arraybuffer',
          });
  
          const data = new Uint8Array(response.data);
          const workbook = XLSX.read(data, { type: 'array' });
  
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
              throw new Error('Excel файл не содержит страниц');
          }
  
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
  
          if (!worksheet || !worksheet['!ref']) {
              throw new Error('Страница не содержит данных');
          }
  
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 1) {
              throw new Error('Нет данных для отображения');
          }
  
          const headers = jsonData[0];
          const generatedColumns = headers.map((header, index) => ({
              title: header,
              dataIndex: index.toString(),
              key: index.toString(),
              render: (text, record) => {
                  // Форматирование чисел для столбцов с погрешностями (колонки 2-4)
                  if (index >= 2 && index <= 4) {
                      if (text === null || text === undefined) return '-';
                      const num = typeof text === 'string' ? parseFloat(text.replace(',', '.')) : text;
                      return isNaN(num) ? '-' : num.toFixed(2).replace('.', ',');
                  }
                  return text || '-';
              },
              onHeaderCell: () => ({
                  style: {
                      backgroundColor: '#1890ff',
                      color: 'white',
                      fontWeight: 'bold',
                  }
              })
          }));
  
          const generatedData = jsonData.slice(1).map((row, rowIndex) => {
              const rowData = {};
              headers.forEach((_, colIndex) => {
                  // Преобразуем числа из строк в числа (если нужно)
                  let value = row[colIndex];
                  if (colIndex >= 2 && colIndex <= 4 && typeof value === 'string') {
                      value = parseFloat(value.replace(',', '.'));
                  }
                  rowData[colIndex.toString()] = value;
                  rowData.key = rowIndex.toString();
              });
              return rowData;
          });
  
          setColumns(generatedColumns);
          setTableData(generatedData);
      } catch (error) {
          setError(error.message || 'Ошибка при загрузке файла');
          console.error('Ошибка:', error);
      } finally {
          setLoading(false);
      }
  };

    const handleCalculate = async () => {
      await dispatch(calculateInaccuracies());
      loadExcelData()
  };

    const handleDownload = async () => {
        try {
            const response = await request.get('/inaccuracy/download', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'table.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Ошибка при скачивании файла:', error);
        }
    };

    return (
        <div className={styles.frameContent}>
            <div className={styles.topTitle}>
                Просмотр Excel файла
            </div>

            <div className={styles.controls}>
                {/* <div className={styles.statusIndicator}>
                    <Badge 
                        count={uncalculatedCount} 
                        style={{ 
                            backgroundColor: hasUncalculated ? '#f5222d' : '#52c41a'
                        }}
                    >
                        <span className={styles.statusText}>
                            {hasUncalculated 
                                ? `Ожидают расчета: ${uncalculatedCount}` 
                                : 'Все отчеты обработаны'}
                        </span>
                    </Badge>
                </div>
                <Button 
                    type="primary" 
                    className={styles.calculateButton} 
                    onClick={handleCalculate}
                    loading={calculationLoading}
                    disabled={!hasUncalculated}
                >
                    Рассчитать погрешности
                </Button> */}
                <Button 
                    type="primary" 
                    className={styles.homeButton} 
                    onClick={handleCalculate}
                    loading={calculationLoading}
                >
                    Обновить таблицу
                </Button>
                <Button 
                    type="primary" 
                    className={styles.homeButton} 
                    onClick={handleDownload}
                >
                    Скачать таблицу
                </Button>
            </div>

            <div className={styles.tableContainer}>
                {error ? (
                    <div className={styles.errorContainer}>
                        <div className={styles.errorText}>{error}</div>
                        <Button type="primary" onClick={loadExcelData}>
                            Попробовать снова
                        </Button>
                    </div>  
                ) : loading ? (
                    <Spin size="large" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={tableData}
                        bordered
                        size="middle"
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50', '100']
                        }}
                        style={{
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            borderRadius: '4px'
                        }}
                    />
                )}
            </div>
            <div className={styles.footer}>
                <Button 
                    type="default" 
                    className={styles.homeButton} 
                    onClick={onBack}
                >
                    Вернуться на главную
                </Button>
            </div>
        </div>
    );
};

export default ErrorCalculationFrame;