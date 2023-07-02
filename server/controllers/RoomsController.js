import { uid } from 'uid';

const rooms = [];

export const create = (req, res) => {
  const room = { id: uid(16), title: req.body.title, video: req.body.video };
  rooms.push(room);
  res.json({ success: true });
};

export const findAll = (_req, res) => {
  res.json(rooms);
};

export const findById = (req, res) => {
  const room = rooms.find((room) => room.id === req.params.id);

  if (!room) {
    return res.status(404).json({ message: 'Room does not exist' });
  }

  res.json(room);
};

export const remove = (req, res) => {
  const filteredRooms = rooms.filter((room) => room.id !== req.params.id);

  if (filteredRooms.length === rooms.length) {
    return res.status(404).json({ message: 'Room does not exist' });
  }

  rooms.splice(0, rooms.length, ...filteredRooms);
  res.json({ success: true });
};
