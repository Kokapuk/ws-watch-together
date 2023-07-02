import { uid } from 'uid';
import { store } from '../app/store';
import { addToast, removeToast } from '../features/toasts/toastsSlice';

export default (content: string, duration: number = 2000) => {
  const toast = { id: uid(16), content };

  store.dispatch(addToast(toast));

  setTimeout(() => {
    store.dispatch(removeToast(toast.id));
  }, duration);
};
