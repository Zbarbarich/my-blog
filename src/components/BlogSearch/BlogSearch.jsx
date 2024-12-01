import { memo } from 'react';
import PropTypes from 'prop-types';
import './BlogSearch.css';

// Search component with results counter
const BlogSearch = memo(function BlogSearch({ 
  searchTerm, 
  onSearch, 
  resultCount 
}) {
  // Handle search input changes and clearing
  const handleChange = (e) => {
    const value = e.target.value;
    if (e.type === 'search' || !value) {
      onSearch('');
    } else {
      onSearch(value);
    }
  };

  return (
    <div className="blog-search">
      <div className="search-input-wrapper">
        {/* Search input field */}
        <input
          type="search"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Search posts..."
          className="search-input"
        />
        
        {/* Clear search button */}
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearch('')}
            className="search-clear-button"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
        
        {/* Search results counter */}
        {searchTerm && (
          <span className="search-results-count">
            {resultCount} results found
          </span>
        )}
      </div>
    </div>
  );
});

BlogSearch.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
  resultCount: PropTypes.number.isRequired
};

export default BlogSearch;