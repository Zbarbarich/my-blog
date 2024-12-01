import { memo } from 'react';
import PropTypes from 'prop-types';
import './Pagination.css';

// Pagination controls for blog list
const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange
}) {
  // Generate array of page numbers
  const pageNumbers = Array.from(
    { length: totalPages }, 
    (_, i) => i + 1
  );

  return (
    <div className="pagination">
      {/* Previous page button */}
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {/* Page number buttons */}
      <div className="page-numbers">
        {pageNumbers.map(number => (
          <button
            key={number}
            className={`page-number ${
              number === currentPage ? 'active' : ''
            }`}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        ))}
      </div>

      {/* Next page button */}
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
});

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired
};

export default Pagination;