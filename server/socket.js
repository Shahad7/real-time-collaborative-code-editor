const { Server } = require("socket.io");
const socketClient = require("socket.io-client");

const getIo = (server) => {
  const io = new Server(server, {
    cors: { origin: "http://127.0.0.1:4200" },
    connectionStateRecovery: {},
  });

  io.on("connection", (socket) => {
    console.log(
      `user ${socket.handshake.auth.username} with userID ${socket.handshake.auth.userID} connected`
    );

    //client disconnection
    socket.on("disconnect", () => {
      console.log(
        `user ${socket.handshake.auth.username} with userID ${socket.handshake.auth.userID} disconnected`
      );
    });
  });
};

module.exports = {
  getIo: getIo,
};
