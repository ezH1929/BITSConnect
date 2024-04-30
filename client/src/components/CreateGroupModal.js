import React, { useState } from 'react';
import '../assets/styles/GroupModal.css';

function CreateGroupModal({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        groupName: '',
        description: '',
        members: '1'
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const { groupName, description, members } = formData;
        const maxMembers = parseInt(members, 10);
        if (!groupName.trim() || !description.trim() || isNaN(maxMembers) || maxMembers < 1) {
            alert("Please fill all fields correctly.");
            return;
        }

        onSubmit({
            name: groupName.trim(),
            description: description.trim(),
            maxMembers
        });

        onClose();
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content">
                <h2>Create New Group</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-field">
                        <label htmlFor="groupName">Group Name:</label>
                        <input
                            type="text"
                            id="groupName"
                            name="groupName"
                            value={formData.groupName}
                            onChange={handleChange}
                            required
                            aria-label="Group Name"
                        />
                    </div>
                    <div className="input-field">
                        <label htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            aria-label="Description"
                        />
                    </div>
                    <div className="input-field">
                        <label htmlFor="members">Max Members:</label>
                        <input
                            type="number"
                            id="members"
                            name="members"
                            value={formData.members}
                            onChange={handleChange}
                            required
                            aria-label="Max Members"
                            min="1"
                        />
                    </div>
                    <div className="form-buttons">
                        <button type="submit" className="submit-btn">Create Group</button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateGroupModal;
