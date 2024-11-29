import { useState } from 'react';
import PropTypes from 'prop-types';
import './CommentSection.css';

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments(prevComments => [...prevComments, {
      id: Date.now(),
      text: newComment,
      timestamp: new Date().toISOString()
    }]);
    setNewComment('');
  };

  return (
    <div className="comment-section">
      <button 
        className="comment-section__toggle"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        {isExpanded ? 'Hide' : 'Show'} Comments ({comments.length})
      </button>

      {isExpanded && (
        <>
          <form onSubmit={handleSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-form__input"
              rows="3"
            />
            <button 
              type="submit" 
              disabled={!newComment.trim()}
              className="comment-form__submit"
            >
              Post Comment
            </button>
          </form>

          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment">
                <p className="comment__text">{comment.text}</p>
                <span className="comment__timestamp">
                  {new Date(comment.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

CommentSection.propTypes = {
  postId: PropTypes.number.isRequired
};

export default CommentSection;