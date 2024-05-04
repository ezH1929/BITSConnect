import { useState, useCallback } from 'react';

const ENDPOINT = 'https://bitsconnect.onrender.com';

export const useGroupDetails = (groupId) => {
    const [group, setGroup] = useState(null);
    const [error, setError] = useState('');

    const fetchGroupDetails = useCallback(async () => {
        try {
            const response = await fetch(`${ENDPOINT}/api/groups/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch group details.');
            }
            setGroup(data);
        } catch (err) {
            setError(err.message);
        }
    }, [groupId]);

    return { group, error, fetchGroupDetails };
};

export const usePosts = (groupId) => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');

    const fetchGroupPosts = useCallback(async () => {
        try {
            const response = await fetch(`${ENDPOINT}/api/groups/groups/${groupId}/posts`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch posts.');
            }
            setPosts(data);
        } catch (err) {
            setError(err.message);
        }
    }, [groupId]);

    return { posts, setPosts, error, fetchGroupPosts };
};
