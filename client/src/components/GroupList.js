import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../assets/styles/Styles.css';

function GroupList({ currentUser }) {
    const [groups, setGroups] = useState([]);
    const navigate = useNavigate(); // Instantiate the navigate function

    useEffect(() => {
        const fetchGroups = async () => {
            const response = await fetch('http://localhost:3001/api/groups/groups', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setGroups(data.groups);
            } else {
                console.error('Failed to fetch groups');
            }
        };

        fetchGroups();
    }, []);

    const joinGroup = async (groupId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3001/api/groups/groups/${groupId}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to join group');
            }

            const updatedGroupData = await response.json();
            setGroups(prevGroups => prevGroups.map(group =>
                group._id === groupId ? { ...group, members: updatedGroupData.group.members } : group
            ));

            alert('Successfully joined the group!');
        } catch (error) {
            alert(error.message);
        }
    };

    const handleGroupClick = groupId => {
        navigate(`/groups/${groupId}`); // Navigate to the GroupPage
    };

    return (
        <div className="group-list-container">
            <h1>All Groups</h1>
            <ul className="group-list">
                {groups.map(group => (
                    <li key={group._id} className="group-card" onClick={() => handleGroupClick(group._id)}>
                        <div className="group-header">
                            <h2>{group.name}</h2>
                        </div>
                        <div className="group-content">
                            <p>{group.description}</p>
                            <p className="members">Members: {group.members?.length || 0}</p>
                            {!group.members.includes(currentUser._id) && (
                                <button onClick={(e) => {
                                    e.stopPropagation(); // Prevent navigation when clicking the button
                                    joinGroup(group._id);
                                }}>Join Group</button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default GroupList;
