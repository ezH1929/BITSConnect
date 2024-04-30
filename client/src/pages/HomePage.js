import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/NavBar';
import CreateGroupButton from '../components/CreateGroupButton';
import GroupList from '../components/GroupList';
import { useAuth } from '../contexts/AuthContext';
import '../assets/styles/HomePage.css';  // Ensure this is correctly linked

function HomePage() {
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        if (currentUser) {
            fetchGroups();
        }
    }, [currentUser]);

    const fetchGroups = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3001/api/groups/groups', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to load groups');
            }
            const data = await response.json();
            setGroups(data.groups);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching groups:', error);
            setIsLoading(false);
        }
    };

    const handleUpdateGroups = () => {
        fetchGroups();
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="main-container">
            <NavigationBar />
            <div className="create-group">
                <CreateGroupButton onUpdate={handleUpdateGroups} />
            </div>
            <GroupList groups={groups} currentUser={currentUser} />
        </div>
    );
}

export default HomePage;
