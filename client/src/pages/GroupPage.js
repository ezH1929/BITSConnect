import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import io from "socket.io-client";
import "../assets/styles/GroupPage.css";
import { useAuth } from '../contexts/AuthContext';

const ENDPOINT = "http://localhost:3001";

function GroupPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const socketRef = useRef();
  const { currentUser } = useAuth(); // Properly using useAuth to get currentUser

  useEffect(() => {
    socketRef.current = io(ENDPOINT);

    socketRef.current.emit("joinRoom", { groupId });

    socketRef.current.on("newPost", (post) => {
      setPosts((prevPosts) => [...prevPosts, post]);
      scrollToBottom();
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [groupId]);

  const fetchGroupDetails = useCallback(async () => {
    try {
      const response = await fetch(`${ENDPOINT}/api/groups/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setGroup(data);
    } catch (error) {
      setError("Failed to fetch group details.");
      navigate("/home");
    }
  }, [groupId, navigate]);

  const fetchGroupPosts = useCallback(async () => {
    try {
        const response = await fetch(`${ENDPOINT}/api/groups/groups/${groupId}/posts`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }
        setPosts(data);  // Set the entire fetched data array
    } catch (error) {
        setError(error.message);
    }
}, [groupId]);


  useEffect(() => {
    fetchGroupDetails();
    fetchGroupPosts();
  }, [fetchGroupDetails, fetchGroupPosts]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;
    if (!currentUser?._id) {
      setError("You must be logged in to post messages.");
      return;
    }
    const post = { text: postText, groupId, userId: currentUser._id };
    socketRef.current.emit("sendMessage", post, () => {
      console.log("Message sent!");
      setPostText("");
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [posts]); // Trigger scroll when posts update
  

  if (error) {
    return <div>{error}</div>;
  }

  if (!group) {
    return <div>Loading...</div>;
  }

  return (
    <div className="group-page">
      <Link to="/home" className="goBackButton">Go Back</Link>
      <div className="group-info-container">
        <h1 className="group-name">{group.name}</h1>
        <p className="group-description">{group.description}</p>
      </div>
  
      <div className="chat-container">
        <div className="chat-messages">
          <h2>Posts</h2>
          {posts.map((post) => (
            <div key={post._id} className={`message ${post.createdBy._id === currentUser._id ? 'sent' : 'received'}`}>
              <div className="message-content">
                <p className="text">{post.text}</p>
                <div className="message-meta">
                  <span className="username">{post.createdBy ? post.createdBy.username : "Unknown"}</span>
                  <span className="timestamp">{new Date(post.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
  
        <form onSubmit={handlePostSubmit} className="post-form">
          <input
            type="text"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="Write your post here..."
            required
          />
          <button type="submit">Post</button>
        </form>
      </div>
    </div>
  );
  
}

export default GroupPage;
