// components/SignIn.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { signIn, clearError } from '@/redux/features/authSlice';
import { validateSignInForm } from '@/utils/validation';

export default function SignIn() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
  
  // Redirect to landing page if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/landing');
    }
  }, [isAuthenticated, router]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field error when typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    // Clear API error when typing
    if (error) {
      dispatch(clearError());
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    
    // Validate email
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    setFormErrors(errors);
    
    // If no errors, submit form
    if (Object.keys(errors).length === 0) {
      dispatch(signIn(formData));
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // กำหนดสไตล์สำหรับการจัดวางกึ่งกลางหน้าจอ
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '1rem'
  };
  
  const cardStyle = {
    maxWidth: '500px',
    width: '100%',
    background: 'white',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 0 24px rgba(0, 0, 0, 0.05)'
  };
  
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem' }}>Welcome Back!</h1>
        <p style={{ fontSize: '1rem', color: '#B3B3B3', textAlign: 'center', marginBottom: '1.5rem' }}>Sign in to your account to continue</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
            <input
              type="text"
              id="email"
              name="email"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #EBEBEB',
                borderRadius: '4px',
                outline: 'none'
              }}
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            {formErrors.email && <p style={{ color: '#DA0B62', fontSize: '0.8rem', marginTop: '0.25rem' }}>Invalid username</p>}
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '1px solid #EBEBEB',
                  borderRadius: '4px',
                  outline: 'none'
                }}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formErrors.password && <p style={{ color: '#DA0B62', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.password}</p>}
          </div>
          
          {/* แสดงข้อความแจ้งเตือนจาก API ก่อนปุ่ม Sign In */}
          {error && (
            <div style={{ color: '#DA0B62', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1rem' }}>
              Invalid email or password
            </div>
          )}
          
          <div style={{ marginBottom: '1.5rem' }}>
            <button 
              type="submit" 
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: '#0BDAA5',
                color: 'white'
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
        
        <div style={{ textAlign: 'center' }}>
          <p>New User? <Link href="/signup" style={{ color: '#0BDAA5', textDecoration: 'none' }}>Sign up!</Link></p>
        </div>
      </div>
    </div>
  );
}