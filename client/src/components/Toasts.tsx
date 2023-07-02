import { useSelector } from 'react-redux';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { RootState } from '../app/store';
import styles from '../styles/Toasts.module.scss';

const Toasts = () => {
  const toasts = useSelector((state: RootState) => state.toasts.toasts);

  return (
    <TransitionGroup className={styles.container}>
      {toasts.map((toast) => (
        <CSSTransition
          key={toast.id}
          timeout={200}
          classNames={{
            enter: styles['toast_enter'],
            enterActive: styles['toast_enter-active'],
            exit: styles['toast_exit'],
            exitActive: styles['toast_exit-active'],
          }}>
          <span className={styles.toast}>
            <h3>{toast.content}</h3>
          </span>
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
};

export default Toasts;
