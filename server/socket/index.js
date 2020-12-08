const { Task } = require("../db/models");

const gameRooms = {
  // [roomKey]: {
  // users: [],
  // randomTasks: [],
  // scores: {},
  // gameScore: 0,
  // players: {},
  // numPlayers: 0
  // }
};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(
      `A socket connection to the server has been made: ${socket.id}`
    );
    socket.on("joinRoom", (roomKey) => {
      socket.join(roomKey);

      const roomInfo = gameRooms[roomKey];

      roomInfo.players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        playerId: socket.id,
        team: Math.floor(Math.random() * 2) == 0 ? "red" : "blue",
      };
      //add to player to scores obj
      roomInfo.scores[socket.id] = { name: "", points: 0 };
      roomInfo.numPlayers = Object.keys(roomInfo.players).length;

      // send the players object to the new player
      socket.emit("currentPlayers", {
        players: roomInfo.players,
        numPlayers: roomInfo.numPlayers,
      });
      // set initial state
      socket.emit("setState", roomInfo);
      // update all other players of the new player
      socket.to(roomKey).emit("newPlayer", {
        playerInfo: roomInfo.players[socket.id],
        numPlayers: roomInfo.numPlayers,
      });
    });
    // when a player disconnects, remove them from our players object
    socket.on("disconnect", function () {
      //find which room they belong to
      let roomKey = 0;
      for (let keys1 in gameRooms) {
        for (let keys2 in gameRooms[keys1]) {
          Object.keys(gameRooms[keys1][keys2]).map((el) => {
            if (el === socket.id) {
              roomKey = keys1;
            }
          });
        }
      }

      const roomInfo = gameRooms[roomKey];

      if (roomInfo) {
        console.log("user disconnected: ", socket.id);
        // remove this player from our players object
        delete roomInfo.players[socket.id];
        delete roomInfo.scores[socket.id];
        roomInfo.numPlayers = Object.keys(roomInfo.players).length;
        // emit a message to all players to remove this player
        io.to(roomKey).emit("disconnected", {
          playerId: socket.id,
          numPlayers: roomInfo.numPlayers,
        });
      }
    });

    // when a player moves, update the player data
    socket.on("playerMovement", function (data) {
      const { x, y, roomKey } = data;
      gameRooms[roomKey].players[socket.id].x = x;
      gameRooms[roomKey].players[socket.id].y = y;
      // emit a message to all players about the player that moved
      socket
        .to(roomKey)
        .emit("playerMoved", gameRooms[roomKey].players[socket.id]);
    });
    socket.on("completedTask", function (data) {
      const { roomKey } = data;
      gameRooms[roomKey].gameScore++;
      io.to(roomKey).emit("progressUpdate", {
        gameScore: gameRooms[roomKey].gameScore,
      });
    });

    //update score
    socket.on("scoreUpdate", function (data) {
      const { scoreObj, roomKey } = data;
      console.log("gamerooms inside score update", gameRooms);
      console.log("gamerooms[roomkey] inside score update", gameRooms[roomKey]);
      gameRooms[roomKey].scores[socket.id].points += scoreObj.points;
      if (scoreObj.timeBonus) {
        gameRooms[roomKey].scores[socket.id].points += scoreObj.timeBonus;
      }
      io.to(roomKey).emit("updateLeaderboard", gameRooms[roomKey].scores);
    });

    socket.on("sendTime", function (time) {
      socket.emit("sendTimeToRegex", time);
    });

    socket.on("sendScores", function (data) {
      const { playerInfo, roomKey } = data;
      gameRooms[roomKey].scores[socket.id] = playerInfo;
      io.to(roomKey).emit("displayScores", gameRooms[roomKey].scores);
    });

    socket.on("startGame", async function (roomKey) {
      try {
        const tasks = await Task.findAll();
        const randomIdOne = Math.ceil(Math.random() * tasks.length);
        const randomIdTwo = Math.ceil(Math.random() * tasks.length);
        const taskOne = await Task.findByPk(randomIdOne);
        const taskTwo = await Task.findByPk(randomIdTwo);
        gameRooms[roomKey].randomTasks = [taskOne, taskTwo];
        gameRooms[roomKey].gameStarted = true;
        io.to(roomKey).emit("updateState", gameRooms[roomKey]);
        io.to(roomKey).emit("destroyButton");
        io.to(roomKey).emit("startTimer");
        io.to(roomKey).emit("activatePanels");
      } catch (err) {
        console.log("error starting game", err);
      }
    });
    socket.on("disablePanel", function (data) {
      const { controlPanel, roomKey } = data;
      socket.emit("setInactive", controlPanel);
    });

    // get a random code for the room
    socket.on("getRoomCode", async function () {
      let key = codeGenerator();
      while (Object.keys(gameRooms).includes(key)) {
        key = codeGenerator();
      }
      gameRooms[key] = {
        roomKey: key,
        randomTasks: [],
        gameScore: 0,
        scores: {},
        players: {},
        numPlayers: 0,
        gameStarted: false,
      };
      socket.emit("roomCreated", key);
    });
    socket.on("isKeyValid", function (input) {
      if (
        Object.keys(gameRooms).includes(input) &&
        !gameRooms[input].gameStarted
      ) {
        socket.emit("keyIsValid", input);
      } else if (
        Object.keys(gameRooms).includes(input) &&
        gameRooms[input].gameStarted
      ) {
        socket.emit("gameAlreadyStarted");
      } else {
        socket.emit("keyNotValid");
      }
    });
  });
};

function codeGenerator() {
  let code = "";
  let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
