import { configureStore } from '@reduxjs/toolkit';
import claimsReducer from './claimsSlice';
import advocateReducer from './advocateSlice';
import messagesReducer from './messagesSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    claims: claimsReducer,
    advocate: advocateReducer,
    messages: messagesReducer,
    ui: uiReducer,
  },
});

export default store;
