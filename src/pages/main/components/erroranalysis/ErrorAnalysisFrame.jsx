// import React, { useState, useEffect, useRef } from 'react';
// import styles from './ErrorAnalysisFrame.module.css';
// import { Button } from 'antd';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchErrorData } from '../../../../redux/slices/inaccuracy';
// import Chart from 'chart.js/auto';

// const ErrorAnalysisFrame = ({ onBack }) => {
//   const [activeTab, setActiveTab] = useState('products');
//   const [chartType, setChartType] = useState('minus_50');
//   const chartRef = useRef(null);
//   const chartInstance = useRef(null);
  
//   const dispatch = useDispatch();
//   const { errorData, loading, error } = useSelector(state => state.inaccuracy);

//   // Заглушки данных
//   const acceptedProducts = ['Изделие №123', 'Изделие №456', 'Изделие №789'];
//   const rejectedProducts = ['Изделие №321', 'Изделие №654'];

//   useEffect(() => {
//     dispatch(fetchErrorData());
//   }, [dispatch]);

//   const createErrorChart = (data) => {
//     if (!data || !data.yearly_data) return null;

//     const years = Object.keys(data.yearly_data).sort();
//     const datasets = [
//         {
//             label: 'μ при -50°C',
//             data: years.map(year => ({
//                 x: year,
//                 y: data.yearly_data[year].minus_50
//             })),
//             borderColor: 'rgba(255, 99, 132, 1)',
//             backgroundColor: 'rgba(255, 99, 132, 0.2)',
//         },
//         {
//             label: 'μ при +50°C',
//             data: years.map(year => ({
//                 x: year,
//                 y: data.yearly_data[year].plus_50
//             })),
//             borderColor: 'rgba(54, 162, 235, 1)',
//             backgroundColor: 'rgba(54, 162, 235, 0.2)',
//         },
//         {
//             label: 'μ при НКУ',
//             data: years.map(year => ({
//                 x: year,
//                 y: data.yearly_data[year].nku
//             })),
//             borderColor: 'rgba(75, 192, 192, 1)',
//             backgroundColor: 'rgba(75, 192, 192, 0.2)',
//         }
//     ];

//     return {
//         type: 'line',
//         data: { datasets },
//         options: {
//             responsive: true,
//             scales: {
//                 x: {
//                     type: 'linear',
//                     title: {
//                         display: true,
//                         text: 'Год'
//                     }
//                 },
//                 y: {
//                     title: {
//                         display: true,
//                         text: 'μ (отношение погрешности к допустимому значению)'
//                     },
//                     min: 0,
//                     max: 1
//                 }
//             },
//             plugins: {
//                 tooltip: {
//                     callbacks: {
//                         label: (context) => {
//                             const year = context.parsed.x;
//                             const mode = context.dataset.label.includes('-50') ? 'minus_50' :
//                                        context.dataset.label.includes('+50') ? 'plus_50' : 'nku';
//                             return [
//                                 `${context.dataset.label}: ${context.parsed.y.toFixed(3)}`,
//                                 `Количество измерений: ${data.yearly_data[year].count[mode]}`
//                             ];
//                         }
//                     }
//                 }
//             }
//         }
//     };
// };

// const renderCorrelationInfo = () => {
//     if (!errorData || !errorData.correlations) return null;

//     return (
//         <div className={styles.correlationInfo}>
//             {Object.entries(errorData.correlations).map(([temp, data]) => (
//                 <div key={temp} className={styles.correlationBlock}>
//                     <h3>{temp === 'minus_50' ? '-50°C' : temp === 'plus_50' ? '+50°C' : 'НКУ'}</h3>
//                     <p>Корреляция с влажностью: {data.humidity.toFixed(3)}</p>
//                     <p>Корреляция с годом: {data.year.toFixed(3)}</p>
//                     <div>
//                         <h4>Средние значения по типам изделий:</h4>
//                         {Object.entries(data.types).map(([type, value]) => (
//                             <p key={type}>{type}: {value.toFixed(3)}</p>
//                         ))}
//                     </div>
//                     <div>
//                         <h4>Средние значения по частям:</h4>
//                         {Object.entries(data.departments).map(([dept, value]) => (
//                             <p key={dept}>{dept}: {value.toFixed(3)}</p>
//                         ))}
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// };

//   useEffect(() => {
//     if (errorData && activeTab === 'stats') {
//       const chartData = {
//         'minus_50': { data: errorData.minus_50, label: 'Погрешности при -50°C' },
//         'plus_50': { data: errorData.plus_50, label: 'Погрешности при +50°C' },
//         'nku': { data: errorData.nku, label: 'Погрешности при НКУ' }
//       };

