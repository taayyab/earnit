import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

export const fetchThreads = createAsyncThunk('messages/fetchThreads', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/messages/threads');
    return (res.data.threads || []).map((t) => ({ ...t, source: 'threads' }));
  } catch {
    return [];
  }
});

export const fetchMessages = createAsyncThunk('messages/fetchMessages', async ({ thread, currentUserId }, { rejectWithValue }) => {
  try {
    if (thread?.source === 'threads' || thread?.source === 'new') {
      if (thread.source === 'new') return [];
      const res = await api.get(`/messages/threads/${thread.thread_id}/messages`);
      return res.data.messages || [];
    }
    const participantId = thread?.participant_id || thread?.thread_id;
    if (!participantId || !currentUserId) return [];
    const res = await api.get('/messages/conversation', { params: { userId1: currentUserId, userId2: participantId } });
    return (res.data.messages || []).slice().reverse();
  } catch {
    return [];
  }
});

export const sendMessage = createAsyncThunk('messages/send', async ({ thread, content, currentUserId }, { dispatch, rejectWithValue }) => {
  try {
    if (thread?.source === 'threads') {
      await api.post(`/messages/threads/${thread.thread_id}/messages`, { content, contains_phi: false });
    } else {
      const recipientId = thread?.participant_id || thread?.thread_id;
      await api.post('/messages', { senderId: currentUserId, recipientId, content });
    }
    await dispatch(fetchMessages({ thread, currentUserId }));
    await dispatch(fetchThreads());
    return true;
  } catch (err) {
    return rejectWithValue('Failed to send message');
  }
});

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    threads: [],
    selectedThread: null,
    messages: [],
    loading: false,
    sending: false,
    error: null,
  },
  reducers: {
    selectThread(state, action) { state.selectedThread = action.payload; state.messages = []; },
    prependThread(state, action) {
      // Add a synthetic thread (e.g., when starting new conversation from claim detail)
      const exists = state.threads.find((t) => t.thread_id === action.payload.thread_id);
      if (!exists) state.threads = [action.payload, ...state.threads];
      state.selectedThread = action.payload;
    },
    clearMessages(state) { state.messages = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThreads.pending, (state) => { state.loading = true; })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.loading = false;
        state.threads = action.payload;
        if (!state.selectedThread && action.payload.length > 0) state.selectedThread = action.payload[0];
      })
      .addCase(fetchThreads.rejected, (state) => { state.loading = false; })
      .addCase(fetchMessages.fulfilled, (state, action) => { state.messages = action.payload; })
      .addCase(sendMessage.pending, (state) => { state.sending = true; state.error = null; })
      .addCase(sendMessage.fulfilled, (state) => { state.sending = false; })
      .addCase(sendMessage.rejected, (state, action) => { state.sending = false; state.error = action.payload; });
  },
});

export const { selectThread, prependThread, clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
