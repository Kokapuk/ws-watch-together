import { configureStore } from '@reduxjs/toolkit';
import toastsReducer from '../features/toasts/toastsSlice';

export const store = configureStore({
  reducer: {
    toasts: toastsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
