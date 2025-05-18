import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchErrorData, fetchCorrelationMatrix } from '../../../../redux/slices/inaccuracy';
import { fetchProducts, updateProductStatus, checkProductsStatus } from '../../../../redux/slices/products';
import styles from './ErrorAnalysisFrame.module.css';
import { Button, List, Card, Spin, message, Table, Collapse, Tag, Tooltip } from 'antd';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    ScatterController
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SyncOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    ChartTooltip,
    Legend,
    ScatterController
);

// Вспомогательная функция для проверки и форматирования числовых значений
const formatNumber = (value, decimals = 3) => {
    if (value === null || value === undefined || isNaN(value)) {
        return 'Н/Д';
    }
    return Number(value).toFixed(decimals);
};

const ErrorAnalysisFrame = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('stats');
    const [chartType, setChartType] = useState('minus_50');
    const [selectedReason, setSelectedReason] = useState(null);
    const dispatch = useDispatch();
    const { errorData, loading: inaccuracyLoading, error: inaccuracyError } = useSelector(state => state.inaccuracy);
    const { correlationMatrix, correlationLoading, correlationError } = useSelector(state => state.inaccuracy);
    const { accepted, rejected, loading: productsLoading, error: productsError, statusCheck } = useSelector(state => state.products);

    useEffect(() => {
        dispatch(fetchErrorData());
    }, [dispatch]);

    useEffect(() => {
        if (activeTab === 'products') {
            dispatch(fetchProducts());
        } else if (activeTab === 'correlation') {
            dispatch(fetchCorrelationMatrix());
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

    const handleCheckStatus = async () => {
        try {
            const result = await dispatch(checkProductsStatus()).unwrap();
            message.success(`Проверено изделий: ${result.total_checked}, принято: ${result.accepted}, отклонено: ${result.rejected}`);
            // Обновляем список изделий после проверки
            dispatch(fetchProducts());
        } catch (error) {
            message.error('Не удалось проверить статус изделий');
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
                if (!isNaN(value)) {
                    scatterData.push({
                        x: year,
                        y: value
                    });
                }
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
                                return `μ = ${formatNumber(context.raw.y)}`;
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


    const renderCorrelationMatrix = () => {
        if (!correlationMatrix || !correlationMatrix.matrix) {
            return <div className={styles.noData}>Нет данных для отображения матрицы корреляций</div>;
        }

        const matrix = correlationMatrix.matrix;
        
        // Преобразование данных в формат с указанием температурного режима
        const formattedMatrix = {};
        
        // Задаем названия температурных режимов для идентификаторов
        const tempModes = {
            'minus_50': 'При -50°C',
            'plus_50': 'При +50°C',
            'nku': 'При НКУ'
        };
        
        // Преобразование матрицы для отображения с учетом температурных режимов
        Object.keys(matrix).forEach(factorKey => {
            // Определяем режим из ключа или используем стандартный
            let tempMode = 'unknown';
            for (const [modeKey, modeLabel] of Object.entries(tempModes)) {
                if (factorKey.toLowerCase().includes(modeKey.toLowerCase())) {
                    tempMode = modeKey;
                    break;
                }
            }
            
            // Создаем новый ключ с указанием температурного режима
            const newKey = `${factorKey} ${tempModes[tempMode] || ''}`;
            formattedMatrix[newKey] = matrix[factorKey];
        });

        // Получаем колонки из первого элемента матрицы
        const firstKey = Object.keys(formattedMatrix)[0];
        const columns = Object.keys(formattedMatrix[firstKey]).map(key => ({
            title: key,
            dataIndex: key,
            key: key,
            align: 'center',
            className: 'matrix-cell',
            render: (text) => {
                // Обработка null или undefined значений
                if (text === null || text === undefined) {
                    return {
                        props: {
                            className: 'ant-table-cell-no-data'
                        },
                        children: 'Н/Д'
                    };
                }
                
                if (typeof text === 'number') {
                    // Определяем класс ячейки на основе значения корреляции
                    let cellClassName = '';
                    if (Math.abs(text) >= 0.5) {
                        cellClassName = 'ant-table-cell-strong';
                    } else if (Math.abs(text) >= 0.3) {
                        cellClassName = 'ant-table-cell-medium';
                    } else {
                        cellClassName = 'ant-table-cell-weak';
                    }
                    
                    return {
                        props: {
                            className: cellClassName
                        },
                        children: formatNumber(text)
                    };
                }
                return text;
            }
        }));
        columns.unshift({
            className: 'ant-table-cell-title',
            title: '',
            dataIndex: 'factor',
            key: 'factor',
            fixed: 'left',
            width: 100
        });

        // Формируем данные для таблицы
        const dataSource = Object.keys(formattedMatrix).map((rowKey, index) => {
            const row = { 
                key: index.toString(),
                factor: rowKey
            };
            
            Object.keys(formattedMatrix[rowKey]).forEach(colKey => {
                row[colKey] = formattedMatrix[rowKey][colKey];
            });
            
            return row;
        });

        return (
            <div className={styles.matrixContainer}>
                <h3>Матрица коэффициентов корреляции</h3>
                <Table 
                    dataSource={dataSource} 
                    columns={columns} 
                    pagination={false}
                    bordered
                    size="middle"
                    className={styles.correlationTable}
                    scroll={{ x: 'max-content' }}
                />
            </div>
        );
    };

    const renderReasonsAndMeasures = () => {
        if (!correlationMatrix || !correlationMatrix.reasons || correlationMatrix.reasons.length === 0) {
            return <div className={styles.noData}>Нет данных о причинах погрешностей</div>;
        }

        const viewMeasures = (index) => {
            setSelectedReason(selectedReason === index ? null : index);
        };

        return (
            <div className={styles.reasonsContainer}>
                <h3>Причины возникновения погрешностей и мероприятия по их устранению</h3>
                <div className={styles.reasonsTable}>
                    <div className={styles.reasonsTableHeader}>
                        <div className={styles.reasonsTableCell}>Причины</div>
                        <div className={styles.reasonsTableCell}>Мероприятия</div>
                    </div>
                    {correlationMatrix.reasons.map((reason, index) => (
                        <div key={index} className={styles.reasonsTableRow}>
                            <div className={styles.reasonsTableCell}>{reason.title}</div>
                            <div className={styles.reasonsTableCell}>
                                <Button
                                    type="primary"
                                    className={styles.viewMeasuresButton}
                                    onClick={() => viewMeasures(index)}
                                >
                                    Посмотреть мероприятия
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {selectedReason !== null && (
                    <>
                        <div className={styles.overlay} onClick={() => setSelectedReason(null)}></div>
                        <div className={styles.measuresPopup}>
                            <div className={styles.measuresPopupHeader}>
                                <h4>{correlationMatrix.reasons[selectedReason].title}</h4>
                                <Button 
                                    type="text" 
                                    onClick={() => setSelectedReason(null)}
                                    className={styles.closeButton}
                                >
                                    ×
                                </Button>
                            </div>
                            <p className={styles.reasonDescription}>
                                {correlationMatrix.reasons[selectedReason].description}
                            </p>
                            <List
                                dataSource={correlationMatrix.reasons[selectedReason].measures}
                                renderItem={(measure, idx) => (
                                    <List.Item key={idx}>
                                        <Card 
                                            title={<Tag color="blue">{measure.title}</Tag>}
                                            className={styles.measureCard}
                                        >
                                            {measure.description}
                                        </Card>
                                    </List.Item>
                                )}
                            />
                            <div style={{ textAlign: 'center', marginTop: 20 }}>
                                <Button
                                    className={styles.closePopupButton}
                                    onClick={() => setSelectedReason(null)}
                                >
                                    закрыть
                                </Button>
                            </div>
                        </div>
                    </>
                )}
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
                <div className={styles.productsHeader}>
                    <h2>Статус изделий</h2>
                    <Tooltip title="Проверить статус новых изделий">
                        <Button
                            type="primary"
                            icon={<SyncOutlined spin={statusCheck.loading} />}
                            onClick={handleCheckStatus}
                            loading={statusCheck.loading}
                            className={styles.checkStatusButton}
                        >
                            Проверить новые изделия
                        </Button>
                    </Tooltip>
                </div>
                {statusCheck.lastCheck && (
                    <div className={styles.lastCheckInfo}>
                        Последняя проверка: {new Date(statusCheck.lastCheck).toLocaleString()}
                    </div>
                )}
                <div className={styles.productsListsContainer}>
                    <div className={styles.productList}>
                        <h2>Принятые изделия</h2>
                        <List
                            dataSource={accepted}
                            renderItem={item => (
                                <List.Item>
                                    <Card className={styles.productCard}>
                                        <h3>Изделие №{item.system_number}</h3>
                                        <p>Тип: {item.system_type || 'Не указан'}</p>
                                        <p>Часть: {item.department || 'Не указана'}</p>
                                        <p>Дата теста: {item.test_date || 'Не указана'}</p>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </div>

                    <div className={styles.productList}>
                        <h2>Непринятые изделия</h2>
                        <List
                            dataSource={rejected}
                            renderItem={item => (
                                <List.Item>
                                    <Card className={styles.productCard}>
                                        <h3>Изделие №{item.system_number}</h3>
                                        <p>Тип: {item.system_type || 'Не указан'}</p>
                                        <p>Часть: {item.department || 'Не указана'}</p>
                                        <p>Дата теста: {item.test_date || 'Не указана'}</p>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.frameContent}>
            <div className={styles.topTitle}>
                Анализ погрешностей
            </div>

            <div className={styles.tabs}>
                <Button
                    type={activeTab === 'products' ? 'primary' : 'default'}
                    onClick={() => setActiveTab('products')}
                    className={styles.homeButton}
                >
                    (Не)принятые изделия
                </Button>
                <Button
                    type={activeTab === 'stats' ? 'primary' : 'default'}
                    onClick={() => setActiveTab('stats')}
                    className={styles.homeButton}
                >
                    Статистика
                </Button>
                <Button
                    type={activeTab === 'correlation' ? 'primary' : 'default'}
                    onClick={() => setActiveTab('correlation')}
                    className={styles.homeButton}
                >
                    Корреляция
                </Button>
            </div>

            {activeTab === 'products' && renderProductsTab()}

            {activeTab === 'stats' && (
                <div className={styles.statsContainer}>
                    {inaccuracyLoading ? (
                        <div className={styles.loading}><Spin size="large" tip="Загрузка данных..." /></div>
                    ) : inaccuracyError ? (
                        <div className={styles.error}>{inaccuracyError}</div>
                    ) : (
                        <>
                            <div className={styles.chartControls}>
                                <Button 
                                    type={chartType === 'minus_50' ? 'primary' : 'default'}
                                    onClick={() => setChartType('minus_50')}
                                    className={styles.homeButton}
                                >
                                    -50°C
                                </Button>
                                <Button 
                                    type={chartType === 'plus_50' ? 'primary' : 'default'}
                                    onClick={() => setChartType('plus_50')}
                                    className={styles.homeButton}
                                >
                                    +50°C
                                </Button>
                                <Button 
                                    type={chartType === 'nku' ? 'primary' : 'default'}
                                    onClick={() => setChartType('nku')}
                                    className={styles.homeButton}
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
                    {correlationLoading || inaccuracyLoading ? (
                        <div className={styles.loading}><Spin size="large" tip="Загрузка данных..." /></div>
                    ) : correlationError || inaccuracyError ? (
                        <div className={styles.error}>{correlationError || inaccuracyError}</div>
                    ) : (
                        <>
                            {/* Отображение матрицы корреляций */}
                            {renderCorrelationMatrix()}
                            
                            {/* Отображение причин и мероприятий */}
                            {renderReasonsAndMeasures()}
                        </>
                    )}
                </div>
            )}
            
            <Button onClick={onBack} className={styles.backButton}>Вернуться на главную</Button>
        </div>
    );
};

export default ErrorAnalysisFrame;