import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

const STALE_MS = 30_000; // 30 seconds

export const fetchClaims = createAsyncThunk('claims/fetchList', async (_, { getState, rejectWithValue }) => {
  const { lastFetched } = getState().claims;
  if (lastFetched && Date.now() - lastFetched < STALE_MS) return null; // use cached
  try {
    const res = await api.get('/claims/list');
    return res.data.claims || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load claims');
  }
});

export const fetchClaim = createAsyncThunk('claims/fetchOne', async (claimId, { getState, rejectWithValue }) => {
  const cached = getState().claims.currentClaim;
  if (cached?.id === claimId && getState().claims.claimLastFetched && Date.now() - getState().claims.claimLastFetched < STALE_MS) return null;
  try {
    const res = await api.get(`/claims/${claimId}`);
    return res.data.claim || res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load claim');
  }
});

export const invalidateClaims = createAsyncThunk('claims/invalidate', async () => null);

const claimsSlice = createSlice({
  name: 'claims',
  initialState: {
    list: [],
    currentClaim: null,
    loading: false,
    claimLoading: false,
    error: null,
    lastFetched: null,
    claimLastFetched: null,
  },
  reducers: {
    clearCurrentClaim(state) { state.currentClaim = null; state.claimLastFetched = null; },
    invalidateClaimsCache(state) { state.lastFetched = null; state.claimLastFetched = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClaims.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchClaims.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload !== null) { state.list = action.payload; state.lastFetched = Date.now(); }
      })
      .addCase(fetchClaims.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchClaim.pending, (state) => { state.claimLoading = true; })
      .addCase(fetchClaim.fulfilled, (state, action) => {
        state.claimLoading = false;
        if (action.payload !== null) { state.currentClaim = action.payload; state.claimLastFetched = Date.now(); }
      })
      .addCase(fetchClaim.rejected, (state, action) => { state.claimLoading = false; state.error = action.payload; });
  },
});

export const { clearCurrentClaim, invalidateClaimsCache } = claimsSlice.actions;
export default claimsSlice.reducer;
