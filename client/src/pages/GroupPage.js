// GroupPage.js
import React, { useEffect, useState, useRef, forwardRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useGroupDetails, usePosts } from '../hooks/useGroupHooks'; // Custom hooks (implementation not shown)
import '../assets/styles/GroupPage.css';

const ENDPOINT = 'http://localhost:3001';

function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { group, error: groupError, fetchGroupDetails } = useGroupDetails(groupId);
  const { posts, setPosts, error: postsError, fetchGroupPosts } = usePosts(groupId);
  const [postText, setPostText] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(ENDPOINT);
    socketRef.current.emit('joinRoom', { groupId });
    socketRef.current.on('newPost', (post) => {
      setPosts((prev) => [...prev, post]);
      scrollToBottom();
    });

    return () => socketRef.current.disconnect();
  }, [groupId, setPosts]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;
    if (!currentUser?._id) {
      navigate('/login');
      return;
    }
    const post = { text: postText, groupId, userId: currentUser._id };
    socketRef.current.emit('sendMessage', post, () => setPostText(''));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const container = document.querySelector('.chat-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [posts]); // Dependency on posts ensures scroll effect triggers on update
  

  useEffect(() => {
    fetchGroupDetails();
    fetchGroupPosts();
  }, [fetchGroupDetails, fetchGroupPosts]);

  if (groupError || postsError) return <div>{groupError || postsError}</div>;
  if (!group) return <div>Loading...</div>;

  return (
    <div className="group-page">
      <Link to="/home" className="goBackButton">Go Back</Link>
      <div className="group-info-container">
        <h1 className="group-name">{group.name}</h1>
        <p className="group-description">{group.description}</p>
      </div>
      <ChatMessages posts={posts} currentUser={currentUser} ref={messagesEndRef} />
      <PostForm postText={postText} setPostText={setPostText} handlePostSubmit={handlePostSubmit} />
    </div>
  );
}

export default GroupPage;

// ChatMessages.js
const ChatMessages = forwardRef(({ posts, currentUser }, ref) => (
  <div className="chat-container">
    <div className="chat-messages">
      <h2>Posts</h2>
      {posts.map((post) => (
        <div key={post._id} className={`message ${post.createdBy._id === currentUser._id ? 'sent' : 'received'}`}>
          <div className="message-header">
            <span className="username">{post.createdBy.username}</span>
          </div>
          <div className="message-body">
            <p className="text">{post.text}</p>
            <div className="message-meta">
              <span className="timestamp">{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
      <div ref={ref} /> {/* Ensures auto-scrolling to the latest message */}
    </div>
  </div>
));


// PostForm.js
function PostForm({ postText, setPostText, handlePostSubmit }) {
  return (
    <form onSubmit={handlePostSubmit} className="post-form">
      <input
        type="text"
        value={postText}
        onChange={(e) => setPostText(e.target.value)}
        placeholder="Write your post here..."
        aria-label="Write your post here" // Added for accessibility
        required
      />
      <button type="submit" className="submit-button">Post</button> {/* Added className for styling */}
    </form>
  );

}
