import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiMap } from 'react-icons/fi';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check validation briefly
    if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields before sending.');
      return;
    }

    // Success response toast (no API query required)
    toast.success('Thank you! Your message has been received.');

    // Clear form inputs
    setFormData({
      fullName: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  return (
    <div className="container contact-page">
      {/* Contact Hero */}
      <section className="contact-hero">
        <span className="contact-hero-badge">Get in Touch</span>
        <h1 className="contact-hero-title">Contact Our Team</h1>
        <p className="contact-hero-subtitle">
          Have any questions about products, delivery, or custom orders? Reach out and we will help you.
        </p>
      </section>

      {/* Main Grid: Form and Sidebar Info */}
      <div className="contact-grid">
        {/* Form Card */}
        <div className="contact-form-card">
          <h2 className="contact-form-title">Send a Message</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-group">
              <label htmlFor="fullName" className="contact-label">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="contact-input"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-form-group">
              <label htmlFor="email" className="contact-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="contact-input"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-form-group">
              <label htmlFor="subject" className="contact-label">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="contact-input"
                placeholder="Product Inquiry / Return Request"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-form-group">
              <label htmlFor="message" className="contact-label">Message</label>
              <textarea
                id="message"
                name="message"
                className="contact-textarea"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="contact-submit-btn">
              <FiSend size={16} /> Send Message
            </button>
          </form>
        </div>

        {/* Sidebar Info Blocks */}
        <div className="contact-info-sidebar">
          {/* Info Details */}
          <div className="contact-info-block">
            <h2 className="contact-info-block-title">Contact Information</h2>
            <div className="contact-info-items">
              <div className="contact-info-item">
                <div className="contact-info-icon-wrapper">
                  <FiMapPin size={18} />
                </div>
                <div className="contact-info-item-details">
                  <span className="contact-info-item-label">Address</span>
                  <span className="contact-info-item-value">123 Commerce Avenue, New York, NY 10001</span>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon-wrapper">
                  <FiPhone size={18} />
                </div>
                <div className="contact-info-item-details">
                  <span className="contact-info-item-label">Phone</span>
                  <span className="contact-info-item-value">+1 (555) 123-4567</span>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon-wrapper">
                  <FiMail size={18} />
                </div>
                <div className="contact-info-item-details">
                  <span className="contact-info-item-label">Email</span>
                  <span className="contact-info-item-value">support@urbancart.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="contact-info-block">
            <h2 className="contact-info-block-title">
              <FiClock size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom', color: 'var(--color-primary)' }} />
              Business Hours
            </h2>
            <ul className="hours-list">
              <li className="hours-row">
                <span className="hours-day">Monday - Friday</span>
                <span className="hours-time">9:00 AM - 6:00 PM EST</span>
              </li>
              <li className="hours-row">
                <span className="hours-day">Saturday</span>
                <span className="hours-time">10:00 AM - 4:00 PM EST</span>
              </li>
              <li className="hours-row">
                <span className="hours-day">Sunday</span>
                <span className="hours-time">Closed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="contact-faq-section">
        <div className="about-section-header">
          <h2 className="about-section-title">Frequently Asked Questions</h2>
          <p className="about-section-desc">Quick answers to common questions about shopping with us.</p>
        </div>
        <div className="contact-faq-grid">
          <div className="contact-faq-card">
            <h3 className="contact-faq-question">What is your return policy?</h3>
            <p className="contact-faq-answer">
              We offer a 30-day hassle-free return window for all items in original condition.
            </p>
          </div>
          <div className="contact-faq-card">
            <h3 className="contact-faq-question">Do you offer free delivery?</h3>
            <p className="contact-faq-answer">
              Yes, free standard shipping is automatically applied to orders over $150.
            </p>
          </div>
          <div className="contact-faq-card">
            <h3 className="contact-faq-question">Can I track my order?</h3>
            <p className="contact-faq-answer">
              Yes, as soon as your product ships, you will receive a tracking link via email.
            </p>
          </div>
          <div className="contact-faq-card">
            <h3 className="contact-faq-question">What payment methods do you accept?</h3>
            <p className="contact-faq-answer">
              We accept Visa, Mastercard, American Express, PayPal, and Apple Pay.
            </p>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="contact-map-section">
        <div className="contact-map-placeholder">
          <FiMap className="contact-map-icon" />
          <h3 className="contact-map-title">Interactive Map Placeholder</h3>
          <p className="contact-map-text">123 Commerce Avenue, New York, NY 10001</p>
        </div>
      </section>
    </div>
  );
}

export default Contact;
