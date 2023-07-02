import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import styles from '../styles/Toasts.module.scss';

const Toasts = () => {
  const toasts = useSelector((state: RootState) => state.toasts.toasts);

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <span className={styles.toast} key={toast.id}>
          <h3>{toast.content}</h3>
        </span>
      ))}
    </div>
  );
};

export default Toasts;
