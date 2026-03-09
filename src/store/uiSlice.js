import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    globalLoading: false,
    sidebarOpen: true,
  },
  reducers: {
    setGlobalLoading(state, action) { state.globalLoading = action.payload; },
    setSidebarOpen(state, action) { state.sidebarOpen = action.payload; },
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen; },
  },
});

export const { setGlobalLoading, setSidebarOpen, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
