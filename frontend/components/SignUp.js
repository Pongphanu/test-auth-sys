// components/SignUp.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { signUp, clearError } from '@/redux/features/authSlice';
import { validatePassword } from '@/utils/validation';

export default function SignUp() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  
  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
  
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
    
    // Validate required fields
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }
    
    // Validate email
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const { isValid, validations } = validatePassword(formData.password);
      if (!isValid) {
        if (!validations.length) {
          errors.password = 'Password must be at least 8 characters long';
        } else if (!validations.uppercase) {
          errors.password = 'Password must contain at least 1 uppercase letter';
        } else if (!validations.lowercase) {
          errors.password = 'Password must contain at least 1 lowercase letter';
        } else if (!validations.number) {
          errors.password = 'Password must contain at least 1 number';
        } else if (!validations.specialChar) {
          errors.password = 'Password must contain at least 1 special character';
        }
      }
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    
    // If no errors, submit form
    if (Object.keys(errors).length === 0) {
      // Create user object from form data (excluding confirmPassword)
      const { confirmPassword, ...userData } = formData;
      
      dispatch(signUp(userData))
        .unwrap()
        .then(() => {
          setSignUpSuccess(true);
          console.log('User input:', userData);
          
          // Reset form
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
          
          // Redirect to sign-in page after a short delay
          setTimeout(() => {
            router.push('/');
          }, 2000);
        })
        .catch((error) => {
          console.error('Sign up failed:', error);
        });
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', textAlign: 'center', marginBottom: '1.5rem' }}>Sign Up</h1>
        
        {error && (
          <div style={{ color: '#DA0B62', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        {signUpSuccess && (
          <div style={{ color: '#0BDAA5', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1rem' }}>
            Sign up successful! Redirecting to sign in...
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="firstName" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #EBEBEB',
                borderRadius: '4px',
                outline: 'none'
              }}
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
            />
            {formErrors.firstName && <p style={{ color: '#DA0B62', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.firstName}</p>}
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="lastName" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #EBEBEB',
                borderRadius: '4px',
                outline: 'none'
              }}
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
            {formErrors.lastName && <p style={{ color: '#DA0B62', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.lastName}</p>}
          </div>
          
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
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '1px solid #EBEBEB',
                  borderRadius: '4px',
                  outline: 'none'
                }}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
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
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formErrors.confirmPassword && <p style={{ color: '#DA0B62', fontSize: '0.8rem', marginTop: '0.25rem' }}>Invalid confirm password</p>}
          </div>
          
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
              disabled={isLoading || signUpSuccess}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </form>
        
        <div style={{ textAlign: 'center' }}>
          <p>Already have an account? <Link href="/" style={{ color: '#0BDAA5', textDecoration: 'none' }}>Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}