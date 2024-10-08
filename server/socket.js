const { Server } = require("socket.io");
const socketClient = require("socket.io-client");
const os = require("os");
const Y = require("yjs");
const {
  encodeAwarenessUpdate,
  Awareness,
  applyAwarenessUpdate,
} = require("y-protocols/awareness");

const getIo = (server) => {
  //stores ydocs of all rooms in memory
  let ydocs = {};

  //server keeps track of the explorer updates for the late-comers
  let explorerUpdates = {};

  //stores awareness instances for each room as well
  let awarenesses = {};

  //store existing roomIDs for validation
  let rooms = {};
  //for configuring socket.io server cors
  let ip;

  if (os.networkInterfaces()["wlo1"]) {
    for (interface of os.networkInterfaces()["wlo1"]) {
      if (
        interface &&
        interface.address &&
        interface.address.startsWith("192.168")
      ) {
        ip = interface.address;
      }
    }
  } else if (os.networkInterfaces()["Wi-Fi"]) {
    for (interface of os.networkInterfaces()["Wi-Fi"]) {
      if (
        interface &&
        interface.address &&
        interface.address.startsWith("192.168")
      ) {
        ip = interface.address;
      }
    }
  }
  console.log("server ip address : " + ip);

  const io = new Server(server, {
    cors: {
      origin: [
        "http://127.0.0.1:4200",
        "http://localhost:4200",
        `http://${ip}:4200`,
      ],
    },
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
      rooms[roomID] = [socket.handshake.auth.username];
      socket.join(roomID);
      //making a ydoc for the respective room
      let ydoc = new Y.Doc();
      ydoc.getText("monaco");
      ydocs[roomID] = ydoc;

      //intantiate awareness for the room
      let awareness = new Awareness(ydoc);
      awarenesses[roomID] = awareness;

      console.log(`${socket.handshake.auth.username} created ${roomID}`);
    });

    //join room request
    socket.on("join-room", (roomID, callback) => {
      if (rooms[roomID]) {
        socket.join(roomID);
        callback({ status: true });
        let username = socket.handshake.auth.username;
        //alert everyone that someone joined
        socket.to(roomID).emit("someone-joined", username);
        console.log(`${username} joined ${roomID}`);
        if (!rooms[roomID].includes(username)) {
          rooms[roomID].push(username);
        }

        //sending updates to late-comer
        if (
          ydocs[roomID] /*&&
        ydocs[roomID].share &&
        ydocs[roomID].share.values().next().value.length > 0*/
        ) {
          try {
            const ydoc = ydocs[roomID];
            const updates = Y.encodeStateAsUpdate(ydoc);
            socket.emit("receive-updates", new Uint8Array(updates));
          } catch (e) {
            console.log(
              "should recreate the room as server copy is instantiated at the beginning only"
            );
          }

          //send explorer updates as well
          try {
            if (explorerUpdates[roomID]) {
              for (update of explorerUpdates[roomID])
                socket.emit(
                  "receive-explorer-updates",
                  update.name,
                  update.mode,
                  update.path,
                  update.id
                );
            }
          } catch (e) {
            console.log("couldn't send explorer updates to late-comer");
            console.error(e);
          }

          //send members details
          socket.emit("members", rooms[roomID]);

          //send awareness updates as well (doesn't seem necessary since it automatically gets updated)
          // try {
          //   if (awarenesses[roomID]) {
          //     let awarenessUpdates = encodeAwarenessUpdate(
          //       awarenesses[roomID],
          //       Array.from(awarenesses[roomID].getStates().keys())
          //     );
          //     socket.emit("receive-awareness", new Uint8Array(awarenessUpdates));
          //   }
          // } catch (e) {
          //   console.log("couldn't send awareness updates to late comer");
          // }
        }

        // logRooms(socket);
      } else {
        //if the  room doesn't exist alert the client
        callback({ status: false });
      }
    });

    //on leave room so that server can check if any members remain in the room/also update count
    socket.on("leave-room", (roomID) => {
      let username = socket.handshake.auth.username;
      console.log(`${username} left ${roomID}`);
      //alert everyone that someone left
      socket.to(roomID).emit("someone-left", username);
      if (rooms[roomID]) {
        rooms[roomID].splice(1, rooms[roomID].indexOf(username));
        if (rooms[roomID].length == 0) {
          delete rooms[roomID];
          console.log(
            "room " + roomID + "was deleted cuz there's no members left"
          );
        }
      }
    });

    //client sends updates which have to be send to all clients in the same room as him
    //have to create a new Uint8Array from the received data
    //otherwise "unexpected end of array error" will be thrown from the client side
    socket.on("send-updates", (updates, roomID) => {
      socket.to(roomID).emit("receive-updates", new Uint8Array(updates));
      //replicate updates to server's copy of ydoc instance of this room
      let ydoc = ydocs[roomID];
      try {
        Y.applyUpdate(ydoc, new Uint8Array(updates));
      } catch (e) {
        console.log(
          "should recreate the room as server copy is instantiated at the beginning only"
        );
      }

      ydocs[roomID] = ydoc;

      // let arr = Array.from(ydocs[roomID].share, ([name, value]) => ({
      //   name,
      //   value,
      // }));
      // console.log(arr);
      // console.log(updates);

      //console.log(ydocs[roomID].share.values().next().value.toString());
    });

    //client sends awareness updates which have to be broadcasted to everyone else except him
    socket.on("send-awareness", (updates, roomID) => {
      socket.to(roomID).emit("receive-awareness", new Uint8Array(updates));
      // console.log(updates);

      //replicate updates to server's copy of awareness instance of this room
      //(not necessary it seems)
      // try {
      //   let awareness = awarenesses[roomID];
      //   applyAwarenessUpdate(awareness, new Uint8Array(updates), null);
      //   awarenesses[roomID] = awareness;
      // } catch (e) {
      //   console.log("couldn't apply awareness update to server's copy");
      // }
    });

    //relaying explorer updates
    socket.on("explorer-updates", (name, mode, path, id, roomID) => {
      //to store explorer updates on server in-memory
      if (!explorerUpdates[roomID]) explorerUpdates[roomID] = [];
      try {
        explorerUpdates[roomID].push({ name, mode, path, id });
      } catch (e) {
        console.log("couldn't store explorer updates on server side");
      }

      socket.to(roomID).emit("receive-explorer-updates", name, mode, path, id);
    });

    //send clientID of disconnected client so that others
    //can clean the respective awareness instance
    socket.on("alert-purge", (clientID, roomID) => {
      socket.to(roomID).emit("purge-awareness", clientID);
    });

    /************chat service part */
    socket.on("send-message", (message, sender, color, roomID) => {
      io.to(roomID).emit("receive-message", message, sender, color);
    });
  });
};

module.exports = {
  getIo: getIo,
};
