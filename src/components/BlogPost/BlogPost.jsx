import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import LikeButton from '../LikeButton/LikeButton';
import CommentSection from '../CommentSection/CommentSection';
import { calculateReadTime } from '../../utils/readTime';
import './BlogPost.css';
import PostEditor from '../PostEditor/PostEditor';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

// Configure DOMPurify with stricter options
const sanitizeConfig = {
  ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'ul', 'li'],
  ALLOWED_ATTR: ['href', 'target'],
  ALLOW_DATA_ATTR: false
};

function BlogPost({ id, title: initialTitle, content: initialContent, author, date, isPublished: initialPublishState = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [readTime, setReadTime] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(initialTitle);
  const [currentContent, setCurrentContent] = useState(initialContent);
  const [isPublished, setIsPublished] = useState(initialPublishState);

  useEffect(() => {
    setReadTime(calculateReadTime(currentContent));
  }, [currentContent]);

  const toggleContent = () => {
    setIsExpanded(prev => !prev);
  };

  const truncateContent = (text) => {
    if (!text) return ''; // Handle undefined/null content
    
    const MAX_CHARS = 200;
    
    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = DOMPurify.sanitize(text);
    
    // Get text content
    const textContent = temp.textContent || temp.innerText;
    
    // If the content is short enough, return it as is
    if (textContent.length <= MAX_CHARS) {
      return text;
    }
    
    // Find a sentence boundary near MAX_CHARS
    let truncatedHtml = '';
    let currentLength = 0;
    
    const walker = document.createTreeWalker(
      temp,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode()) && currentLength < MAX_CHARS) {
      const nodeText = node.textContent;
      const nodeLength = nodeText.length;
      if (currentLength + nodeLength > MAX_CHARS) {
        // This is the node where we need to truncate
        truncatedHtml += nodeText.slice(0, MAX_CHARS - currentLength);
        currentLength = MAX_CHARS;
      } else {
        truncatedHtml += nodeText;
        currentLength += nodeLength;
      }
    }
    
    return truncatedHtml;
  };

  const displayContent = isExpanded 
    ? currentContent
    : currentContent.length > 200 
      ? truncateContent(currentContent)
      : currentContent;

  const handleSave = (updatedPost) => {
    // Only update the live post if explicitly publishing
    if (updatedPost.shouldPublish) {
      setCurrentTitle(updatedPost.title);
      setCurrentContent(updatedPost.content);
      setIsPublished(true);
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Pass only the current published state to PostEditor
  const postContent = {
    title: currentTitle,
    content: currentContent,
    tags: [], 
    category: 'general',
    isPublished
  };

  return (
    <article className="blog-post">
      <div className="blog-post__header">
        <h2 className="blog-post__title">
          {currentTitle}
        </h2>
        <div className="blog-post__meta">
          <span className="blog-post__author">By {author}</span>
          <time className="blog-post__date">{date}</time>
          <span className="blog-post__read-time">{readTime} min read</span>
          <button 
            className="blog-post__edit-btn"
            onClick={handleEdit}
          >
            Edit
          </button>
        </div>
      </div>
      
      <div className="blog-post__content">
        {isEditing ? (
          <PostEditor
            content={postContent}
            onSave={handleSave}
            onCancel={handleCancel}
            onChange={() => {}} // Remove onChange handling
          />
        ) : (
          <>
            <div className="markdown-content">
              <ReactMarkdown 
                rehypePlugins={[rehypeRaw]}
                children={DOMPurify.sanitize(displayContent, sanitizeConfig)}
              />
            </div>
            {currentContent.length > 200 && (
              <button 
                onClick={toggleContent}
                className="blog-post__expand"
                type="button"
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </>
        )}
      </div>

      <div className="blog-post__actions">
        <LikeButton initialLikes={0} />
        <CommentSection postId={id} />
      </div>
    </article>
  );
}

BlogPost.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  isPublished: PropTypes.bool
};

export default BlogPost;