import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PRODUCT_ENDPOINTS } from '../../constants';
import { sampleProducts } from '../../data/sampleProducts';
import ProductCard from '../home/FeaturedProducts/ProductCard';
import './RelatedProducts.css';

function RelatedProducts({ currentProductId, category }) {
  const fallbackRelated = sampleProducts
    .filter(
      (prod) =>
        prod._id !== currentProductId &&
        (!category || (prod.category || '').toLowerCase() === (category || '').toLowerCase())
    )
    .slice(0, 4);

  const [related, setRelated] = useState(fallbackRelated);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await api.get(PRODUCT_ENDPOINTS.LIST);
        if (response.data && Array.isArray(response.data.data)) {
          const filtered = response.data.data
            .filter(
              (prod) =>
                prod._id !== currentProductId &&
                prod.category?.toLowerCase() === category?.toLowerCase()
            )
            .slice(0, 4);
          if (filtered.length > 0) setRelated(filtered);
        }
      } catch (err) {
        console.warn('Failed loading backend related products, using instant fallback:', err);
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
