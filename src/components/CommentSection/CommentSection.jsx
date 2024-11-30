import { useState } from 'react';
import PropTypes from 'prop-types';
import './CommentSection.css';
import DOMPurify from 'dompurify';


function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const MAX_COMMENT_LENGTH = 1000;
  const MIN_COMMENT_INTERVAL = 30000; // 30 seconds
  let lastCommentTime = 0;

  const sanitizeComment = (text) => {
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [], // Strip all HTML
      ALLOWED_ATTR: []
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const now = Date.now();
    if (now - lastCommentTime < MIN_COMMENT_INTERVAL) {
      alert('Please wait before posting another comment');
      return;
    }

    const trimmedComment = newComment.trim();
    if (!trimmedComment) return;
    
    if (trimmedComment.length > MAX_COMMENT_LENGTH) {
      alert(`Comments must be less than ${MAX_COMMENT_LENGTH} characters`);
      return;
    }

    const sanitizedComment = sanitizeComment(trimmedComment);
    
    setComments(prevComments => [...prevComments, {
      id: now,
      text: sanitizedComment,
      timestamp: new Date().toISOString()
    }]);
    
    lastCommentTime = now;
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
  postId: PropTypes.string.isRequired
};

export default CommentSection;