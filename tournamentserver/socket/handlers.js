import { rooms } from "../game/datastore.js";
import { Road } from "../game/road.js";
import Room from "../game/room.js";
import { cancelGame, fetchGameData, updateGameData } from "../utils/game.js";
import {
  ping,
  randomNumber,
  getPlayersLocation,
  startTimer,
  sendRunDice,
  movePlayer,
  moveGoti,
  checkWinningStatus,
} from "../utils/helpers.js";

const colors = { blue: 0, green: 1, yellow: 2, red: 3 };
const roomCreationLocks = {};
export const socketHandlers = async (io, socket) => {
  try {
    ping(socket);

    // socket.on("ready", async (res) => {
    //   try {
    //     const room = rooms[res.room_code];
    //     if (!room) {
    //       socket.emit("gohome");
    //       return;
    //     }

    //     room.playerInfo[res.color].ready = true;

    //     if (room.playerInfo.blue.ready) {
    //       room.status = 1;

    //       rooms[res.room_code].createdAt = Date.now();

    //       io.to(res.room_code).emit("_gj", {
    //         greenInfo: room.playerInfo.green,
    //         gameStatus: room.status,
    //       });

    //       io.to(res.room_code).emit("startgame", {
    //         startedAt: rooms[res.room_code].createdAt,
    //       });

    //       setTimeout(() => {
    //         let ws = checkWinningStatus(
    //           room,
    //           { color: room.currentTurn },
    //           colors
    //         );
    //         if (ws) {
    //           room.winner = ws.winnerColor;
    //           room.looser = ws.looserColor;
    //           room.endedAt = new Date().toLocaleString("en-IN", {
    //             timeZone: "Asia/Kolkata",
    //           });
    //           room.status = 1;

    //           clearInterval(room.moveTimeRef);
    //           clearInterval(room.waitTimeRef);

    //           let end = {
    //             win: ws.winnerColor,
    //             winScore: ws.winnerScore,
    //             lose: ws.looserColor,
    //             loseScore: ws.looserScore,
    //             sc: ws.sc,
    //           };

    //           updateGameData({
    //             gameUid: room._id,
    //             data: { ...end, roomData: room },
    //           })
    //             .then((result) => {
    //               // //console.log("Game data updated successfully", result);
    //             })
    //             .catch((error) => {
    //               // //console.error("Error updating game data", error);
    //             });
    //           io.to(room.code).emit("_end", end);
    //           // //console.log("game is finished");
    //           delete rooms[room.code];
    //           return;
    //         }
    //       }, room.duration * 60 * 1000);

    //       //don nopt start the match until both are ready
    //       setTimeout(() => startTimer(room, colors, io), 10);
    //     }
    //   } catch (error) {
    //     console.error("Error in :", error);
    //   }
    // });

    socket.on("join", async (res) => {
      try {
        const gameUid = res.gameUid;
        const token = res.token;
        const deviceId = res.deviceId;

        if (!gameUid || !token || !deviceId) return;

        const result = await fetchGameData({ gameUid, token, deviceId });
        // console.log("result", result);
        let gameData = null;
        if (result.success) {
          gameData = result.game;
        } else {
          socket.emit("gohome");
          return;
        }

        if (gameData.status == "completed") {
          socket.emit("gohome");
        }

        if (!rooms[gameData.roomCode]) {
          if (!roomCreationLocks[gameData.roomCode]) {
            roomCreationLocks[gameData.roomCode] = true; // Lock

            rooms[gameData.roomCode] = new Room(gameData.roomCode);
            rooms[gameData.roomCode]._id = gameUid;
            rooms[gameData.roomCode].prize = gameData.prize;
            rooms[gameData.roomCode].totalMoves = gameData.moves;
            rooms[gameData.roomCode].moves = {
              blue: gameData.moves,
            };

            delete roomCreationLocks[gameData.roomCode]; // Unlock
          } else {
            // Room creation in progress, wait or return
            setTimeout(() => socket.emit("gohome"), 100);
            return;
          }
        }

        if (!gameData) return;

        //handle join

        const room = rooms[gameData.roomCode];
        if (!room) {
          socket.emit("gohome");
          return;
        }
        // //console.log(
        //   "ERROR CHECKING",
        //   gameData.blue.user &&
        //     gameData.blue.user.deviceId &&
        //     gameData.blue.user.deviceId == deviceId &&
        //     room.data[colors["blue"]].userId == gameData.blue.user.username
        // );

        let thiscolor = "";
        let _su = false;

        if (gameData) {
          if (deviceId == gameData.blue.user.deviceId) {
            thiscolor = "blue";
            _su = gameData.blue.user._su;
          }
        }

        if (true) {
          // //console.log("BlUE PLAYER", getRoomData(room, { color: "blue" }));
          socket.join(room.code);
          socket.emit(
            "sync_join_status",
            getRoomData(room, { color: "blue", _su })
          );

          // //console.log("calling from handlijoin");

          const playerData = {};
          if (room) room.amount = gameData.entryFee;

          const color = "blue";
          const colorIndex = colors[color];
          if (!gameData[color].user) return;
          room.data[colorIndex].userId = gameData[color].user.username;
          room.data[colorIndex].deviceId = gameData[color].user.deviceId;
          room.data[colorIndex].fullName = gameData[color].user.fullName;

          room.playersJoined++;
          room.playerInfo[color] = {
            userId: room.data[colorIndex].userId,
            profile: gameData[color].user.profilePic,
            _su: gameData[color].user._su,
            fullName: gameData[color].user.fullName,
            life: room.data[colorIndex].life,
            score: room.data[colorIndex].score,
          };

          playerData.userId = room.data[colorIndex].userId;
          playerData.color = color;

          room.status = 1;

          playerData.color = thiscolor;
          playerData._su = _su;

          socket.join(gameData.roomCode);
          console.log("game started level 5");
          socket.emit("join_status", getRoomData(room, playerData));
          console.log("game started level 6");
          if (room.status == 1) {
            console.log("game started level 7");

            io.to(gameData.roomCode).emit("startgame");
            //don nopt start the match until both are ready
            setTimeout(() => startTimer(room, colors, io), 1000);
          }

          // //console.log(room);
        }
      } catch (error) {
        console.error("Error in :", error);
      }
    });

    // socket.on("join", handleJoin);
    socket.on("syncjoin", handleSyncJoin);
    socket.on("movePlayer", handleMovePlayer);
    socket.on("_rd", handleRunDice);
    socket.on("disconnect", handleDisconnect);

    /*** Helper Functions ***/

    function handleSyncJoin(res) {
      try {
        const room = rooms[res.room_code];
        if (!room) {
          socket.emit("gohome");
          return;
        }
        if (room) {
          socket.join(res.room_code);
          socket.emit(
            "sync_join_status",
            getRoomData(room, { color: res.color })
          );
        } else {
          socket.emit("restart", {});
        }
      } catch (error) {
        console.error("Error in :", error);
      }
    }

    socket.on("exitGame", (res) => {
      try {
        const room = rooms[res.room_code];

        if (!room) {
          socket.emit("gohome");
          return;
        }

        if (res.color == "blue") {
          room.data[0].exit = true;
        } else if (res.color == "green") {
          room.data[1].exit = true;
        }

        //

        let ws = checkWinningStatus(room, { color: room.currentTurn }, colors);
        if (ws) {
          room.winner = ws.winnerColor;
          room.looser = ws.looserColor;
          room.endedAt = new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          });
          room.status = 1;

          clearInterval(room.moveTimeRef);
          clearInterval(room.waitTimeRef);
          // let wlog = {
          //   start: room.createdAt,
          //   end: room.endedAt,
          //   winner: { color: room.winner, id: ws.winnerId },
          //   looser: { color: room.looser, id: ws.looserId },
          // };

          // //console.log(wlog);
          // datastore[room.code] = wlog;

          let end = {
            win: ws.winnerColor,
            winScore: ws.winnerScore,
            lose: ws.looserColor,
            loseScore: ws.looserScore,
            sc: ws.sc,
          };
          updateGameData({
            gameUid: room._id,
            data: { ...end, roomData: room },
          })
            .then((result) => {
              // //console.log("Game data updated successfully", result);
            })
            .catch((error) => {
              // //console.error("Error updating game data", error);
            });
          io.to(room.code).emit("_end", end);
          // //console.log("game is finished");
          setTimeout(() => {
            delete rooms[room.code];
          }, 1000 * 60 * 5);

          socket.emit("gohome");
        }
        //
      } catch (error) {
        console.error("Error in :", error);
      }
    });

    function handleMovePlayer(res) {
      try {
        const room = rooms[res.room_code];
        if (!room) {
          socket.emit("gohome");
          return;
        }
        const goti = room.data[colors[res.color]].players[res.index];

        if (
          res.diceValue === 6 &&
          goti.status === -1 &&
          goti.currentPos === 0
        ) {
          if (!room.playerIsMoving) {
            goti.status = 1;
            res.x = Road[res.color][goti.currentPos].x;
            res.y = Road[res.color][goti.currentPos].y + 10;
            moveGoti(room, res, colors, io);
          }
        } else {
          movePlayer(room, res, colors, io);
        }
      } catch (error) {
        console.error("Error in :", error);
      }
    }

    function handleRunDice(res) {
      try {
        const room = rooms[res.room_code];
        if (!room) {
          socket.emit("gohome");
          return;
        }

        if (room.currentTurn === res.color && room.movableSteps === 0) {
          sendRunDice(room, res, colors, io);
        }
      } catch (error) {
        console.error("Error in :", error);
      }
    }

    function handleDisconnect(res) {
      console.log(
        "classic online server is working : ",
        Object.keys(rooms).length
      );
    }

    function getRoomData(room, playerData) {
      try {
        return {
          room_code: room.code,
          players: getPlayersLocation(room),
          currentTurn: room.currentTurn,
          movableSteps: room.movableSteps,
          lastDiceValue: room.lastDiceValue,
          playerInfo: room.playerInfo,
          gameStatus: room.status,
          duration: room.moves,
          startedAt: room.createdAt,
          amount: room.amount,
          prize: room.prize,
          mode: room.mode,
          ...playerData,
          userId:
            playerData.userId || room.data[colors[playerData.color]]?.userId,
        };
      } catch (error) {
        console.error("Error in :", error);
      }
    }
  } catch (error) {
    // //console.error("Error fetching game data:", error);
  }
};
