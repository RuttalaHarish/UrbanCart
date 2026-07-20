import { FiTarget, FiEye, FiTruck, FiShield, FiSmile, FiPackage, FiHeart, FiSettings } from 'react-icons/fi';
import './About.css';

function About() {
  return (
    <div className="container about-page">
      {/* Hero Banner */}
      <section className="about-hero">
        <span className="about-hero-badge">About Us</span>
        <h1 className="about-hero-title">Welcome to UrbanCart</h1>
        <p className="about-hero-subtitle">
          We are redefining the modern shopping experience by offering a curated catalog of premium products, fast delivery, and secure payments.
        </p>
      </section>

      {/* Story Section */}
      <section className="about-story-section">
        <div className="about-story-content">
          <h2 className="about-story-title">Our Story</h2>
          <p className="about-story-text">
            Founded in 2026, UrbanCart started with a simple idea: shopping should be smart, seamless, and enjoyable. We recognized that online buyers face cluttered interfaces, slow loading times, and generic recommendations.
          </p>
          <p className="about-story-text">
            Our team set out to build an ecosystem focusing on aesthetics and speed. We partner directly with premium brands to deliver high-quality home goods, accessories, and essentials straight to your door.
          </p>
        </div>
        <div className="about-story-image-placeholder">
          {/* Custom vector illustration of shopping baskets and screens */}
          <svg
            className="about-story-image-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="about-mission-vision-grid">
        <div className="about-card">
          <div className="about-card-icon-wrapper">
            <FiTarget size={26} />
          </div>
          <h3 className="about-card-title">Our Mission</h3>
          <p className="about-card-desc">
            To provide high-quality items at accessible price points, backed by an optimized user interface that respects the customer's time and choice.
          </p>
        </div>
        <div className="about-card">
          <div className="about-card-icon-wrapper">
            <FiEye size={26} />
          </div>
          <h3 className="about-card-title">Our Vision</h3>
          <p className="about-card-desc">
            To become the leading globally recognized modern commerce marketplace, leading the industry in interface speed, customer support, and supply chain transparency.
          </p>
        </div>
      </section>

      {/* Why Choose Us & Features Grid */}
      <section className="about-features-section">
        <div className="about-section-header">
          <h2 className="about-section-title">Why Choose UrbanCart</h2>
          <p className="about-section-desc">
            We build features around what matters most to our community.
          </p>
        </div>
        <div className="about-features-grid">
          <div className="about-feature-item">
            <div className="about-feature-icon">
              <FiTruck size={20} />
            </div>
            <h4 className="about-feature-title">Ultra-Fast Shipping</h4>
            <p className="about-feature-text">
              We process and ship orders within 24 hours to ensure your packages arrive ahead of schedule.
            </p>
          </div>
          <div className="about-feature-item">
            <div className="about-feature-icon">
              <FiShield size={20} />
            </div>
            <h4 className="about-feature-title">Secure Payments</h4>
            <p className="about-feature-text">
              Industry-standard encryption guarantees your payment data is secure and protected at checkout.
            </p>
          </div>
          <div className="about-feature-item">
            <div className="about-feature-icon">
              <FiSmile size={20} />
            </div>
            <h4 className="about-feature-title">Customer Satisfaction</h4>
            <p className="about-feature-text">
              Our 24/7 dedicated support team handles queries immediately with a smile.
            </p>
          </div>
          <div className="about-feature-item">
            <div className="about-feature-icon">
              <FiPackage size={20} />
            </div>
            <h4 className="about-feature-title">Curated Selection</h4>
            <p className="about-feature-text">
              Every item in our storefront is handpicked to verify material quality and design standards.
            </p>
          </div>
          <div className="about-feature-item">
            <div className="about-feature-icon">
              <FiHeart size={20} />
            </div>
            <h4 className="about-feature-title">Community First</h4>
            <p className="about-feature-text">
              We donate a portion of all sales back to community sustainability programs and initiatives.
            </p>
          </div>
          <div className="about-feature-item">
            <div className="about-feature-icon">
              <FiSettings size={20} />
            </div>
            <h4 className="about-feature-title">Custom Experience</h4>
            <p className="about-feature-text">
              A personalized dashboard helps you save wishlists, manage addresses, and check order statuses.
            </p>
          </div>
        </div>
      </section>

      {/* Customer First Statement */}
      <section className="about-statement">
        <h2 className="about-statement-title">Our Promise to You</h2>
        <p className="about-statement-text">
          "We believe shopping is not just about transactions, but about building relationships of trust. We commit to continuous improvement, resolving feedback, and delivering delight in every package."
        </p>
      </section>
    </div>
  );
}

export default About;
