import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import request from '../../utils/Request';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/product/status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка при получении списка изделий');
    }
  }
);

export const updateProductStatus = createAsyncThunk(
  'products/updateStatus',
  async ({ productId, isAccepted }, { rejectWithValue }) => {
    try {
      const response = await request.put(`/api/product/${productId}/status`, { is_accepted: isAccepted });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchProductsByReport = createAsyncThunk(
  'products/fetchByReport',
  async (reportNumber, { rejectWithValue }) => {
    try {
      const response = await request.get(`/api/product/report/${reportNumber}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const checkProductsStatus = createAsyncThunk(
  'products/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/product/check-status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка при проверке статуса изделий');
    }
  }
);

const initialState = {
  accepted: [],
  rejected: [],
  reportProducts: [], // Products from a specific report
  loading: false,
  error: null,
  statusCheck: {
    loading: false,
    error: null,
    lastCheck: null
  }
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.statusCheck.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.accepted = action.payload.accepted;
        state.rejected = action.payload.rejected;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProductStatus.fulfilled, (state, action) => {
        // After updating, we'll refetch the products so no need to update state here
      })
      .addCase(fetchProductsByReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reportProducts = action.payload;
      })
      .addCase(fetchProductsByReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Произошла ошибка при загрузке данных';
      })
      .addCase(checkProductsStatus.pending, (state) => {
        state.statusCheck.loading = true;
        state.statusCheck.error = null;
      })
      .addCase(checkProductsStatus.fulfilled, (state, action) => {
        state.statusCheck.loading = false;
        state.statusCheck.lastCheck = new Date().toISOString();
      })
      .addCase(checkProductsStatus.rejected, (state, action) => {
        state.statusCheck.loading = false;
        state.statusCheck.error = action.payload;
      });
  }
});

export const { clearError } = productsSlice.actions;
export default productsSlice.reducer;