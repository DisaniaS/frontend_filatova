import React, { useState } from 'react';
import styles from './Components.module.css';
import request from '../../../../../utils/Request';
import iconDownload from '../../../../../assets/pictures/iconDownload.png';
import iconPreview from '../../../../../assets/pictures/iconPreview.png';
import { Modal } from 'antd';
import mammoth from 'mammoth';

const Card = ({ id, reportNumber, createdBy, createdAt }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileContent, setFileContent] = useState('');

  const handleDownload = async () => {
    try {
      const response = await request.get(`/reports/download/${id}`, {
        responseType: 'blob'
      });
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = `Изделие ${reportNumber}.docx`;

      if (contentDisposition && contentDisposition.includes('filename=')) {
        fileName = contentDisposition
          .split('filename=')[1]
          .split(';')[0]
          .replace(/['"]/g, '');
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Произошла ошибка при скачивании отчёта');
    }
  };

  const handlePreview = async () => {
    try {
      const response = await request.get(`/reports/download/${id}`, {
        responseType: 'arraybuffer'
      });
      const arrayBuffer = response.data;
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setFileContent(result.value); // HTML содержимое файла
      setIsModalVisible(true);
    } catch (error) {
      alert('Ошибка при загрузке для предпросмотра');
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <h3 className={styles.productNumber}>Изделие №{reportNumber}</h3>
        <div className={styles.cardInfo}>
          <p className={styles.creatorInfo}>{createdBy}</p>
          <p className={styles.dateInfo}>{new Date(createdAt).toLocaleString()}</p>
        </div>
      </div>
      <div className={styles.cardButtons}>
        <img src={iconPreview} className={styles.downloadButton} onClick={handlePreview} alt='Предпросмотр отчёта' />
        <img src={iconDownload} className={styles.downloadButton} onClick={handleDownload} alt='Скачать отчет' />
      </div>
      

      <Modal
        width="70%"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <div className={styles.modalContent} dangerouslySetInnerHTML={{ __html: fileContent }} />
      </Modal>
    </div>
  );
};

export default Card;