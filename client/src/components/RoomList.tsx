import Room from './Room';
import styles from '../styles/RoomList.module.scss';
import { useEffect, useState } from 'react';
import { Room as RoomType } from '../utils/types';
import axios from '../utils/axios';
import createToast from '../utils/createToast';

const RoomList = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get('/rooms');
        setRooms(response.data);
      } catch (err: any) {
        console.error(err);
        createToast(err.response.data.message ?? err.message);
      }
    })();
  }, []);

  return (
    <div className={styles['room-list']}>
      {rooms.map((room) => (
        <Room key={room.id} room={room} />
      ))}
    </div>
  );
};

export default RoomList;
