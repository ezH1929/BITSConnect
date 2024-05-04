import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Styles.css';

function GroupList({ groups, joinGroup, currentUser }) {
    const [activeTab, setActiveTab] = useState('joined');
    const navigate = useNavigate();
    const [filteredGroups, setFilteredGroups] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            const response = await fetch('https://bitsconnect.onrender.com/api/groups/groups', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFilteredGroups(data.groups);
            } else {
                console.error('Failed to fetch groups');
            }
        };

        fetchGroups();
    }, []);

    useEffect(() => {
        setFilteredGroups(groups.filter(group => 
            activeTab === 'joined' ? group.members.includes(currentUser._id) : !group.members.includes(currentUser._id)
        ));
    }, [activeTab, groups, currentUser._id]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="group-list-container">
            <div className="tabs">
            
                <button onClick={() => handleTabClick('joined')} className={activeTab === 'joined' ? 'active' : ''}>
                    My Groups
                </button>
                <button onClick={() => handleTabClick('unjoined')} className={activeTab === 'unjoined' ? 'active' : ''}>
                    Discover
                </button>
                
            </div>
            <ul className="group-list">
                {filteredGroups.map(group => (
                    <li key={group._id} className="group-card" onClick={() => navigate(`/groups/${group._id}`)}>
                        <div className="group-header">
                            <h2>{group.name}</h2>
                        </div>
                        <div className="group-content">
                            <p>{group.description}</p>
                            <p className="members">Members: {group.members.length || 0}</p>
                            {!group.members.includes(currentUser._id) && (
                                <button onClick={(e) => {
                                    e.stopPropagation();
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
