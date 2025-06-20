import React, { useState } from 'react';

interface PersonalInfoForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const PersonalInfo: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PersonalInfoForm>>({});
  
  const [formData, setFormData] = useState<PersonalInfoForm>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-01-15',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof PersonalInfoForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonalInfoForm> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsEditing(false);
      // Show success notification (would integrate with notification system)
    } catch (error) {
      console.error('Failed to save personal info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Reset form data to original values (would fetch from API)
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle avatar upload (would integrate with file upload service)
      console.log('Uploading avatar:', file.name);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary">Personal Information</h2>
          <p className="text-secondary text-sm mt-1">
            Manage your personal details and contact information
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary btn-sm"
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Avatar Section */}
      <div className="card mb-6">
        <div className="card-body">
          <h3 className="font-semibold text-primary mb-4">Profile Picture</h3>
          <div className="flex items-center gap-4">
            <div className="user-avatar user-avatar-large">
              <div className="avatar-placeholder">
                JD
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-secondary mb-2">
                Upload a profile picture to personalize your account
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
                disabled={!isEditing}
              />
              <label
                htmlFor="avatar-upload"
                className={`btn btn-secondary btn-sm ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                📷 Change Photo
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Form */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="form-group">
              <label htmlFor="firstName" className="form-label required">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input ${errors.firstName ? 'error' : ''}`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <div className="form-error">{errors.firstName}</div>
              )}
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label htmlFor="lastName" className="form-label required">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input ${errors.lastName ? 'error' : ''}`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <div className="form-error">{errors.lastName}</div>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label required">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <div className="form-error">{errors.email}</div>
              )}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label required">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <div className="form-error">{errors.phone}</div>
              )}
            </div>

            {/* Date of Birth */}
            <div className="form-group">
              <label htmlFor="dateOfBirth" className="form-label required">
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
              />
              {errors.dateOfBirth && (
                <div className="form-error">{errors.dateOfBirth}</div>
              )}
            </div>

            {/* Country */}
            <div className="form-group">
              <label htmlFor="country" className="form-label">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-select"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
              </select>
            </div>

            {/* Address */}
            <div className="form-group md:col-span-2">
              <label htmlFor="address" className="form-label">
                Street Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
                placeholder="Enter your street address"
              />
            </div>

            {/* City */}
            <div className="form-group">
              <label htmlFor="city" className="form-label">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
                placeholder="Enter your city"
              />
            </div>

            {/* State */}
            <div className="form-group">
              <label htmlFor="state" className="form-label">
                State/Province
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
                placeholder="Enter your state/province"
              />
            </div>

            {/* Zip Code */}
            <div className="form-group">
              <label htmlFor="zipCode" className="form-label">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
                placeholder="Enter your ZIP/postal code"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-primary">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner mr-2"></span>
                    Saving...
                  </>
                ) : (
                  '💾 Save Changes'
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="btn btn-ghost"
              >
                ❌ Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo; 