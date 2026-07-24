import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiGrid,
  FiTv,
  FiShoppingBag,
  FiBook,
  FiHome,
  FiActivity,
  FiPackage,
  FiHeart
} from 'react-icons/fi';
import './CategoryNav.css';

const CATEGORIES_DATA = [
  { name: 'All Products', param: '', icon: FiGrid },
  { name: 'Electronics', param: 'Electronics', icon: FiTv },
  { name: 'Fashion', param: 'Fashion', icon: FiShoppingBag },
  { name: 'Books', param: 'Books', icon: FiBook },
  { name: 'Home & Kitchen', param: 'Home & Kitchen', icon: FiHome },
  { name: 'Sports', param: 'Sports', icon: FiActivity },
  { name: 'Groceries', param: 'Groceries', icon: FiPackage },
  { name: 'Beauty', param: 'Beauty', icon: FiHeart },
];

function CategoryNav() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';

  const handleCategoryClick = (param) => {
    if (param) {
      navigate(`/shop?category=${encodeURIComponent(param)}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <nav className="category-nav-bar" aria-label="Quick Category Navigation">
      <div className="category-nav-container">
        {CATEGORIES_DATA.map((cat) => {
          const IconComponent = cat.icon;
          const isActive = cat.param
            ? currentCategory.toLowerCase() === cat.param.toLowerCase()
            : !currentCategory;

          return (
            <button
              key={cat.name}
              type="button"
              className={`category-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.param)}
            >
              <IconComponent className="category-nav-icon" size={18} />
              <span className="category-nav-label">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default CategoryNav;
