import React, { useEffect, useState } from 'react';
import { Card, Spin } from 'antd';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import request from '../../../../utils/Request';
import styles from './ErrorAnalysisFrame.module.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const DepartmentStatsChart = () => {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await request.get('/product/status');
                const { accepted, rejected } = response.data;

                // Группируем данные по подразделениям
                const departmentStats = {};
                
                // Обрабатываем принятые изделия
                accepted.forEach(product => {
                    if (!departmentStats[product.department]) {
                        departmentStats[product.department] = { accepted: 0, rejected: 0 };
                    }
                    departmentStats[product.department].accepted++;
                });

                // Обрабатываем непринятые изделия
                rejected.forEach(product => {
                    if (!departmentStats[product.department]) {
                        departmentStats[product.department] = { accepted: 0, rejected: 0 };
                    }
                    departmentStats[product.department].rejected++;
                });

                // Подготавливаем данные для графика
                const departments = Object.keys(departmentStats);
                const acceptedData = departments.map(dept => departmentStats[dept].accepted);
                const rejectedData = departments.map(dept => departmentStats[dept].rejected);

                setChartData({
                    labels: departments,
                    datasets: [
                        {
                            label: 'Принято',
                            data: acceptedData,
                            backgroundColor: '#52c41a',
                            borderColor: '#52c41a',
                            borderWidth: 1
                        },
                        {
                            label: 'Не принято',
                            data: rejectedData,
                            backgroundColor: '#f5222d',
                            borderColor: '#f5222d',
                            borderWidth: 1
                        }
                    ]
                });
            } catch (error) {
                console.error('Ошибка при загрузке статистики:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Статистика по подразделениям',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw} изделий`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Количество изделий',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Подразделение',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            }
        }
    };

    return (
        <div className={styles.statsChartContainer}>
            {loading ? (
                <div className={styles.chartLoading}>
                    <Spin size="large" />
                </div>
            ) : (
                <Bar data={chartData} options={options} />
            )}
        </div>
    );
};

export default DepartmentStatsChart; 