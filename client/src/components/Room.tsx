import { Link } from 'react-router-dom';
import { Room as RoomType } from '../utils/types';
import styles from '../styles/Room.module.scss';
import classNames from 'classnames';

interface Props {
  room: RoomType;
}

const Room = ({ room }: Props) => {
  return (
    <span className={classNames('paper', styles.room)}>
      <h4>{room.title}</h4>
      <Link to={`/room/${room.id}`}>
        <button>Join</button>
      </Link>
    </span>
  );
};

export default Room;
