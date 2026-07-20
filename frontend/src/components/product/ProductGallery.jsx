import { useState } from 'react';
import { FiImage } from 'react-icons/fi';
import './ProductGallery.css';

function ProductGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const hasImages = images && images.length > 0;

  return (
    <div className="product-gallery">
      {/* Main image display area */}
      <div className="product-gallery-main">
        {hasImages ? (
          <img
            src={images[activeIndex]}
            alt="Product view"
            className="product-gallery-main-img"
          />
        ) : (
          <div className="product-gallery-placeholder">
            <FiImage className="product-gallery-placeholder-svg" />
            <span>Image Unavailable</span>
          </div>
        )}
      </div>

      {/* Thumbnail navigation */}
      {hasImages && images.length > 1 && (
        <div className="product-gallery-thumbnails">
          {images.map((img, idx) => (
            <button
              key={idx}
              className={`product-gallery-thumbnail ${
                idx === activeIndex ? 'product-gallery-thumbnail-active' : ''
              }`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image thumbnail ${idx + 1}`}
            >
              <img
                src={img}
                alt={`View thumbnail ${idx + 1}`}
                className="product-gallery-thumbnail-img"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
