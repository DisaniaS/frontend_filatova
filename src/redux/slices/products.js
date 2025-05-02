import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import request from '../../utils/Request';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await request.get('/product/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateProductStatus = createAsyncThunk(
  'products/updateStatus',
  async ({ productId, isAccepted }, { rejectWithValue }) => {
    try {
      const response = await request.put(`/product/${productId}/status`, { is_accepted: isAccepted });
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
      const response = await request.get(`/product/report/${reportNumber}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    accepted: [],
    rejected: [],
    reportProducts: [], // Products from a specific report
    loading: false,
    error: null
  },
  reducers: {},
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
        state.error = action.payload?.detail || 'Произошла ошибка при загрузке данных';
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
      });
  }
});

export default productsSlice.reducer;