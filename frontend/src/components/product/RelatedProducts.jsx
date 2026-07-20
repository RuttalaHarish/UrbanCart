import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PRODUCT_ENDPOINTS } from '../../constants';
import ProductCard from '../home/FeaturedProducts/ProductCard';
import './RelatedProducts.css';

function RelatedProducts({ currentProductId, category }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      try {
        const response = await api.get(PRODUCT_ENDPOINTS.LIST);
        if (response.data && Array.isArray(response.data.data)) {
          const filtered = response.data.data
            .filter(
              (prod) =>
                prod._id !== currentProductId &&
                prod.category.toLowerCase() === category.toLowerCase()
            )
            .slice(0, 4);
          setRelated(filtered);
        }
      } catch (err) {
        console.error('Failed loading related products:', err);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchRelated();
    }
  }, [currentProductId, category]);

  if (loading) {
    return (
      <div className="related-products">
        <h3 className="related-products-title">Related Products</h3>
        <div className="related-products-loader">Loading recommendations...</div>
      </div>
    );
  }

  if (related.length === 0) {
    return null;
  }

  return (
    <div className="related-products">
      <h3 className="related-products-title">Related Products</h3>
      <div className="related-products-grid">
        {related.map((prod) => (
          <ProductCard key={prod._id} product={prod} />
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
