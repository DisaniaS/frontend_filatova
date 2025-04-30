import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import request from '../../utils/Request';

export const calculateInaccuracies = createAsyncThunk(
  'inaccuracy/calculate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await request.post('/inaccuracy/calculate');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getCalculationStatus = createAsyncThunk(
  'inaccuracy/status',
  async (_, { rejectWithValue }) => {
    try {
      const response = await request.get('/inaccuracy/status');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchErrorData = createAsyncThunk(
  'inaccuracy/fetchErrorData',
  async (_, { rejectWithValue }) => {
      try {
          const response = await request.get('/inaccuracy/error-data');
          return response.data;
      } catch (error) {
          return rejectWithValue(error.response.data);
      }
  }
);

const inaccuracySlice = createSlice({
  name: 'inaccuracy',
  initialState: {
    loading: false,
    error: null,
    calculationMessage: null,
    uncalculatedCount: 0,
    hasUncalculated: false,
  },
  reducers: {
    clearCalculationMessage: (state) => {
      state.calculationMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(calculateInaccuracies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateInaccuracies.fulfilled, (state, action) => {
        state.loading = false;
        state.calculationMessage = action.payload.message;
      })
      .addCase(calculateInaccuracies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Произошла ошибка';
      })
      .addCase(getCalculationStatus.fulfilled, (state, action) => {
        state.uncalculatedCount = action.payload.uncalculated_count;
        state.hasUncalculated = action.payload.has_uncalculated;
      })
      .addCase(fetchErrorData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchErrorData.fulfilled, (state, action) => {
          state.loading = false;
          state.errorData = action.payload;
      })
      .addCase(fetchErrorData.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.detail || 'Произошла ошибка при загрузке данных';
      });
  },
});

export const { clearCalculationMessage } = inaccuracySlice.actions;
export default inaccuracySlice.reducer;