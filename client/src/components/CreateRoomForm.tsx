import { FormEvent, useState } from 'react';
import styles from '../styles/CreateRoomForm.module.scss';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';

const CreateRoomForm = () => {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await axios.post('/rooms', { title, video: videoUrl });
      navigate(0);
    } catch (err: any) {
      alert(err.response.data.message ?? err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={classNames('paper', styles.from)}>
      <h3>Create your own room</h3>
      <input
        placeholder='Title'
        value={title}
        onChange={(e) => setTitle(e.target.value.trimStart())}
        type='text'
        required
        minLength={3}
        maxLength={128}
      />
      <input placeholder='Video Url' value={videoUrl} onChange={(e) => setVideoUrl(e.target.value.trim())} type='url' required />
      <button>Create</button>
    </form>
  );
};

export default CreateRoomForm;
