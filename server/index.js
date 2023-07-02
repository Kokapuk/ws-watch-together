import { Server } from 'socket.io';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { handleValidationErrors, roomCreationValidation } from './utils/Validator.js';
import * as RoomsController from './controllers/RoomsController.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.post('/rooms', roomCreationValidation, handleValidationErrors, RoomsController.create);
app.get('/rooms', RoomsController.findAll);
app.get('/rooms/:id', RoomsController.findById);
app.delete('/rooms/:id', RoomsController.remove);

const server = app.listen(process.env.PORT, () => console.log(`Listening at port ${process.env.PORT}...`));

const io = new Server(server);

io.on('connection', (socket) => {
  socket.on('join', (roomId) => {
    socket.join(roomId);
    io.to(roomId).emit('user join');
  });

  socket.on('leave', (roomId) => {
    socket.leave(roomId);
    io.to(roomId).emit('user leave');
  });

  socket.on('play', (roomId, time) => {
    if (!roomId) {
      return;
    }

    io.to(roomId).emit('play', time);
  });

  socket.on('pause', (roomId, time) => {
    if (!roomId) {
      return;
    }

    io.to(roomId).emit('pause', time);
  });

  socket.on('seek', (roomId, time) => {
    if (!roomId) {
      return;
    }

    io.to(roomId).emit('seek', time);
  });

  socket.on('disconnecting', () => {
    if (socket.rooms.size >= 2) {
      io.to(Array.from(socket.rooms)[1]).emit('user leave');
    }
  });
});

io.engine.on('headers', (headers) => {
  headers['Access-Control-Allow-Origin'] = process.env.CLIENT_URL;
  headers['Access-Control-Allow-Methods'] = 'GET, POST';
  headers['Access-Control-Allow-Credentials'] = 'true';
});
