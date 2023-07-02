import classNames from 'classnames';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from '../styles/RoomPage.module.scss';
import axios from '../utils/axios';
import createToast from '../utils/createToast';
import { PlayerState, Room as RoomType } from '../utils/types';
import Controls from '../components/Controls';

const socket = io(import.meta.env.VITE_SERVER_URL);
let mouseMoveTimeout = -1;
let roomId: string | null = null;

const Room = () => {
  const params = useParams();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [cursorActive, setCursorActive] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    volume: 0.2,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    isBuffering: false,
    isFullscreen: false,
  });

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
        createToast(err.response.data.message ?? err.message);
      }
    })();

    socket.on('play', (time) => {
      changeTime(time);
      setPlayerState((prev) => ({ ...prev, isPlaying: true }));
    });

    socket.on('pause', (time) => {
      changeTime(time);
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
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
        setPlayerState((prev) => ({ ...prev, isFullscreen: false }));
      }
    };

    navigator.mediaSession.setActionHandler('play', () => {
      socket.emit('play', room!.id, playerState.currentTime);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      socket.emit('pause', room!.id, playerState.currentTime);
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

    video.current.muted = playerState.isMuted;
  }, [playerState.isMuted]);

  useEffect(() => {
    if (!video.current) {
      return;
    }

    video.current.volume = playerState.volume * playerState.volume;
  }, [playerState.volume]);

  useEffect(() => {
    if (playerState.isPlaying) {
      video.current?.play();
    } else {
      video.current?.pause();
    }
  }, [playerState.isPlaying]);

  useEffect(() => {
    if (playerState.isFullscreen) {
      videoContainer.current?.requestFullscreen();
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }, [playerState.isFullscreen]);

  const handleMetadataLoad = (event: SyntheticEvent<HTMLVideoElement>) => {
    setPlayerState((prev) => ({ ...prev, duration: (event.target as HTMLVideoElement).duration }));
    video.current!.volume = playerState.volume * playerState.volume;
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

  return (
    <div className={styles.container}>
      {room ? (
        <div
          ref={videoContainer}
          onMouseMove={handleVideoMouseMove}
          className={classNames(styles['video-container'], !cursorActive && styles['video-container_hidden-cursor'])}>
          <video
            onLoadedMetadata={handleMetadataLoad}
            onWaiting={() => setPlayerState((prev) => ({ ...prev, isBuffering: true }))}
            onCanPlay={() => setPlayerState((prev) => ({ ...prev, isBuffering: false }))}
            onClick={() =>
              playerState.isPlaying
                ? socket.emit('pause', room.id, playerState.currentTime)
                : socket.emit('play', room.id, playerState.currentTime)
            }
            onTimeUpdate={(e) => setPlayerState((prev) => ({ ...prev, currentTime: (e.target as HTMLVideoElement).currentTime }))}
            ref={video}
            className={styles.video}
            src={room.video}
          />
          <Controls
            playerState={playerState}
            setPlayerState={setPlayerState}
            cursorActive={cursorActive}
            room={room}
            socket={socket}
          />
        </div>
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
};

export default Room;
