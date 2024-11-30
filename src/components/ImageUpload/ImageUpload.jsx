import PropTypes from 'prop-types';
import './ImageUpload.css';

function ImageUpload({ children, onUpload }) {
  const validateImage = (file) => {
    // List of allowed image extensions
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    }

    // Additional magic number validation could be added here
    
    return true;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      validateImage(file);
      console.log('File select triggered');
      console.log('File selected:', file);
      
      if (file.size > 5 * 1024 * 1024) {
        console.error('Image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('File read complete');
        onUpload(e.target.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="image-upload-button">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="file-input"
        id="file-input"
      />
      <label htmlFor="file-input">
        {children}
      </label>
    </div>
  );
}

ImageUpload.propTypes = {
  onUpload: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

export default ImageUpload;
