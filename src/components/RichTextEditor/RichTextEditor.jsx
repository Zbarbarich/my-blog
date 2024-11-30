import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './RichTextEditor.css';
import DOMPurify from 'dompurify';

function RichTextEditor({ value, onChange, error }) {
  const editorRef = useRef(null);
  const isInitialMount = useRef(true);
  const [activeFormats, setActiveFormats] = useState(new Set());

  const checkActiveFormats = useCallback(() => {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setActiveFormats(new Set());
        return;
      }

      let range;
      try {
        range = selection.getRangeAt(0);
      } catch (e) {
        console.warn('Failed to get range:', e);
        setActiveFormats(new Set());
        return;
      }

      if (!range || !editorRef.current?.contains(range.commonAncestorContainer)) {
        setActiveFormats(new Set());
        return;
      }

      const ancestor = range.commonAncestorContainer;
      let node = ancestor.nodeType === 3 ? ancestor.parentNode : ancestor;

      const newActiveFormats = new Set();

      while (node && node !== editorRef.current) {
        const tagName = node.tagName?.toLowerCase();
        switch (tagName) {
          case 'strong':
            newActiveFormats.add('bold');
            break;
          case 'em':
            newActiveFormats.add('italic');
            break;
          case 'h3':
            newActiveFormats.add('heading');
            break;
          case 'a':
            newActiveFormats.add('link');
            break;
          case 'blockquote':
            newActiveFormats.add('quote');
            break;
          case 'code':
            newActiveFormats.add('code');
            break;
        }
        node = node.parentNode;
      }

      setActiveFormats(newActiveFormats);
    } catch (e) {
      console.warn('Error in checkActiveFormats:', e);
      setActiveFormats(new Set());
    }
  }, []);

  const toggleFormat = (tag, attributes = {}) => {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      let range;
      try {
        range = selection.getRangeAt(0);
      } catch (e) {
        console.warn('Failed to get range in toggleFormat:', e);
        return;
      }

      const selectedText = range.toString();
      if (!selectedText) return;

      const formatMap = {
        'strong': 'bold',
        'em': 'italic',
        'h3': 'heading',
        'a': 'link',
        'blockquote': 'quote',
        'code': 'code'
      };
      
      const format = formatMap[tag];
      const isActive = activeFormats.has(format);

      if (isActive) {
        // If format is active, find and unwrap all matching tags within the selection
        const fragment = range.extractContents();
        const elementsToUnwrap = fragment.querySelectorAll(tag);
        
        elementsToUnwrap.forEach(element => {
          while (element.firstChild) {
            element.parentNode.insertBefore(element.firstChild, element);
          }
          element.parentNode.removeChild(element);
        });
        
        range.insertNode(fragment);
      } else {
        // Add new formatting
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
        
        try {
          range.surroundContents(element);
        } catch (e) {
          element.appendChild(range.extractContents());
          range.insertNode(element);
        }
      }

      // Restore selection and update state
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Force a check of active formats
      setTimeout(checkActiveFormats, 0);
      onChange(editorRef.current.innerHTML);
    } catch (e) {
      console.warn('Error in toggleFormat:', e);
    }
  };

  const handleInput = (e) => {
    onChange(e.currentTarget.innerHTML);
    checkActiveFormats();
  };

  useEffect(() => {
    const handleMouseUp = () => {
      checkActiveFormats();
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', checkActiveFormats);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', checkActiveFormats);
    };
  }, [checkActiveFormats]);

  const handleKeyUp = () => {
    checkActiveFormats();
  };

  useEffect(() => {
    if (editorRef.current) {
      try {
        if (isInitialMount.current) {
          editorRef.current.innerHTML = DOMPurify.sanitize(value);
          isInitialMount.current = false;
        } else if (editorRef.current.innerHTML !== value) {
          const selection = window.getSelection();
          const range = selection.getRangeAt(0);
          const startOffset = range.startOffset;
          const endOffset = range.endOffset;

          editorRef.current.innerHTML = DOMPurify.sanitize(value);

          if (selection.rangeCount > 0) {
            try {
              range.setStart(editorRef.current.firstChild || editorRef.current, startOffset);
              range.setEnd(editorRef.current.firstChild || editorRef.current, endOffset);
              selection.removeAllRanges();
              selection.addRange(range);
            } catch (e) {
              console.warn('Could not restore cursor position:', e);
            }
          }
        }
      } catch (e) {
        console.warn('Error in restoreCursorPosition:', e);
      }
    }
  }, [value]);

  const validateAndCreateLink = () => {
    const url = prompt('Enter URL:');
    if (!url) return;
    
    try {
      // Add protocol if missing
      const urlToCheck = url.match(/^https?:\/\//) ? url : `https://${url}`;
      const urlObj = new URL(urlToCheck);
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        alert('Only HTTP and HTTPS URLs are allowed');
        return;
      }
      
      // Pass the sanitized URL to toggleFormat
      toggleFormat('a', { 
        href: urlObj.href,
        target: '_blank',
        rel: 'noopener noreferrer'
      });
    } catch (error) {
      console.error('URL validation error:', error);
      alert('Please enter a valid URL');
    }
  };

  return (
    <div className="rich-editor">
      <div className="rich-editor__toolbar">
        <button 
          type="button" 
          onClick={() => toggleFormat('strong')}
          className={`toolbar-button ${activeFormats.has('bold') ? 'active' : ''}`}
          title="Bold"
        >
          B
        </button>
        <button 
          type="button" 
          onClick={() => toggleFormat('em')}
          className={`toolbar-button ${activeFormats.has('italic') ? 'active' : ''}`}
          title="Italic"
        >
          I
        </button>
        <button 
          type="button" 
          onClick={() => toggleFormat('h3')}
          className={`toolbar-button ${activeFormats.has('heading') ? 'active' : ''}`}
          title="Heading"
        >
          H
        </button>
        <button
          type="button"
          onClick={validateAndCreateLink}
          className={`toolbar-button ${activeFormats.has('link') ? 'active' : ''}`}
          title="Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => toggleFormat('blockquote')}
          className={`toolbar-button ${activeFormats.has('quote') ? 'active' : ''}`}
          title="Quote"
        >
          "
        </button>
        <button
          type="button"
          onClick={() => toggleFormat('code')}
          className={`toolbar-button ${activeFormats.has('code') ? 'active' : ''}`}
          title="Code"
        >
          {'</>'}
        </button>
      </div>
      <div className="rich-editor__container">
        <div
          ref={editorRef}
          className={`rich-editor__content ${error ? 'error' : ''}`}
          contentEditable
          onInput={handleInput}
          onSelect={checkActiveFormats}
          onKeyUp={handleKeyUp}
          role="textbox"
          aria-multiline="true"
          data-placeholder="Write your content here..."
          suppressContentEditableWarning={true}
        />
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

RichTextEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string
};

export default RichTextEditor;
