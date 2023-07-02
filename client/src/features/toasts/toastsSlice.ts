import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { Toast } from '../../utils/types';

export interface ToastsState {
  toasts: Toast[];
}

const initialState: ToastsState = {
  toasts: [],
};

export const toastsSlice = createSlice({
  name: 'toasts',
  initialState,
  reducers: {
    addToast: (state, { payload: { id, content } }: PayloadAction<Toast>) => {
      state.toasts.push({ id, content });
      setTimeout(() => {}, 2000);
    },
    removeToast: (state, { payload: id }: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== id);
    },
  },
});

export const { addToast, removeToast } = toastsSlice.actions;
export default toastsSlice.reducer;
