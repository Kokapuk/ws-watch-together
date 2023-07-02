import { Link, useNavigate } from 'react-router-dom';
import { Room as RoomType } from '../utils/types';
import styles from '../styles/Room.module.scss';
import classNames from 'classnames';
import createToast from '../utils/createToast';
import axios from '../utils/axios';

interface Props {
  room: RoomType;
}

const Room = ({ room }: Props) => {
  const navigate = useNavigate();

  const deleteRoom = async () => {
    try {
      await axios.delete(`/rooms/${room.id}`);
      navigate(0);
    } catch (err: any) {
      createToast(`Failed to delete room: ${err.response.data.message ?? err.message}`);
    }
  };

  return (
    <span className={classNames('paper', styles.room)}>
      <h4>{room.title}</h4>
      <div className={styles.room__buttons}>
        <Link to={`/room/${room.id}`}>
          <button>Join</button>
        </Link>
        <button onClick={deleteRoom} className='button__danger'>
          Delete
        </button>
      </div>
    </span>
  );
};

export default Room;
