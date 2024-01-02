const socketIO = require('socket.io');

const initializeSocket = (server) => {
  const io = socketIO(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    // You can add additional socket events or logic here

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};

module.exports = initializeSocket;
