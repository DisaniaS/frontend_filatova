import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Button, Table } from 'antd';
import styles from './ErrorCalculationFrame.module.css';
import request from '../../../../utils/Request';

const ErrorCalculationFrame = ({ onBack }) => {
    const [htmlContent, setHtmlContent] = useState(''); // HTML для отображения
    const [loading, setLoading] = useState(false); // Состояние загрузки
    const [error, setError] = useState(null); // Ошибка
  
    useEffect(() => {
        loadExcelFile();
      }, []);

    // Функция для загрузки и отображения Excel файла
    const loadExcelFile = async () => {
      setLoading(true);
      setError(null);
  
      try {
        // Загружаем файл Excel с сервера
        const response = await request.get('/inaccuracy/download', {
          responseType: 'arraybuffer', // Важно: указываем тип ответа как arraybuffer
        });
  
        // Парсим файл Excel
        const data = new Uint8Array(response.data);
        const workbook = XLSX.read(data, { type: 'array' });
  
        // Получаем первую страницу (sheet) из файла
        const sheetName = workbook.SheetNames[1];
        const worksheet = workbook.Sheets[sheetName];
  
        // Преобразуем данные из Excel в HTML
        const html = XLSX.utils.sheet_to_html(worksheet); // Конвертация в HTML
        setHtmlContent(html); // Сохраняем HTML в состояние
      } catch (error) {
        setError('Ошибка при загрузке файла');
        console.error('Ошибка:', error);
      } finally {
        setLoading(false);
      }
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
            <Button className={styles.homeButton} onClick={loadExcelFile} loading={loading}>
            Обновить таблицу
            </Button>
            <Button className={styles.homeButton} onClick={handleDownload}>
            Скачать таблицу
            </Button>
        </div>
  
        <div className={styles.tableContainer}>
          {error ? (
            <div className={styles.errorContainer}>
              <div className={styles.errorText}>{error}</div>
            </div>  
          ) : (
            <div
              className={styles.excelContent}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </div>
        <div className={styles.footer}>
            <Button className={styles.homeButton} onClick={onBack}>
            Вернуться на главную
            </Button>
        </div>
      </div>
    );
  };
  

export default ErrorCalculationFrame;