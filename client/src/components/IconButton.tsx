import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from '../styles/IconButton.module.scss';
import classNames from 'classnames';

interface Props {
  children: ReactNode;
}

const IconButton = ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & Props) => {
  return (
    <button {...props} className={classNames(styles['icon-button'], props.className)}>
      {children}
    </button>
  );
};

export default IconButton;
