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

function BlogPost({ id, title: initialTitle, content: initialContent, author, date, isPublished: initialPublishState = false, tags, category, searchTerm, onNewTag, onPostUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [readTime, setReadTime] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(initialTitle);
  const [currentContent, setCurrentContent] = useState(initialContent);
  const [isPublished, setIsPublished] = useState(initialPublishState);
  const [currentTags, setCurrentTags] = useState(tags || []);
  const [currentCategory, setCurrentCategory] = useState(category || 'general');

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
    if (updatedPost.shouldPublish) {
      updatedPost.tags.forEach(tag => {
        if (!currentTags.includes(tag)) {
          onNewTag?.(tag);
        }
      });
      
      setCurrentTitle(updatedPost.title);
      setCurrentContent(updatedPost.content);
      setCurrentTags(updatedPost.tags);
      setCurrentCategory(updatedPost.category);
      setIsPublished(true);

      onPostUpdate?.({
        id,
        title: updatedPost.title,
        content: updatedPost.content,
        tags: updatedPost.tags,
        category: updatedPost.category,
        author,
        date,
        isPublished: true
      });
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
    tags: currentTags,
    category: currentCategory,
    isPublished
  };

  const highlightText = (text) => {
    if (!searchTerm) return text;

    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark key={index} className="highlight">{part}</mark>
      ) : part
    );
  };

  return (
    <article className="blog-post">
      <div className="blog-post__header">
        <h2 className="blog-post__title">
          {highlightText(currentTitle)}
        </h2>
        <div className="blog-post__meta">
          <span className="blog-post__author">By {author}</span>
          <time className="blog-post__date">{date}</time>
          <span className="blog-post__read-time">{readTime} min read</span>
          <span className="blog-post__category">{currentCategory}</span>
          <button 
            className="blog-post__edit-btn"
            onClick={handleEdit}
          >
            Edit
          </button>
        </div>
      </div>
      <div className="blog-post__tags">
        {currentTags.map((tag, index) => (
          <span key={index} className="blog-post__tag">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="blog-post__content">
        {isEditing ? (
          <PostEditor
            content={postContent}
            onSave={handleSave}
            onCancel={handleCancel}
            onChange={() => {}}
          />
        ) : (
          <>
            <div className="markdown-content">
              <ReactMarkdown 
                rehypePlugins={[rehypeRaw]}
                components={{
                  // Custom renderer for paragraphs to handle highlighting
                  p: ({children}) => {
                    if (typeof children === 'string') {
                      return <p>{highlightText(children)}</p>;
                    }
                    return <p>{children}</p>;
                  }
                }}
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
  isPublished: PropTypes.bool,
  tags: PropTypes.arrayOf(PropTypes.string),
  category: PropTypes.string,
  searchTerm: PropTypes.string,
  onPostUpdate: PropTypes.func
};

export default BlogPost;