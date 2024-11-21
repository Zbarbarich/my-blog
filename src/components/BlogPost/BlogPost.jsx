import PropTypes from 'prop-types';
import styles from './BlogPost.module.css';

function BlogPost({ title, content, author, date, readTime }) {
  console.log(styles);
  return (
    <article className={styles.blogPost}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.meta}>
          <span className={styles.author}>By {author}</span>
          <time className={styles.date}>{date}</time>
          <span className={styles.readTime}>{readTime} min read</span>
        </div>  
      </div>
      <div className={styles['blog-post__content']}>
        {content}
      </div>
    </article>
  );
}

BlogPost.propTypes = {
  title: PropTypes.string.required,
  content: PropTypes.string.required,
  author: PropTypes.string.required,
  date: PropTypes.string.required,
  readTime: PropTypes.number.required
};

export default BlogPost;