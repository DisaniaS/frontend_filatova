import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import request from "../../utils/Request"

export const getReports = createAsyncThunk('reports/getReports', async ({ skip, max }, { rejectWithValue }) => {
    try {
      const response = await request.get('reports/', { params: { skip, max } });
      return {
        reports: response.data.reports,
        count: response.data.count
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getReportByNumber = createAsyncThunk('reports/getReportByNumber', async (number, { rejectWithValue }) => {
  try {
      const response = await request.get(`/reports/${number}`);
      return response.data; // Предполагается, что ответ содержит данные отчёта
  } catch (error) {
      return rejectWithValue(error.response.data);
  }
});

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    cardsData: [],
    totalPages: 1,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReports.fulfilled, (state, action) => {
        state.loading = false;
        state.cardsData = action.payload.reports;
        state.totalPages = Math.ceil(action.payload.count / 5);
      })
      .addCase(getReports.rejected, (state, action) => {
        state.loading = false;
        state.error = ("payload" in action)?"Неизвестная ошибка":action.payload.detail;
      })
      .addCase(getReportByNumber.fulfilled, (state, action) => {
        state.cardsData = [action.payload];
      })
      .addCase(getReportByNumber.rejected, (state, action) => {
          state.error = ("payload" in action) ? "Неизвестная ошибка" : action.payload.detail;
      });
  },
});

export const reportsReducer = reportsSlice.reducer;