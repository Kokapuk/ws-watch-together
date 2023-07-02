import classNames from 'classnames';
import format from 'format-duration';
import { Dispatch } from 'react';
import {
  FaArrowLeft,
  FaBackward,
  FaCompress,
  FaExpand,
  FaForward,
  FaPause,
  FaPlay,
  FaVolumeHigh,
  FaVolumeLow,
  FaVolumeOff,
  FaVolumeXmark,
} from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import styles from '../styles/Controls.module.scss';
import { PlayerState, Room } from '../utils/types';
import IconButton from './IconButton';
import LoadingSpinner from './LoadingSpinner';
import Slider from './Slider';

interface Props {
  playerState: PlayerState;
  setPlayerState: Dispatch<React.SetStateAction<PlayerState>>;
  room: Room;
  socket: Socket;
  cursorActive: boolean;
}

const Controls = ({ playerState, setPlayerState, room, socket, cursorActive }: Props) => {
  const getVolumeIcon = () => {
    if (playerState.isMuted) {
      return <FaVolumeXmark />;
    }

    if (playerState.volume === 0) {
      return <FaVolumeOff />;
    }

    if (playerState.volume <= 0.5) {
      return <FaVolumeLow />;
    }

    return <FaVolumeHigh />;
  };

  return (
    <>
      <div className={classNames(styles.title, cursorActive && styles.title_visible)}>
        <Link to='/' className={styles['title__button-leave']}>
          <IconButton>
            <FaArrowLeft />
          </IconButton>
        </Link>
        <h2>{room.title}</h2>
      </div>

      {playerState.isBuffering && (
        <div className={styles['buffering-indicator']}>
          <LoadingSpinner />
        </div>
      )}

      <div
        className={classNames(
          styles.controls,
          cursorActive && styles.controls_visible,
          playerState.isBuffering && cursorActive && styles.controls_disabled
        )}>
        {window.innerWidth >= 767 && (
          <>
            <IconButton onClick={() => setPlayerState((prev) => ({ ...prev, isMuted: !prev.isMuted }))}>
              {getVolumeIcon()}
            </IconButton>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={playerState.volume}
              onChange={(e) => setPlayerState((prev) => ({ ...prev, volume: (e.target as HTMLInputElement).valueAsNumber }))}
              className={styles['controls__volume-slider']}
            />
          </>
        )}

        <div className={styles.controls__separator} />

        <IconButton onClick={() => socket.emit('seek', room.id, playerState.currentTime - 5)}>
          <FaBackward />
        </IconButton>
        <IconButton
          onClick={() =>
            playerState.isPlaying
              ? socket.emit('pause', room.id, playerState.currentTime)
              : socket.emit('play', room.id, playerState.currentTime)
          }>
          {playerState.isPlaying ? <FaPause /> : <FaPlay />}
        </IconButton>
        <IconButton onClick={() => socket.emit('seek', room.id, playerState.currentTime + 5)}>
          <FaForward />
        </IconButton>

        <div className={styles.controls__separator} />

        <p className={styles.controls__time}>{format(playerState.currentTime * 1000)}</p>
        <Slider
          fullWidth
          value={playerState.currentTime}
          onChange={(e) => socket.emit('seek', room.id, (e.target as HTMLInputElement).valueAsNumber)}
          min={0}
          max={playerState.duration}
        />
        <p className={styles.controls__time}>{format(playerState.duration * 1000)}</p>

        <div className={styles.controls__separator} />

        <IconButton onClick={() => setPlayerState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }))}>
          {playerState.isFullscreen ? <FaCompress /> : <FaExpand />}
        </IconButton>
      </div>
    </>
  );
};

export default Controls;
