import { Link } from 'react-router-dom';

function HeroSlide({ slide }) {
  if (!slide) return null;

  const {
    bgGradient = 'var(--color-surface)',
    tag = 'FEATURED',
    offer = 'SPECIAL OFFER',
    title = 'Featured Product',
    description = '',
    link = '/shop',
    ctaText = 'Shop Now',
    image = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
  } = slide;

  return (
    <div
      className="hero-banner-slide"
      style={{ background: bgGradient }}
    >
      <div className="hero-banner-content">
        {tag && <span className="hero-banner-tag">{tag}</span>}
        {offer && <h3 className="hero-banner-offer">{offer}</h3>}
        <h1 className="hero-banner-title">{title}</h1>
        {description && <p className="hero-banner-desc">{description}</p>}
        <Link to={link} className="hero-banner-cta">
          {ctaText}
        </Link>
      </div>

      <div className="hero-banner-media">
        <img
          src={image}
          alt={title}
          className="hero-banner-img"
        />
      </div>
    </div>
  );
}

export default HeroSlide;
