import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiCalendar,
  FiSave,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import api from '../api/axios';
import { USER_ENDPOINTS } from '../constants';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

function Profile() {
  const { updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    createdAt: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(USER_ENDPOINTS.PROFILE);
      if (response.data && response.data.data) {
        const p = response.data.data;
        setFormData({
          name: p.name || '',
          email: p.email || '',
          phone: p.phone || '',
          address: p.address || '',
          role: p.role || 'customer',
          createdAt: p.createdAt || '',
        });
      } else {
        throw new Error('Invalid profile response format');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError(err.response?.data?.message || 'Unable to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put(USER_ENDPOINTS.PROFILE, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });

      if (response.data && response.data.success) {
        const updatedData = response.data.data;
        setFormData((prev) => ({
          ...prev,
          name: updatedData.name,
          phone: updatedData.phone,
          address: updatedData.address,
        }));

        // Update Auth Context & localStorage
        updateUser(updatedData);

        toast.success(response.data.message || 'Profile updated successfully');
      } else {
        toast.error(response.data?.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error(err.response?.data?.message || 'Server error while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = formData.createdAt
    ? new Date(formData.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  /* ─── Loading Skeleton ─── */
  if (loading) {
    return (
      <div className="container profile-page">
        <div className="profile-header-block">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Loading your account details...</p>
        </div>
        <div className="profile-skeleton">
          <div className="profile-skeleton-card" />
          <div className="profile-skeleton-card" />
        </div>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error) {
    return (
      <div className="container profile-page">
        <div className="profile-card" style={{ textAlign: 'center', padding: '40px' }}>
          <FiAlertCircle size={48} style={{ color: 'var(--color-error, #ef4444)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Unable to Load Profile</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>{error}</p>
          <button
            type="button"
            className="profile-submit-btn"
            onClick={fetchProfile}
            style={{ margin: '0 auto' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container profile-page">
      <div className="profile-header-block">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">Manage your personal information and preferences</p>
      </div>

      <div className="profile-grid">
        {/* Card 1: Personal Information (Editable) */}
        <div className="profile-card">
          <div className="profile-card__header">
            <FiUser className="profile-card__icon" />
            <h2 className="profile-card__title">Personal Information</h2>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="profile-form__group">
              <label className="profile-form__label" htmlFor="profile-name">
                Full Name
              </label>
              <div className="profile-form__input-wrapper">
                <FiUser className="profile-form__input-icon" size={16} />
                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  className="profile-form__input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="profile-form__group">
              <label className="profile-form__label" htmlFor="profile-phone">
                Phone Number
              </label>
              <div className="profile-form__input-wrapper">
                <FiPhone className="profile-form__input-icon" size={16} />
                <input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  className="profile-form__input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Address */}
            <div className="profile-form__group">
              <label className="profile-form__label" htmlFor="profile-address">
                Shipping Address
              </label>
              <div className="profile-form__input-wrapper">
                <FiMapPin className="profile-form__input-icon" size={16} style={{ top: '14px' }} />
                <textarea
                  id="profile-address"
                  name="address"
                  className="profile-form__textarea"
                  placeholder="Enter street address, city, state, and zip code"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="profile-submit-btn"
              disabled={saving}
            >
              <FiSave size={16} />
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Card 2: Account Details (Read-only) */}
        <div className="profile-card">
          <div className="profile-card__header">
            <FiShield className="profile-card__icon" />
            <h2 className="profile-card__title">Account Information</h2>
          </div>

          <div className="account-info-list">
            {/* Email */}
            <div className="account-info-item">
              <div className="account-info-item__label">
                <FiMail size={16} />
                <span>Email Address</span>
              </div>
              <span className="account-info-item__value">{formData.email}</span>
            </div>

            {/* Role */}
            <div className="account-info-item">
              <div className="account-info-item__label">
                <FiShield size={16} />
                <span>Account Role</span>
              </div>
              <span className="role-badge">{formData.role}</span>
            </div>

            {/* Member Since */}
            <div className="account-info-item">
              <div className="account-info-item__label">
                <FiCalendar size={16} />
                <span>Member Since</span>
              </div>
              <span className="account-info-item__value">{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
