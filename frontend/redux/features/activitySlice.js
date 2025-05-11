// redux/features/activitySlice.js
'use client';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch a random activity
export const fetchRandomActivity = createAsyncThunk(
  'activity/fetchRandom',
  async (_, { rejectWithValue }) => {
    try {
      // เปลี่ยน URL เป็น URL ใหม่
      const response = await axios.get('https://bored-api.appbrewery.com/random');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch activity' });
    }
  }
);

// Initial state
const initialState = {
  activity: null,
  isLoading: false,
  error: null,
};

// Activity slice
const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRandomActivity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRandomActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activity = action.payload;
      })
      .addCase(fetchRandomActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch activity';
      });
  },
});

export default activitySlice.reducer;