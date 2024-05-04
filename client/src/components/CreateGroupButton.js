import React, { useState } from 'react';
import CreateGroupModal from './CreateGroupModal';
import '../assets/styles/GroupButton.css';

function CreateGroupButton({ onUpdate }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => {
        setModalIsOpen(false);
        setErrorMessage('');
    };

    const [isLoading, setIsLoading] = useState(false);

const handleCreateGroup = async (groupData) => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('https://bitsconnect.onrender.com/api/groups/groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(groupData)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create group');
        }
        closeModal();
        onUpdate();
    } catch (error) {
        console.error('Error creating group:', error.message);
        setErrorMessage(error.message);
    } finally {
        setIsLoading(false);
    }
};

return (
    <div className="create-group-container">
        <button onClick={openModal} className="create-group-btn" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create New Group'}
        </button>
        {modalIsOpen && <CreateGroupModal onClose={closeModal} onSubmit={handleCreateGroup} />}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
);
}

export default CreateGroupButton;
