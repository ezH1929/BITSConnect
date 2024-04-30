import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../assets/styles/GroupPage.css';
import { Link } from "react-router-dom";


function GroupPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [postText, setPostText] = useState("");
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchGroupDetails = async () => {
    try {
      const response = await fetch(
        `https://bitsconnect.onrender.com/api/groups/groups/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message);
        if (response.status === 403) {
          navigate("/home"); // Redirect if not a member
        }
        return;
      }

      const data = await response.json();
      setGroup(data);
    } catch (error) {
      setError("Failed to fetch group details.");
      navigate("/home");
    }
  };

  const fetchGroupPosts = async () => {
    try {
      const response = await fetch(
        `https://bitsconnect.onrender.com/api/groups/groups/${groupId}/posts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch group posts.");
      }

      const postData = await response.json();
      setPosts(postData);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
    fetchGroupPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [posts]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://bitsconnect.onrender.com/api/groups/groups/${groupId}/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ text: postText }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message);
        return;
      }

      // Clear the input field after successful post creation
      setPostText("");
      // Refetch group posts to update the UI with the new post
      fetchGroupPosts();
    } catch (error) {
      setError("Failed to create post.");
    }
  };

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
        {/* Display group posts with timestamps */}
        <div className="chat-messages">
          <h2>Posts</h2>
          {posts.map((post) => (
            <div key={post._id} className="message">
              <p>{post.text}</p>
              <p>Posted by: {post.createdBy.username}</p>
              <p>Posted at: {new Date(post.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
  
        {/* Form to create a new post */}
        <form onSubmit={handlePostSubmit} className="post-form">
          <textarea
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
