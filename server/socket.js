const { Server } = require("socket.io");
const socketClient = require("socket.io-client");
const os = require("os");

const getIo = (server) => {
  let ip;
  if(os.networkInterfaces()["wlo1"]&&os.networkInterfaces()["wlo1"][0].address){
    ip = os.networkInterfaces()["wlo1"][0].address
  }
  else if(os.networkInterfaces()['Wi-Fi']&&os.networkInterfaces()['Wi-Fi'][0].address)
  {
    ip=os.networkInterfaces()['Wi-Fi'][0].address
  }
  
  const io = new Server(server, {
    cors: { origin: ["http://127.0.0.1:4200", `http://${ip}:4200`] },
    connectionStateRecovery: {},
  });

  //logging the room a client is currently in
  const logRooms = (socket) => {
    console.log(`${socket.handshake.auth.username}'s rooms :`);
    for (x of socket.rooms) console.log(x);
  };

  io.on("connection", (socket) => {
    console.log(
      `user ${socket.handshake.auth.username} with userID ${socket.handshake.auth.userID} connected and socketID : ${socket.id}`
    );
    // logRooms(socket);

    //client disconnection
    socket.on("disconnect", () => {
      console.log(
        `user ${socket.handshake.auth.username} with userID ${socket.handshake.auth.userID} disconnected`
      );
    });

    //create room request
    socket.on("create-room", (roomID) => {
      socket.join(roomID);
      console.log(`${socket.handshake.auth.username} created ${roomID}`);
    });

    //join room request
    socket.on("join-room", (roomID) => {
      socket.join(roomID);
      console.log(`${socket.handshake.auth.username} joined ${roomID}`);
      // logRooms(socket);
    });

    //client sends updates which have to be send to all clients in the same room as him
    //have to create a new Uint8Array from the received data
    //otherwise "unexpected end of array error" will be thrown from the client side
    socket.on("send-updates", (updates, roomID) => {
      socket.to(roomID).emit("receive-updates", new Uint8Array(updates));
      // console.log(updates);
    });

    //client sends awareness updates which have to be broadcasted to everyone else except him
    socket.on("send-awareness", (updates, roomID) => {
      socket.to(roomID).emit("receive-awareness", new Uint8Array(updates));
      // console.log(updates);
    });
  });
};

module.exports = {
  getIo: getIo,
};
