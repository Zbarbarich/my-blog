import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import RichTextEditor from '../RichTextEditor/RichTextEditor';
import TagInput from '../TagInput/TagInput';
import './PostEditor.css';

const MAX_DRAFT_SIZE = 50000; // 50KB limit

function PostEditor({ content, onSave, onCancel }) {
  const [title, setTitle] = useState(content.title || '');
  const [editorContent, setEditorContent] = useState(content.content || '');
  const [tags, setTags] = useState(content.tags || []);
  const [category, setCategory] = useState(content.category || 'general');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedDraft = loadDraft();
    if (savedDraft) {
      setTitle(savedDraft.title);
      setEditorContent(savedDraft.content);
      setTags(savedDraft.tags);
      setCategory(savedDraft.category);
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!editorContent.trim()) {
      newErrors.content = 'Content is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (shouldPublish = false) => {
    if (!validate()) return;

    if (shouldPublish) {
      const confirmPublish = window.confirm(
        'Are you sure you want to publish this post? Published posts will be visible to all users.'
      );
      if (!confirmPublish) return;

      onSave({
        title,
        content: editorContent,
        tags,
        category,
        shouldPublish: true
      });
      localStorage.removeItem('postDraft');
    } else {
      // Save to localStorage only
      saveDraft({
        title,
        content: editorContent,
        tags,
        category
      });
      onCancel(); // Close the editor
    }
  };

  const handleCancel = () => {
    const savedDraft = loadDraft();
    if (savedDraft) {
      // If there's a saved draft, restore it
      setTitle(savedDraft.title);
      setEditorContent(savedDraft.content);
      setTags(savedDraft.tags);
      setCategory(savedDraft.category);
    }
    onCancel(); // Close the editor
  };

  // Function to save draft with expiration
  const saveDraft = (draft) => {
    try {
      const draftString = JSON.stringify(draft);
      if (draftString.length > MAX_DRAFT_SIZE) {
        throw new Error('Draft exceeds maximum size limit');
      }

      const draftWithExpiry = {
        data: draft,
        expiry: Date.now() + (24 * 60 * 60 * 1000),
        version: '1.0' // For future compatibility
      };
      
      localStorage.setItem('postDraft', JSON.stringify(draftWithExpiry));
    } catch (error) {
      console.error('Failed to save draft:', error);
      // Handle error appropriately
    }
  };

  // Function to load draft and check expiration
  const loadDraft = () => {
    try {
      const saved = localStorage.getItem('postDraft');
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      
      // Validate structure
      if (!parsed.data || !parsed.expiry || typeof parsed.expiry !== 'number') {
        throw new Error('Invalid draft structure');
      }

      if (Date.now() > parsed.expiry) {
        localStorage.removeItem('postDraft');
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to load draft:', error);
      localStorage.removeItem('postDraft');
      return null;
    }
  };

  return (
    <div className="post-editor">
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="general">General</option>
          <option value="technology">Technology</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="travel">Travel</option>
        </select>
      </div>

      <div className="form-group">
        <label>Tags</label>
        <TagInput
          tags={tags}
          onChange={setTags}
          maxTags={5}
        />
      </div>

      <div className="form-group">
        <label>Content</label>
        <RichTextEditor
          value={editorContent}
          onChange={setEditorContent}
          error={errors.content}
        />
      </div>

      <div className="button-group">
        <button
          type="button"
          className="button button--secondary"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="button"
          onClick={() => handleSave(false)}
        >
          Save Draft
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={() => handleSave(true)}
        >
          Publish
        </button>
      </div>
    </div>
  );
}

PostEditor.propTypes = {
  content: PropTypes.shape({
    title: PropTypes.string,
    content: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    category: PropTypes.string
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default PostEditor;
