import { Link } from 'react-router-dom';
import './Hero.css';

function Hero() {
  return (
    <section className="hero-section">
      {/* Left Content */}
      <div className="hero-content">
        <span className="hero-badge">New Collection</span>
        <h1 className="hero-title">
          Shop Smarter With <span>UrbanCart</span>
        </h1>
        <p className="hero-subtitle">
          Discover premium products with modern shopping experience, fast delivery, and secure payments.
        </p>
        <div className="hero-actions">
          <Link to="/shop" className="hero-btn hero-btn--primary">
            Shop Now
          </Link>
          <Link to="/shop" className="hero-btn hero-btn--secondary">
            Explore Products
          </Link>
        </div>
      </div>

      {/* Right Modern Vector/CSS Illustration */}
      <div className="hero-illustration">
        <div className="hero-illustration-glow" />
        <svg
          className="hero-illustration-svg"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main abstract shopping bag silhouette */}
          <rect x="50" y="70" width="100" height="90" rx="16" fill="url(#hero-gradient-1)" />
          {/* Handle */}
          <path
            d="M75 70C75 45.1472 90.1472 30 100 30C109.853 30 125 45.1472 125 70"
            stroke="url(#hero-gradient-2)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Decorative tag overlay */}
          <rect x="85" y="95" width="30" height="40" rx="6" fill="#ffffff" opacity="0.9" />
          <line x1="93" y1="107" x2="107" y2="107" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
          <line x1="93" y1="115" x2="107" y2="115" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
          <line x1="93" y1="123" x2="101" y2="123" stroke="#d946ef" strokeWidth="3" strokeLinecap="round" />
          {/* Little abstract sparkle */}
          <path d="M155 50L158 58L166 61L158 64L155 72L152 64L144 61L152 58L155 50Z" fill="#d946ef" />
          {/* Gradients */}
          <defs>
            <linearGradient id="hero-gradient-1" x1="50" y1="70" x2="150" y2="160" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563eb" />
              <stop offset="1" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="hero-gradient-2" x1="75" y1="30" x2="125" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b82f6" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
}

export default Hero;
