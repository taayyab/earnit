import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

const STALE_MS = 30_000;
const LIST_STALE_MS = 300_000; // 5 min for advocates list

export const fetchMyAdvocate = createAsyncThunk('advocate/fetchMine', async (_, { getState, rejectWithValue }) => {
  const { myLastFetched } = getState().advocate;
  if (myLastFetched && Date.now() - myLastFetched < STALE_MS) return null;
  try {
    const res = await api.get('/advocates/my-advocate');
    return res.data.hasAdvocate ? res.data.advocate : null;
  } catch {
    return null;
  }
});

export const fetchAdvocatesList = createAsyncThunk('advocate/fetchList', async (_, { getState, rejectWithValue }) => {
  const { listLastFetched } = getState().advocate;
  if (listLastFetched && Date.now() - listLastFetched < LIST_STALE_MS) return null;
  try {
    const res = await api.get('/advocates');
    return res.data.advocates || [];
  } catch (err) {
    return rejectWithValue('Failed to load advocates');
  }
});

const advocateSlice = createSlice({
  name: 'advocate',
  initialState: {
    myAdvocate: null,
    list: [],
    loading: false,
    listLoading: false,
    myLastFetched: null,
    listLastFetched: null,
  },
  reducers: {
    invalidateAdvocateCache(state) { state.myLastFetched = null; state.listLastFetched = null; },
    setMyAdvocate(state, action) { state.myAdvocate = action.payload; state.myLastFetched = Date.now(); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAdvocate.pending, (state) => { state.loading = true; })
      .addCase(fetchMyAdvocate.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload !== null) { state.myAdvocate = action.payload; state.myLastFetched = Date.now(); }
      })
      .addCase(fetchMyAdvocate.rejected, (state) => { state.loading = false; })
      .addCase(fetchAdvocatesList.pending, (state) => { state.listLoading = true; })
      .addCase(fetchAdvocatesList.fulfilled, (state, action) => {
        state.listLoading = false;
        if (action.payload !== null) { state.list = action.payload; state.listLastFetched = Date.now(); }
      })
      .addCase(fetchAdvocatesList.rejected, (state) => { state.listLoading = false; });
  },
});

export const { invalidateAdvocateCache, setMyAdvocate } = advocateSlice.actions;
export default advocateSlice.reducer;
