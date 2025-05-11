// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import activityReducer from './features/activitySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    activity: activityReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});