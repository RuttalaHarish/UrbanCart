import { Link } from 'react-router-dom';
import {
  FiSmartphone,
  FiWatch,
  FiShoppingBag,
  FiTv,
  FiHeart,
  FiAward,
  FiGrid,
  FiArrowRight,
} from 'react-icons/fi';
import './CategoryCard.css';

// Dynamic category helper function to assign a matching vector icon based on name
const getCategoryIcon = (name = '') => {
  const norm = name.toLowerCase();
  if (norm.includes('phone') || norm.includes('mobile')) return <FiSmartphone />;
  if (norm.includes('watch') || norm.includes('wearable')) return <FiWatch />;
  if (norm.includes('tv') || norm.includes('electronic') || norm.includes('monitor')) return <FiTv />;
  if (norm.includes('fashion') || norm.includes('cloth') || norm.includes('bag')) return <FiShoppingBag />;
  if (norm.includes('sport') || norm.includes('fitness')) return <FiAward />;
  if (norm.includes('beauty') || norm.includes('health')) return <FiHeart />;
  return <FiGrid />;
};

function CategoryCard({ category }) {
  const { name, description } = category;

  return (
    <div className="category-card">
      <div className="category-card__image-container">
        {getCategoryIcon(name)}
      </div>
      <h3 className="category-card__name">{name}</h3>
      <p className="category-card__description">
        {description || 'Explore our exclusive collection of quality products in this category.'}
      </p>
      <Link
        to={`/shop?category=${encodeURIComponent(name)}`}
        className="category-card__btn"
        aria-label={`Browse ${name} Category`}
      >
        Browse Category <FiArrowRight size={14} />
      </Link>
    </div>
  );
}

export default CategoryCard;
