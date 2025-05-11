// components/Landing.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '@/redux/features/authSlice';
import { fetchRandomActivity } from '@/redux/features/activitySlice';

export default function Landing() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activity, isLoading } = useSelector((state) => state.activity);
  
  // Fetch random activity when component mounts
  useEffect(() => {
    dispatch(fetchRandomActivity());
  }, [dispatch]);
  
  const handleGetNewActivity = () => {
    dispatch(fetchRandomActivity())
      .then(result => {
        // This will execute when the fetchRandomActivity action is fulfilled
        console.log('New Activity Fetched:', result.payload);
      })
      .catch(error => {
        // This will execute if there's an error
        console.error('Error fetching activity:', error);
      });
  };
  
  const handleSignOut = () => {
    console.log('Sign Out button clicked');
    dispatch(signOut());
    router.push('/');
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '1rem',
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{ 
        maxWidth: '500px', 
        width: '100%', 
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 0 24px rgba(0, 0, 0, 0.05)',
        padding: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          textAlign: 'center',
          margin: '0 0 0.5rem 0',
          color: '#212433'
        }}>Landing Page</h1>
        
        <p style={{ 
          fontSize: '1rem',
          textAlign: 'center',
          margin: '0 0 2rem 0'
        }}>Let's find something to do!</p>
        
        <div style={{ marginBottom: '2rem' }}>
          {/* Activity */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '0.5rem 0',
            borderBottom: '1px solid #EBEBEB'
          }}>
            <div style={{ color: '#212433', fontWeight: '500' }}>Activity:</div>
            <div style={{ textAlign: 'right' }}>
              {isLoading ? 'Loading...' : activity?.activity || 'No activity found'}
            </div>
          </div>
          
          {/* Type */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '0.5rem 0',
            borderBottom: '1px solid #EBEBEB'
          }}>
            <div style={{ color: '#212433', fontWeight: '500' }}>Type:</div>
            <div style={{ textAlign: 'right' }}>
              {activity?.type || ''}
            </div>
          </div>
          
          {/* Participant and Budget - แสดงในบรรทัดเดียวกัน */}
          <div style={{ 
            display: 'flex', 
            padding: '0.5rem 0',
            borderBottom: '1px solid #EBEBEB'
          }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ color: '#212433', fontWeight: '500' }}>Participant:</div>
              <div>{activity?.participants || ''}</div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', marginLeft: '1rem' }}>
              <div style={{ color: '#212433', fontWeight: '500' }}>Budget:</div>
              <div>${activity?.price ? (activity.price * 100).toFixed(2) : '0.00'}</div>
            </div>
          </div>
        </div>
        
        {/* Get New Activity button */}
        <button 
          onClick={handleGetNewActivity}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            backgroundColor: '#0BDAA5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          Get New Activity
        </button>
        
        {/* Sign Out button */}
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={handleSignOut}
            style={{
              background: 'none',
              border: 'none',
              color: '#DA0B62',
              cursor: 'pointer',
              fontSize: '0.9rem',
              padding: '0.5rem'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}