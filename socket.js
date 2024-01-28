const socketIO = require('socket.io');

const initializeSocket = (server) => {
  const io = socketIO(server);

  io.on('connection', (socket) => {

    // You can add additional socket events or logic here

    socket.on('disconnect', () => {
    });
  });

  return io;
};