//       const selectedChart = chartData[chartType];
//       if (selectedChart) {
//         createChart(selectedChart.data, selectedChart.label);
//       }
//     }
//   }, [errorData, chartType, activeTab]);

//   const getStatsInfo = (type) => {
//     if (!errorData) return null;
//     const stats = errorData[`${type}_stats`];
//     if (!stats) return null;

//     return (
//       <div className={styles.statsInfo}>
//         <p>Минимальная погрешность: {stats.min_error.toFixed(4)}</p>
//         <p>Максимальная погрешность: {stats.max_error.toFixed(4)}</p>
//         <p>Средняя погрешность: {stats.avg_error.toFixed(4)}</p>
//         <p>Всего измерений: {stats.total_measurements}</p>
//       </div>
//     );
//   };
  
//   return (
//     <div className={styles.frameContent}>
//       <div className={styles.topTitle}>
//         Анализ погрешностей
//       </div>

//       <div className={styles.tabs}>
//         <Button
//           type={activeTab === 'products' ? 'primary' : 'default'}
//           onClick={() => setActiveTab('products')}
//         >
//           (Не)принятые изделия
//         </Button>
//         <Button
//           type={activeTab === 'stats' ? 'primary' : 'default'}
//           onClick={() => setActiveTab('stats')}
//         >
//           Статистика
//         </Button>
//         <Button
//           type={activeTab === 'correlation' ? 'primary' : 'default'}
//           onClick={() => setActiveTab('correlation')}
//         >
//           Корреляция
//         </Button>
//       </div>

//       {activeTab === 'products' && (
//         <div className={styles.productsContainer}>
//           <div className={styles.productList}>
//             <h3>Принятые изделия</h3>
//             {acceptedProducts.map((product, index) => (
//               <div key={index} className={styles.productItem}>
//                 {product}
//               </div>
//             ))}
//           </div>
          
//           <div className={styles.productList}>
//             <h3>Непринятые изделия</h3>
//             {rejectedProducts.map((product, index) => (
//               <div key={index} className={styles.productItem}>
//                 {product}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {activeTab === 'stats' && (
//         <div className={styles.statsContainer}>
//           <div className={styles.chartContainer}>
//             {loading ? (
//               <div className={styles.loading}>Загрузка данных...</div>
//             ) : error ? (
//               <div className={styles.error}>{error}</div>
//             ) : (
//               <>
//                 <canvas ref={chartRef} className={styles.chart} />
//                 {getStatsInfo(chartType)}
//               </>
//             )}
            
//             <div className={styles.chartControls}>
//               <Button 
//                 type={chartType === 'minus_50' ? 'primary' : 'default'}
//                 onClick={() => setChartType('minus_50')}
//               >
//                 -50°C
//               </Button>
//               <Button 
//                 type={chartType === 'plus_50' ? 'primary' : 'default'}
//                 onClick={() => setChartType('plus_50')}
//               >
//                 +50°C
//               </Button>
//               <Button 
//                 type={chartType === 'nku' ? 'primary' : 'default'}
//                 onClick={() => setChartType('nku')}
//               >
//                 НКУ
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {activeTab === 'correlation' && (
//         <div className={styles.correlationContainer}>
//           <h3>Раздел корреляций (в разработке)</h3>
//         </div>
//       )}

//       <div className={styles.footer}>
//         <Button className={styles.homeButton} onClick={onBack}>
//           Вернуться на главную
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default ErrorAnalysisFrame;
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchErrorData } from '../../../../redux/slices/inaccuracy';
import styles from './ErrorAnalysisFrame.module.css';
import { Button } from 'antd';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ScatterController // Добавляем этот импорт
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
    ScatterController // Регистрируем ScatterController
);

const ErrorAnalysisFrame = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('stats');
    const [chartType, setChartType] = useState('minus_50');
    const dispatch = useDispatch();
    const { errorData, loading, error } = useSelector(state => state.inaccuracy);

    useEffect(() => {
        dispatch(fetchErrorData());
        console.log(errorData)
    }, [dispatch]);

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

            {activeTab === 'stats' && (
                <div className={styles.statsContainer}>
                    {loading ? (
                        <div className={styles.loading}>Загрузка данных...</div>
                    ) : error ? (
                        <div className={styles.error}>{error}</div>
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
            
            <Button onClick={onBack}>Вернуться на главную</Button>
            
        </div>
    );
};

export default ErrorAnalysisFrame;