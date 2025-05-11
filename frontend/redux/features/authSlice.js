// redux/features/authSlice.js
'use client';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setCookie, deleteCookie } from 'cookies-next';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Async thunks
export const signUp = createAsyncThunk(
  'auth/signUp',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Sign up failed' });
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signin`, credentials);
      const { token, user } = response.data;
      
      // Store token in cookies
      setCookie('token', token, { maxAge: 60 * 60 * 24 }); // 1 day
      
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Sign in failed' });
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { dispatch }) => {
    // Remove token from cookies
    deleteCookie('token');
    return null;
  }
);

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign up
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Sign up failed';
      })
      
      // Sign in
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Sign in failed';
      })
      
      // Sign out
      .addCase(signOut.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;