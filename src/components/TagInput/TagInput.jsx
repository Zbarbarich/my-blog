import { useState } from 'react';
import PropTypes from 'prop-types';
import './TagInput.css';

const MAX_TAG_LENGTH = 30;
const MAX_TAGS = 50;
const TAG_REGEX = /^[a-zA-Z0-9-]+$/;

const validateTag = (tag) => {
  if (tag.length > MAX_TAG_LENGTH) {
    throw new Error(`Tags must be less than ${MAX_TAG_LENGTH} characters`);
  }
  
  if (!TAG_REGEX.test(tag)) {
    throw new Error('Tags can only contain letters, numbers, and hyphens');
  }
  
  return tag.toLowerCase(); // Normalize tags
};

function TagInput({ tags, onChange }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      
      if (!newTag) return;
      
      try {
        if (tags.length >= MAX_TAGS) {
          throw new Error(`Maximum ${MAX_TAGS} tags allowed`);
        }
        
        const validatedTag = validateTag(newTag);
        
        if (!tags.includes(validatedTag)) {
          onChange([...tags, validatedTag]);
          setInputValue('');
        }
      } catch (error) {
        alert(error.message);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="tag-input">
      <div className="tag-input__tags">
        {tags.map((tag, index) => (
          <span key={index} className="tag-input__tag">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="tag-input__remove"
            >
              ×   
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tags..."
          className="tag-input__field"
        />
      </div>
    </div>
  );
}

TagInput.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired
};

export default TagInput;
