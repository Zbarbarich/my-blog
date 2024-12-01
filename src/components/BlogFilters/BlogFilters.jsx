import { memo } from 'react';
import PropTypes from 'prop-types';
import './BlogFilters.css';

// Filter controls for blog posts
const BlogFilters = memo(function BlogFilters({
  filters,
  onFilterChange,
  categories,
  authors,
  allTags,
  onClearFilters
}) {
  return (
    <div className="blog-filters">
      {/* Category filter */} 
      <div className="filter-group">
        <h3 className="filter-header">Category</h3>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Author filter */}
      <div className="filter-group">
        <h3 className="filter-header">Author</h3>
        <select
          value={filters.author}
          onChange={(e) => onFilterChange('author', e.target.value)}
        >
          {authors.map(author => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
        </select>
      </div>

      {/* Tags filter */}
      <div className="filter-group">
        <label>Tags</label>
        <div className="tags-filter">
          {allTags.map((tag, index) => (
            <label key={`${tag}-${index}`} className="tag-checkbox">
              <input
                type="checkbox"
                checked={filters.tags.includes(tag)}
                onChange={(e) => {
                  const newTags = e.target.checked
                    ? [...filters.tags, tag]
                    : filters.tags.filter(t => t !== tag);
                  onFilterChange('tags', newTags);
                }}
              />
              {tag}
            </label>
          ))}
        </div>
      </div>

      {/* Clear filters button */}
      {(filters.category || filters.author || filters.tags.length > 0) && (
        <button
          type="button"
          onClick={onClearFilters}
          className="clear-filters-btn"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
});

BlogFilters.propTypes = {
  filters: PropTypes.shape({
    category: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  authors: PropTypes.arrayOf(PropTypes.string).isRequired,
  allTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClearFilters: PropTypes.func.isRequired
};

export default BlogFilters;