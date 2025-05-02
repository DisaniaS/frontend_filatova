import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchErrorData } from '../../../../redux/slices/inaccuracy';
import { fetchProducts, updateProductStatus } from '../../../../redux/slices/products';
import styles from './ErrorAnalysisFrame.module.css';
import { Button, List, Card, Spin, message } from 'antd';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ScatterController
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ScatterController
);

const ErrorAnalysisFrame = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('stats');
    const [chartType, setChartType] = useState('minus_50');
    const dispatch = useDispatch();
    const { errorData, loading: inaccuracyLoading, error: inaccuracyError } = useSelector(state => state.inaccuracy);
    const { accepted, rejected, loading: productsLoading, error: productsError } = useSelector(state => state.products);

    useEffect(() => {
        dispatch(fetchErrorData());
    }, [dispatch]);

    useEffect(() => {
        if (activeTab === 'products') {
            dispatch(fetchProducts());
        }
    }, [activeTab, dispatch]);

    const handleProductStatusChange = async (productId, newStatus) => {
        try {
            await dispatch(updateProductStatus({ productId, isAccepted: newStatus })).unwrap();
            message.success(`Статус изделия успешно изменен`);
            dispatch(fetchProducts());
        } catch (error) {
            message.error('Не удалось изменить статус изделия');
        }
    };

    const createChartData = (data, tempMode) => {
        if (!data || !data.yearly_data) return null;
    
        const years = Object.keys(data.yearly_data).sort();
        
        // Создаем массив всех точек для каждого года
        const datasets = [];
        
        // Создаем основной датасет для линии тренда (средние значения)
        const averageValues = years.map(year => {
            const values = data.yearly_data[year][tempMode];
            return values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;
        });
    
        // Создаем датасет для точек (все значения)
        const scatterData = [];
        years.forEach(year => {
            const yearValues = data.yearly_data[year][tempMode];
            yearValues.forEach(value => {
                scatterData.push({
                    x: year,
                    y: value
                });
            });
        });
    
        const colors = {
            'minus_50': 'rgb(54, 162, 235)',
            'plus_50': 'rgb(255, 99, 132)',
            'nku': 'rgb(75, 192, 192)'
        };
    
        const titles = {
            'minus_50': 'Соотношение полученных погрешностей азимута при -50°C',
            'plus_50': 'Соотношение полученных погрешностей азимута при +50°C',
            'nku': 'Соотношение полученных погрешностей азимута при НКУ'
        };
    
        return {
            data: {
                labels: years,
                datasets: [
                    {
                        type: 'line',
                        label: 'Среднее значение μ',
                        data: averageValues,
                        borderColor: colors[tempMode],
                        backgroundColor: colors[tempMode],
                        borderWidth: 1,
                        tension: 0.1,
                        pointRadius: 0
                    },
                    {
                        type: 'scatter',
                        label: 'Значения μ',
                        data: scatterData,
                        borderColor: colors[tempMode],
                        backgroundColor: colors[tempMode],
                        pointRadius: 5,
                        pointHoverRadius: 8,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: titles[tempMode],
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `μ = ${context.raw.y.toFixed(3)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Год',
                            font: {
                                size: 14
                            }
                        },
                        type: 'linear',
                        min: 2012,
                        max: 2024,
                        ticks: {
                            stepSize: 2
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'μ (отношение погрешности к допустимому значению)',
                            font: {
                                size: 14
                            }
                        },
                        min: 0,
                        max: 1.5,
                        ticks: {
                            stepSize: 0.5
                        }
                    }
                }
            }
        };
    };

    const renderCorrelationInfo = () => {
        if (!errorData?.correlations || !errorData.correlations[chartType]) return null;

        const correlationData = errorData.correlations[chartType];
        return (
            <div className={styles.correlationInfo}>
                <h3>Корреляционный анализ для {
                    chartType === 'minus_50' ? '-50°C' : 
                    chartType === 'plus_50' ? '+50°C' : 'НКУ'
                }</h3>
                <p>Корреляция с влажностью: {correlationData.humidity?.toFixed(3) || 'Н/Д'}</p>
                <p>Корреляция с годом выпуска: {correlationData.year?.toFixed(3) || 'Н/Д'}</p>
                <div className={styles.correlationDetails}>
                    <div>
                        <h4>Средние значения по типам изделий:</h4>
                        {Object.entries(correlationData.types || {}).map(([type, value]) => (
                            <p key={type}>{type}: {value.toFixed(3)}</p>
                        ))}
                    </div>
                    <div>
                        <h4>Средние значения по частям:</h4>
                        {Object.entries(correlationData.departments || {}).map(([dept, value]) => (
                            <p key={dept}>{dept}: {value.toFixed(3)}</p>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderProductsTab = () => {
        if (productsLoading) {
            return <div className={styles.loading}><Spin size="large" /></div>;
        }

        if (productsError) {
            return <div className={styles.error}>{productsError}</div>;
        }

        return (
            <div className={styles.productsContainer}>
                <div className={styles.productList}>
                    <h2 className={styles.listTitle}>Принятые изделия</h2>
                    <List
                        dataSource={accepted}
                        renderItem={item => (
                            <List.Item>
                                <Card 
                                    className={styles.productCard}
                                    actions={[
                                        <Button 
                                            danger 
                                            onClick={() => handleProductStatusChange(item.id, false)}
                                        >
                                            Отклонить
                                        </Button>
                                    ]}
                                >
                                    {item.name}
                                </Card>
                            </List.Item>
                        )}
                    />
                </div>

                <div className={styles.productList}>
                    <h2 className={styles.listTitle}>Непринятые изделия</h2>
                    <List
                        dataSource={rejected}
                        renderItem={item => (
                            <List.Item>
                                <Card 
                                    className={styles.productCard}
                                    actions={[
                                        <Button 
                                            type="primary" 
                                            onClick={() => handleProductStatusChange(item.id, true)}
                                        >
                                            Принять
                                        </Button>
                                    ]}
                                >
                                    {item.name}
                                </Card>
                            </List.Item>
                        )}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className={styles.frameContent}>
            <div className={styles.topTitle}>
                <h2>Анализ погрешностей</h2>
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

            {activeTab === 'products' && renderProductsTab()}

            {activeTab === 'stats' && (
                <div className={styles.statsContainer}>
                    {inaccuracyLoading ? (
                        <div className={styles.loading}>Загрузка данных...</div>
                    ) : inaccuracyError ? (
                        <div className={styles.error}>{inaccuracyError}</div>
                    ) : (
                        <>
                            <div className={styles.chartControls}>
                                <Button 
                                    type={chartType === 'minus_50' ? 'primary' : 'default'}
                                    onClick={() => setChartType('minus_50')}
                                >
                                    -50°C
                                </Button>
                                <Button 
                                    type={chartType === 'plus_50' ? 'primary' : 'default'}
                                    onClick={() => setChartType('plus_50')}
                                >
                                    +50°C
                                </Button>
                                <Button 
                                    type={chartType === 'nku' ? 'primary' : 'default'}
                                    onClick={() => setChartType('nku')}
                                >
                                    НКУ
                                </Button>
                            </div>
                            <div className={styles.chartContainer}>
                                {errorData && <Line {...createChartData(errorData, chartType)} />}
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'correlation' && (
                <div className={styles.correlationContainer}>
                    {inaccuracyLoading ? (
                        <div className={styles.loading}>Загрузка данных...</div>
                    ) : inaccuracyError ? (
                        <div className={styles.error}>{inaccuracyError}</div>
                    ) : (
                        <>
                            <div className={styles.chartControls}>
                                <Button 
                                    type={chartType === 'minus_50' ? 'primary' : 'default'}
                                    onClick={() => setChartType('minus_50')}
                                >
                                    -50°C
                                </Button>
                                <Button 
                                    type={chartType === 'plus_50' ? 'primary' : 'default'}
                                    onClick={() => setChartType('plus_50')}
                                >
                                    +50°C
                                </Button>
                                <Button 
                                    type={chartType === 'nku' ? 'primary' : 'default'}
                                    onClick={() => setChartType('nku')}
                                >
                                    НКУ
                                </Button>
                            </div>
                            {renderCorrelationInfo()}
                        </>
                    )}
                </div>
            )}
            
            <Button onClick={onBack} className={styles.backButton}>Вернуться на главную</Button>
        </div>
    );
};

export default ErrorAnalysisFrame;