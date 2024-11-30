import PropTypes from 'prop-types';
import BlogPost from '../BlogPost/BlogPost';
import './BlogList.css';

function BlogList({ posts }) {
  return (
    <div className="blog-list">
      {posts.map(post => (
        <BlogPost key={post.id} {...post} />
      ))}
    </div>
  );
}

BlogList.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    readTime: PropTypes.number.isRequired
  })).isRequired
};

export default BlogList;