let socketArray = [];

const socketService = () => {
  const addSocket = (socket) => {
    socketArray.push({
      id: socket.id,
      socket,
    });
  };

  const removeSocket = (socket) => {
    socketArray = socketArray.filter((item) => item.id !== socket.id);
  };

  const emit = (event, payload) => {
    try {
      socketArray.forEach(({ socket }) => {
        socket.emit(event, payload);
      });
    } catch (err) {
      console.log(err);
    }
  };

  return {
    addSocket,
    removeSocket,
    emit,
  };
};

module.exports = socketService;
