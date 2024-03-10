const { Server } = require("socket.io");
const socketClient = require("socket.io-client");

const getIo = (server) => {
  const io = new Server(server, {
    cors: { origin: "http://127.0.0.1:4200" },
    connectionStateRecovery: {},
  });

  io.on("connection", (socket) => {
    console.log("user " + socket.id + " connected");

    //client disconnection
    socket.on("disconnect", () => {
      console.log("user " + socket.id + " disconnected");
    });
  });
};

module.exports = {
  getIo: getIo,
};
