import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LineChart from '../components/LineChart'; // Ensure this path is correct

function Projections(props) {
    const [weeksAhead, setWeeksAhead] = useState(52); // Defaulting to showing a full year
    const [totalRevenue, setTotalRevenue] = useState('');
    const [projections, setProjections] = useState([]);
    const [lineChartData, setLineChartData] = useState({ datasets: [] });
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        axios({
            method: "GET",
            url: `/projections?weeks_ahead=${weeksAhead}`,
            headers: {
                Authorization: 'Bearer ' + props.token,
            },
        })
        // stores the values from /projection to be displayed on the table and graph
        .then(response => {
            const { 'User Revenue Projections': userProjections, 'Weekly Revenue Projections': weeklyRevenue, 'Monthly Revenue Projections': monthlyRevenue } = response.data;

            // Calculate the total of all users' expected revenues
            const totalUserRevenue = userProjections.reduce((total, user) => total + user['Expected Revenue'], 0);
            setTotalRevenue(totalUserRevenue);
            setProjections(userProjections);
    
            let labels = ['Week 0'];
            let data = [0]; 
            // displays weeks on the x-axis if the weeks ahead is less than 14 to help with sizing
            if (weeksAhead < 14) {
                labels = [...labels, ...weeklyRevenue.map(week => `Week ${week['Week']}`)];
                data = [...data, ...weeklyRevenue.map(week => week['Accumulated Revenue'])];
            } else {
                labels = [ ...monthlyRevenue.map(month => `${month['Month']}`)];
                data = [ ...monthlyRevenue.map(month => month['Accumulated Revenue'])];
            }

            // sizing for the graph
            const options = {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: weeksAhead < 14 ? 'Weeks' : 'Months',
                            color: '#000',
                            font: {
                                size: 14,
                            },
                        },
                        ticks: {
                            maxRotation: 90,
                            minRotation: 90,
                            autoSkip: false,
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Revenue (£)',
                            color: '#000',
                            font: {
                                size: 14,
                            },
                        },
                        beginAtZero: true,
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                responsive: true,
                maintainAspectRatio: false,
            };
            
            setLineChartData({
                labels: labels,
                datasets: [{
                    label: 'Accumulated Revenue',
                    data: data,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                }],
            });

            setChartOptions(options);
        })
        .catch(error => {
            console.error("There was an error fetching the projections!", error);
        });
    }, [props.token, weeksAhead]);

        
    
    return (
        <div className="min-h-screen text-center p-5 bg-blue-100 text-black">
            <h1 className="py-2 text-2xl font-semibold mt-[-20px]">Revenue Projections</h1>
            <div className="flex justify-around items-start flex-wrap bg-blue-300 rounded-xl p-5">
                <div className="flex-1 mt-12 min-w-[300px] max-w-[60%] rounded-xl m-2.5">
                            <LineChart chartData={lineChartData} chartOptions={chartOptions} />
                        </div>
                        <div className="flex-1 min-w-[300px] mt-[100px] max-w-[40%] p-2.5 overflow-x-auto m-2.5 relative">
                            <h2 className="text-black mb-4 text-xl font-semibold">{weeksAhead} Week(s) Ahead</h2>
                            <div className="flex justify-center items-center text-gray-800 mt-4 mb-8">
                                <button className="bg-blue-800 border-none text-white py-2 px-4 rounded cursor-pointer transition-colors duration-300 ease-linear mx-2 hover:bg-blue-600 active:scale-95"
                                    onClick={() => setWeeksAhead(prevWeeks => Math.max(1, prevWeeks - 1))}>
                                    <strong>-</strong>
                                </button>
                                <label htmlFor='weeksInput' className='text-blue-300'>.</label>
                                <input
                                    id = "weeksInput"
                                    type="number"
                                    value={weeksAhead}
                                    className="w-20 text-center py-2 px-3 rounded border border-gray-300 mx-2 bg-white"
                                    onChange={(e) => setWeeksAhead(Math.max(1, Math.min(52, parseInt(e.target.value, 10) || 1)))}
                                    min="1"
                                    max="52"
                                />
                                <button className="bg-blue-800 border-none text-white py-2 px-4 rounded cursor-pointer transition-colors duration-300 ease-linear mx-2 hover:bg-blue-600 active:scale-95"
                                    onClick={() => setWeeksAhead(prevWeeks => Math.min(52, prevWeeks + 1))}>
                                    <strong>+</strong>
                                </button>
                            </div>
                            <div className="table-scrollable max-h-[425px] overflow-y-auto">
                                <table className="w-3/5 border-collapse bg-white border border-white rounded m-auto">
                                    <thead className="sticky top-0 bg-gray-100">
                                        <tr>
                                            <th className="border-b border-gray-200 py-2 px-4 text-gray-800 border-r">Username</th>
                                            <th className="border-b border-gray-200 py-2 px-4 text-gray-800">Expected Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projections.map((projection, index) => (
                                            <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'} border-b border-gray-200 px-4 text-gray-800 h-10`}>
                                                <td className="border-r">{projection['User']}</td>
                                                <td>£{projection['Expected Revenue']}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                        
                                <tbody>
                                    <tr className="bg-blue-100 text-black font-bold h-10">
                                        <td className="border-r py-2 px-4 text-gray-800 w-1/2 ">Total Revenue</td>
                                        <td className="py-2 px-4 text-gray-800">£{totalRevenue}</td>
                                    </tr>
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </div>
                </div>

        );
        
}
export default Projections;
