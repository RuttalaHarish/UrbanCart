import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiImage, FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCart } from '../../../context/CartContext';
import './ProductCard.css';

function ProductCard({ product }) {
  const { _id, name, brand, category, price, stock, images } = product;
  const isOutOfStock = stock === 0;
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(_id, 1);
      toast.success(`${name} added to cart!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      const msg = err.response?.data?.message || 'Failed to add item to cart. Please try again.';
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="product-card">
      {/* Media / Image Area */}
      <div className="product-card-media">
        {images && images.length > 0 ? (
          <img
            src={images[0]}
            alt={name}
            className="product-card-img"
            loading="lazy"
          />
        ) : (
          <div className="product-card-placeholder">
            <FiImage className="product-card-placeholder-svg" />
            <span>Image Unavailable</span>
          </div>
        )}

        {/* Stock Badge */}
        <span
          className={`product-card-badge ${
            isOutOfStock ? 'product-card-badge-outofstock' : 'product-card-badge-instock'
          }`}
        >
          {isOutOfStock ? 'Out Of Stock' : 'In Stock'}
        </span>
      </div>

      {/* Product Information Body */}
      <div className="product-card-body">
        <div className="product-card-category-brand">
          <span className="product-card-category">{category}</span>
          <span className="product-card-brand">{brand}</span>
        </div>
        <h3 className="product-card-name" title={name}>
          {name}
        </h3>
        <div className="product-card-price">${price.toFixed(2)}</div>

        {/* Action Buttons */}
        <div className="product-card-actions">
          <Link
            to={`/products/${_id}`}
            className="product-card-btn product-card-btn-secondary"
            aria-label={`View details of ${name}`}
          >
            <FiEye size={14} /> Details
          </Link>
          <button
            className="product-card-btn product-card-btn-primary"
            disabled={isOutOfStock || isAdding}
            onClick={handleAddToCart}
            aria-label={`Add ${name} to cart`}
          >
            <FiShoppingCart size={14} /> {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
