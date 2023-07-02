import classNames from 'classnames';
import format from 'format-duration';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
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
import { Link, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import IconButton from '../components/IconButton';
import LoadingSpinner from '../components/LoadingSpinner';
import Slider from '../components/Slider';
import styles from '../styles/RoomPage.module.scss';
import axios from '../utils/axios';
import { Room as RoomType } from '../utils/types';
import createToast from '../utils/createToast';

const socket = io(import.meta.env.VITE_SERVER_URL);
let mouseMoveTimeout = -1;
let roomId: string | null = null;

const Room = () => {
  const params = useParams();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [cursorActive, setCursorActive] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [isMuted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setBuffering] = useState(true);
  const [isFullscreen, setFullscreen] = useState(false);

  const videoContainer = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/rooms/${params.id}`);
        setRoom(response.data);
        socket.emit('join', response.data.id);
        roomId = response.data.id;
      } catch (err: any) {
        console.error(err);
        alert(err.response.data.message ?? err.message);
      }
    })();

    socket.on('play', (time) => {
      changeTime(time);
      setPlaying(true);
    });

    socket.on('pause', (time) => {
      changeTime(time);
      setPlaying(false);
    });

    socket.on('seek', (time) => {
      changeTime(time);
    });

    socket.on('user join', () => {
      createToast('Someone joined :D');
    });

    socket.on('user leave', () => {
      createToast('Someone left :c');
    });

    document.onfullscreenchange = () => {
      if (!document.fullscreenElement) {
        setFullscreen(false);
      }
    };

    navigator.mediaSession.setActionHandler('play', () => {
      socket.emit('play', room!.id, currentTime);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      socket.emit('pause', room!.id, currentTime);
    });

    return () => {
      socket.emit('leave', roomId);
      socket.removeAllListeners();
      document.onfullscreenchange = null;
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
    };
  }, []);

  useEffect(() => {
    if (!video.current) {
      return;
    }

    video.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!video.current) {
      return;
    }

    video.current.volume = volume * volume;
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      video.current?.play();
    } else {
      video.current?.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isFullscreen) {
      videoContainer.current?.requestFullscreen();
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  const handleMetadataLoad = (event: SyntheticEvent<HTMLVideoElement>) => {
    setDuration((event.target as HTMLVideoElement).duration);
    video.current!.volume = volume * volume;
  };

  const handleVideoMouseMove = () => {
    setCursorActive(true);
    clearTimeout(mouseMoveTimeout);

    mouseMoveTimeout = setTimeout(() => {
      setCursorActive(false);
    }, 2000);
  };

  const changeTime = (newTime: number) => {
    if (!video.current) {
      return;
    }

    if (newTime > video.current.duration) {
      return (video.current.currentTime = video.current.duration);
    } else if (newTime < 0) {
      return (video.current.currentTime = 0);
    }

    video.current.currentTime = newTime;
  };

  const getVolumeIcon = () => {
    if (isMuted) {
      return <FaVolumeXmark />;
    }

    if (volume === 0) {
      return <FaVolumeOff />;
    }

    if (volume <= 0.5) {
      return <FaVolumeLow />;
    }

    return <FaVolumeHigh />;
  };

  return (
    <div className={styles.container}>
      {room ? (
        <div
          ref={videoContainer}
          onMouseMove={handleVideoMouseMove}
          className={classNames(styles['video-container'], !cursorActive && styles['video-container_hidden-cursor'])}>
          <video
            onLoadedMetadata={handleMetadataLoad}
            onWaiting={() => setBuffering(true)}
            onCanPlay={() => setBuffering(false)}
            onClick={() => (isPlaying ? socket.emit('pause', room.id, currentTime) : socket.emit('play', room.id, currentTime))}
            onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
            ref={video}
            className={styles.video}
            src={room.video}
          />
          <div className={classNames(styles.title, cursorActive && styles.title_visible)}>
            <Link to='/' className={styles['title__button-leave']}>
              <IconButton>
                <FaArrowLeft />
              </IconButton>
            </Link>
            <h2>{room.title}</h2>
          </div>

          {isBuffering && (
            <div className={styles['buffering-indicator']}>
              <LoadingSpinner />
            </div>
          )}

          <div
            className={classNames(
              styles.controls,
              cursorActive && styles.controls_visible,
              isBuffering && cursorActive && styles.controls_disabled
            )}>
            <IconButton onClick={() => setMuted((prev) => !prev)}>{getVolumeIcon()}</IconButton>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume((e.target as HTMLInputElement).valueAsNumber)}
              className={styles['controls__volume-slider']}
            />

            <div className={styles.controls__separator} />

            <IconButton onClick={() => socket.emit('seek', room.id, currentTime - 5)}>
              <FaBackward />
            </IconButton>
            <IconButton
              onClick={() =>
                isPlaying ? socket.emit('pause', room.id, currentTime) : socket.emit('play', room.id, currentTime)
              }>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </IconButton>
            <IconButton onClick={() => socket.emit('seek', room.id, currentTime + 5)}>
              <FaForward />
            </IconButton>

            <div className={styles.controls__separator} />

            <p className={styles.controls__time}>{format(currentTime * 1000)}</p>
            <Slider
              fullWidth
              value={currentTime}
              onChange={(e) => socket.emit('seek', room.id, (e.target as HTMLInputElement).valueAsNumber)}
              min={0}
              max={duration}
            />
            <p className={styles.controls__time}>{format(duration * 1000)}</p>

            <div className={styles.controls__separator} />

            <IconButton onClick={() => setFullscreen((prev) => !prev)}>{isFullscreen ? <FaCompress /> : <FaExpand />}</IconButton>
          </div>
        </div>
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
};

export default Room;
