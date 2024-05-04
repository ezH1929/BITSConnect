import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import NavigationBar from '../components/NavBar';
import "../assets/styles/Admin.css";

// Register chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend
);

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [modalContent, setModalContent] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');

    // Prepare initial chart data and options
    const [chartData, setChartData] = useState({
        bar: {
            labels: ['Users', 'Groups'],
            datasets: [{ label: 'Count', data: [0, 0], backgroundColor: ['#FF6384', '#36A2EB'] }]
        },
        pie: {
            labels: ['Active Users', 'Inactive Users'],
            datasets: [{ data: [0, 0], backgroundColor: ['#FFCE56', '#FF6384'] }]
        },
        line: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{ label: 'Monthly Signups', data: [0, 0, 0, 0, 0], borderColor: '#36A2EB', fill: false }]
        }
    });

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top' } },
        scales: { y: { beginAtZero: true } }
    };

    useEffect(() => {
        async function fetchData() {
            const userResponse = await fetch('http://localhost:3001/api/admin/users', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const groupResponse = await fetch('http://localhost:3001/api/admin/groups', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const usersData = await userResponse.json();
            const groupsData = await groupResponse.json();

            setUsers(usersData);
            setGroups(groupsData);

            setChartData(prevChartData => ({
                ...prevChartData,
                bar: { ...prevChartData.bar, datasets: [{ ...prevChartData.bar.datasets[0], data: [usersData.length, groupsData.length] }] },
                pie: { ...prevChartData.pie, datasets: [{ ...prevChartData.pie.datasets[0], data: [usersData.filter(u => u.isActive).length, usersData.filter(u => !u.isActive).length] }] },
                line: { ...prevChartData.line, datasets: [{ ...prevChartData.line.datasets[0], data: [10, 20, 30, 40, 50] }] } // Example data
            }));
        }
        fetchData();
    }, []);

    const openModal = type => {
        setModalType(type);
        setModalContent(type === 'users' ? users : groups);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        const endpoint = modalType === 'users' ? 'users' : 'groups';
        const url = `https://bitsconnect.onrender.com/api/admin/${endpoint}/${id}`;
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to delete');

            const filterFunc = item => item._id !== id;
            if (modalType === 'users') {
                setUsers(prev => prev.filter(filterFunc));
            } else {
                setGroups(prev => prev.filter(filterFunc));
            }
            setModalContent(prev => prev.filter(filterFunc));
            closeModal();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete. Please try again.');
        }
    };

    return (
        <div>
            <NavigationBar />
            <h1 style={{ color: '#fff' }}>Admin Dashboard</h1>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
            <button onClick={() => openModal('users')} style={{ marginRight: '10px' }}>Delete Users</button>
            <button onClick={() => openModal('groups')}>Delete Groups</button>
        </div>
            <div className="charts-container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                <div style={{ width: '30%', height: '250px' }}>
                    <Bar data={chartData.bar} options={chartOptions} />
                </div>
                <div style={{ width: '30%', height: '250px' }}>
                    <Pie data={chartData.pie} options={chartOptions} />
                </div>
                <div style={{ width: '30%', height: '250px' }}>
                    <Line data={chartData.line} options={chartOptions} />
                </div>
            </div>
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <button className="close-button" onClick={closeModal}>&times;</button>
                        <h4>Delete {modalType.slice(0, -1)}</h4>
                        <ul>
                            {modalContent.map(item => (
                                <li key={item._id}>
                                    <div className="item-info">{item.username || item.name}</div>
                                    <div className="button-container">
                                        <button className="delete-button" onClick={() => handleDelete(item._id)}>Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
