import { useState, useCallback } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { useFilters } from '../../hooks/useFilters';
import BlogSearch from '../BlogSearch/BlogSearch';
import BlogFilters from '../BlogFilters/BlogFilters';
import BlogPost from '../BlogPost/BlogPost';
import Pagination from '../Pagination/Pagination';
import './BlogList.css';

const POSTS_PER_PAGE = 5;

function BlogList({ posts: initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [currentPage, setCurrentPage] = useState(1);
  
  const {
    filters,
    handleFilterChange,
    filteredItems,
    categories,
    authors,
    allTags,
    addNewTag
  } = useFilters(posts);

  const {
    searchTerm,
    handleSearch,
    results: searchResults,
    isSearching
  } = useSearch(filteredItems);

  const handleClearFilters = useCallback(() => {
    handleFilterChange('category', '');
    handleFilterChange('author', '');
    handleFilterChange('tags', []);
    handleSearch('');
    setCurrentPage(1);
  }, [handleFilterChange, handleSearch]);

  const handlePostUpdate = useCallback((updatedPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  }, []);

  const displayedPosts = searchResults;
  const totalPages = Math.ceil(displayedPosts.length / POSTS_PER_PAGE);
  
  const currentPosts = displayedPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <div className="blog-list-container">
      <div className="blog-controls">
        <BlogSearch
          searchTerm={searchTerm}
          onSearch={handleSearch}
          resultCount={searchResults.length}
        />
        <BlogFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={categories}
          authors={authors}
          allTags={allTags}
          onClearFilters={handleClearFilters}
        />
      </div>

      {currentPosts.length > 0 ? (
        <>
          <div className="blog-posts">
            {currentPosts.map(post => (
              <div key={post.id} className="blog-post-wrapper">
                <BlogPost 
                  id={post.id}
                  title={post.title}
                  content={post.content}
                  author={post.author}
                  date={post.date}
                  isPublished={post.isPublished}
                  tags={post.tags}
                  category={post.category}
                  searchTerm={searchTerm}
                  onNewTag={addNewTag}
                  onPostUpdate={handlePostUpdate}
                />
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <div className="no-results">
          No posts found matching your criteria.
        </div>
      )}
    </div>
  );
}

export default BlogList;