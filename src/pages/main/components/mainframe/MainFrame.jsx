import React from 'react';
import picture from "../../../../assets/pictures/MainFramePic.png"
import styles from './MainFrame.module.css';

const MainFrame = () => {
    return (
        <div className={styles.frameContent}>
            <div className={styles.topTitle}>
                Главная
            </div>
            <div className={styles.text}>
                В информационно - коммуникационной системе 
                осуществляется контроль качества проведённых испытаний 
                гироскопических систем 
            </div>
            <div className={styles.pictureContainer}>
                <img src={picture} alt="picture of main page" className={styles.picture}/>
            </div>
            
        </div>
    );
};

export default MainFrame;