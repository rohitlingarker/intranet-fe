import React, { useEffect, useState } from 'react';
import axios from 'axios';
 
const CommentBox = ({ epicId, storyId, taskId }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState(1); // default user
  const [users, setUsers] = useState([]);
 
  const baseUrl = 'http://localhost:8080/api/comments';
 
  const getUrl = () => {
    if (epicId) return `${baseUrl}/epic/${epicId}`;
    if (storyId) return `${baseUrl}/story/${storyId}`;
    if (taskId) return `${baseUrl}/tasks/${taskId}`;
    return '';
  };
 
  useEffect(() => {
    axios.get(getUrl())
      .then((res) => setComments(res.data))
      .catch((err) => console.error('Failed to load comments', err));
 
    axios.get('http://localhost:8080/api/users')
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error('Failed to load users', err));
  }, [epicId, storyId, taskId]);
 
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content || !userId) return;
 
    axios.post(getUrl(), null, {
      params: {
        userId,
        content,
      },
    })
    .then(() => {
      setContent('');
      return axios.get(getUrl());
    })
    .then((res) => setComments(res.data))
    .catch((err) => console.error('Failed to post comment', err));
  };
 
  const renderComments = (comments, level = 0) => (
    comments.map((comment) => (
      <div key={comment.id} className={`ml-${level * 4} mt-2 border-l-2 pl-2`}>
        <p className="text-sm">
          <strong>{comment.createdBy}:</strong> {comment.content}
        </p>
        {comment.replies && renderComments(comment.replies, level + 1)}
      </div>
    ))
  );
 
  return (
    <div className="mt-2 p-2 border rounded bg-gray-50">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border rounded p-2 text-sm"
          rows={2}
        />
        <select
          value={userId}
          onChange={(e) => setUserId(parseInt(e.target.value))}
          className="text-sm border rounded p-1 w-fit"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="self-start bg-blue-500 text-white px-2 py-1 text-sm rounded hover:bg-blue-600"
        >
          Add Comment
        </button>
      </form>
 
      <div className="mt-2">
        {renderComments(comments)}
      </div>
    </div>
  );
};
 
export default CommentBox;
 
 