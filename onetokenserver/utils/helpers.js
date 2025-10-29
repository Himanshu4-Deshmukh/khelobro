import axios from "axios";
const apiUrl = "https://ludo-data.codegully.in";
import { datastore, rooms } from "../game/datastore.js";
import { Road } from "../game/road.js";
import { OnlineGame } from "../../backend/models/onlinegame.js";
import { updateGameData } from "./game.js";

export const getPlayersLocation = (room) => {
  try {
    let posd = [];

    room.data.forEach((color) => {
      color.players.forEach((pl, index) => {
        let pd = {
          index: index,
          color: color.color,
          currentPos: pl.currentPos,
          status: pl.status,
          x: 0,
          y: 0,
        };

        if (pl.status == -1) {
          (pd.x = pl.homePosition.x), (pd.y = pl.homePosition.y);
        } else {
          pd.x = Road[pd.color][pl.currentPos].x;
          pd.y = Road[pd.color][pl.currentPos].y + 10;
        }
        posd.push(pd);
      });
    });

    return posd;
  } catch (error) {
    console.error("Error in :", error);
  }
};

export const randomNumber = (min, max) => {
  try {
    return Math.floor(Math.random() * max) + min;
  } catch (error) {
    console.error("Error in :", error);
  }
};

export const toggleTurn = (room) => {
  try {
    let d = {
      current: null,
      old: null,
      bluelife: room.data[0].life,
      greenlife: room.data[1].life,
    };
    if (room.currentTurn == "blue") {
      room.currentTurn = "green";
      d.old = "blue";
      d.current = "green";
    } else if (room.currentTurn == "green") {
      room.currentTurn = "blue";
      d.old = "green";
      d.current = "blue";
    }
    clearInterval(room.waitTimeRef);
    room.waitTimeRef = null;
    room.waitTimer = 13000;
    room.movableSteps = 0;
    room.sixCount = 0;
    return d;
  } catch (error) {
    console.error("Error in :", error);
  }
};
export const totalWorkers = (room, colors) => {
  try {
    let pls = room.data[colors[room.currentTurn]].players;
    let player = 0;
    pls.forEach((pl) => {
      if (true) {
        if (typeof Road[room.currentTurn][pl.currentPos + 1] != "undefined") {
          player++;
        }
      }
    });

    return player;
  } catch (error) {
    console.error("Error in :", error);
  }
};
export const getMovableGoti = (room, dv, colors) => {
  try {
    let pls = room.data[colors[room.currentTurn]].players;

    let player = [];

    pls.forEach((pl) => {
      if (pl.status == 1) {
        if (typeof Road[room.currentTurn][pl.currentPos + dv] != "undefined") {
          player.push(pl);
        }
      }

      if (pl.status == -1) {
        if (dv == 6) {
          player.push(pl);
        }
      }
    });
    return player;
  } catch (error) {
    console.error("Error in :", error);
  }
};

export const startTimer = (room, colors, io) => {
  try {
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
        lose: ws.looserColor,
      };
      updateGameData({ gameUid: room._id, data: { ...end, roomData: room } })
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
      return;
    } else {
      if (!room.waitTimeRef && room.waitTimer == 13000) {
        room.killing = false;
        room.waitTimeRef = setInterval(() => {
          io.to(room.code).emit("timerProgress", room.waitTimer / 13000);
          room.waitTimer -= 100;
          if (room.waitTimer < 1) {
            clearInterval(room.waitTimeRef);
            room.waitTimeRef = null;
            room.waitTimer = 13000;
            sendRunDice(
              room,
              {
                color: room.currentTurn,
                room_code: room.code,
                autoMove: true,
              },
              colors,
              io
            );
            room.data[colors[room.currentTurn]].life--;
          }
        }, 100);
      }
    }
  } catch (error) {
    console.error("Error in :", error);
  }
};

export const isSomeoneGetKilled = (room, killer, colors) => {
  try {
    let rt = {};

    if (room.currentTurn == "blue") {
      rt.color = "green";
    } else if (room.currentTurn == "green") {
      rt.color = "blue";
    }

    let victims = room.data[colors[rt.color]].players;

    victims.forEach((victim) => {
      let pos = Road[rt.color][victim.currentPos];
      // //console.log(killer.x, pos.x, killer.y, pos.y);

      if (killer.x == pos.x && killer.y == pos.y + 10) {
        rt.dead = victim;
      }
    });

    if (rt.dead) {
      // console.log("checking for multiples victims");
      let dpos = Road[rt.color][rt.dead.currentPos];
      let totalp = 0;

      victims.forEach((victim) => {
        let pos = Road[rt.color][victim.currentPos];
        // console.log(dpos.x, pos.x, dpos.y, pos.y);
        if (dpos.x == pos.x && dpos.y == pos.y) {
          totalp++;
        }
      });

      // console.log("victims found on same pos : ", totalp);
      if (totalp > 1) {
        rt = {};
      }
    }
    // Store the positions of all victims

    return rt;
  } catch (error) {
    console.error("Error in :", error);
  }
};

export const isSomeoneGetKilled2 = (room, killer, colors) => {
  try {
    let rt = {};
    return {};
    if (room.currentTurn == "blue") {
      rt.color = "blue";
      rt.killer = "green";
    } else if (room.currentTurn == "green") {
      rt.color = "green";
      rt.killer = "blue";
    }

    let victims = room.data[colors[rt.color]].players;
    let killers = room.data[colors[rt.killer]].players;

    killers.forEach((killer) => {
      let killerpos = Road[rt.killer][killer.currentPos];
      victims.forEach((victim) => {
        let victimpos = Road[rt.color][victim.currentPos];

        if (killerpos.x == victimpos.x && killerpos.y == victimpos.y) {
          let safe = Road.safe.some(
            (pos) => pos.x === victimpos.x && pos.y === victimpos.y + 10
          );
          if (!safe) rt.dead = victim;
        }
      });
    });

    if (rt.dead) {
      console.log("checking for multiples victims");
      let dpos = Road[rt.color][rt.dead.currentPos];
      let totalp = 0;

      victims.forEach((victim) => {
        let pos = Road[rt.color][victim.currentPos];
        console.log(dpos.x, pos.x, dpos.y, pos.y);
        if (dpos.x == pos.x && dpos.y == pos.y) {
          totalp++;
        }
      });

      console.log("victims found on same pos : ", totalp);
      if (totalp > 1) {
        rt = {};
      }
    }
    // Store the positions of all victims

    return rt;
  } catch (error) {
    console.error("Error in :", error);
  }
};

export const movePlayer = (room, res, colors, io) => {
  try {
    if (room.playerIsMoving) {
      ////console.log("player is already moving");
      return false;
    }
    ////console.log(res);
    if (res.color != room.currentTurn) {
      ////console.log("this is not your turn");
    } else if (room.movableSteps == 0) {
      ////console.log("no move possible");
    } else if (room.data[colors[res.color]].players[res.index].status == -1) {
      ////console.log("player is not alive, move not possible");
    } else if (
      typeof Road[room.currentTurn][
        room.data[colors[res.color]].players[res.index].currentPos +
          room.lastDiceValue
      ] == "undefined"
    ) {
      ////console.log("move is not possible becuase no is greater then left steps");
    } else {
      clearInterval(room.waitTimeRef);

      room.playerIsMoving = true;
      res.currentPos =
        room.data[colors[res.color]].players[res.index].currentPos;
      io.to(res.room_code).emit("moveGoti", res);
      room.moveTimeRef = setInterval(() => {
        room.data[colors[res.color]].players[res.index].currentPos++;
        room.movableSteps--;
        res.x =
          Road[res.color][
            room.data[colors[res.color]].players[res.index].currentPos
          ].x;

        res.y =
          Road[res.color][
            room.data[colors[res.color]].players[res.index].currentPos
          ].y + 10;

        if (room.movableSteps < 1) {
          let safecheck = {
            x: res.x,
            y: res.y,
          };

          res.safeSound = Road.safe.some(
            (e) => e.x == safecheck.x && e.y == safecheck.y
          );
          let timetokill = 0;
          if (!res.safeSound) {
            let dead = isSomeoneGetKilled(room, safecheck, colors);
            let pdead = isSomeoneGetKilled2(room, safecheck, colors);

            if (typeof dead.dead != "undefined") {
              let kill = dead.dead;

              let p = room.data[colors[dead.color]].players[kill.index];

              let killhim = {};

              killhim.index = kill.index;
              killhim.color = dead.color;
              killhim.currentPos = p.currentPos;

              timetokill = p.currentPos * 85 + 150;

              p.status = -1;
              p.currentPos = 0;
              // //console.log("killed", killhim);
              room.killing = true;
              io.to(room.code).emit("_kill", killhim);
              room.extraChance = true;
            } else {
              console.log(pdead);
              if (typeof pdead.dead != "undefined") {
                let kill = pdead.dead;

                let p = room.data[colors[pdead.color]].players[kill.index];

                let killhim = {};

                killhim.index = kill.index;
                killhim.color = dead.color;
                killhim.currentPos = p.currentPos;

                timetokill = p.currentPos * 85 + 150;

                p.status = -1;
                p.currentPos = 0;
                // //console.log("killed", killhim);
                room.killing = true;
                io.to(room.code).emit("_kill", killhim);
              }
            }
          }

          if (
            room.data[colors[res.color]].players[res.index].currentPos == 56
          ) {
            room.data[colors[res.color]].players[res.index].currentPos;
            let win = {
              color: res.color,
              index: res.index,
            };
            io.to(room.code).emit("_win", win);
            // //console.log("win");
            room.extraChance = true;
            timetokill = 350;
            let ws = checkWinningStatus(room, res, colors);
            // let ws = false;
            if (ws) {
              room.winner = ws.winnerColor;
              room.looser = ws.looserColor;
              room.endedAt = new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              });
              room.status = 1;
              // this.completionCode = 200;
              clearInterval(room.moveTimeRef);
              clearInterval(room.waitTimeRef);
              // let wlog = {
              //   start: room.createdAt,
              //   end: room.endedAt,
              //   winner: { color: room.winner, id: ws.winnerId },
              //   looser: { color: room.looser, id: ws.looserId },
              // };
              // datastore[room.code] = wlog;

              let end = {
                win: ws.winnerColor,
                lose: ws.looserColor,
              };
              io.to(room.code).emit("_end", end);
              startTimer(room, colors, io);

              // //console.log("game is finished");
              return;
            }
          }

          clearInterval(room.moveTimeRef);

          if (
            (room.lastDiceValue == 6 || room.extraChance) &&
            totalWorkers(room, colors) &&
            room.sixCount < 3
          ) {
            room.lastDiceValue = 0;
            room.extraChance = false;

            setTimeout(() => {
              res.bluelife = room.data[0].life;
              res.greenlife = room.data[1].life;
              io.to(res.room_code).emit("reTurn", res);
              startTimer(room, colors, io);
            }, timetokill);

            clearInterval(room.waitTimeRef);
            room.waitTimeRef = null;
            room.waitTimer = 13000;
            room.movableSteps = 0;
          } else {
            room.lastDiceValue = 0;
            let turn = toggleTurn(room);
            res.color = turn.current;
            res.oldColor = turn.old;
            res.bluelife = turn.bluelife;
            res.greenlife = turn.greenlife;
            io.to(res.room_code).emit("toggleTurn", res);
            startTimer(room, colors, io);
          }

          room.playerIsMoving = false;
        }
      }, 260);
    }
  } catch (error) {
    console.error("Error in :", error);
  }
};

export const checkWinningStatus = (room, res, colors) => {
  try {
    let blueteam = room.data[0];
    let greenteam = room.data[1];
    let bluewinner = 0;
    let greenwinner = 0;
    let reason = "";
    blueteam.players.forEach((token) => {
      if (token.currentPos > 55) bluewinner++;
    });

    greenteam.players.forEach((token) => {
      if (token.currentPos > 55) greenwinner++;
    });
    let ob = {};
    ob.room_code = room.code;
    ob.startedAt = room.createdAt;
    ob.endedAt = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    // //console.log("bwin :" + bluewinner + ", greenlife :" + greenteam.life);
    // //console.log("gwin :" + greenwinner + ", bluelife :" + blueteam.life);

    if (bluewinner > 0 || greenteam.life < 0 || greenteam.exit) {
      ob.winnerColor = "blue";
      ob.winnerId = blueteam.userId;
      ob.looserColor = "green";
      ob.looserId = greenteam.userId;
      ob.reason = "green user exited the game";
    } else if (greenwinner > 0 || blueteam.life < 0 || blueteam.exit) {
      ob.winnerColor = "green";
      ob.winnerId = greenteam.userId;
      ob.looserColor = "blue";
      ob.looserId = blueteam.userId;
      ob.reason = "blue user exited the game";
    } else {
      ob = false;
    }

    if (ob) {
    }

    // //console.log(ob);

    return ob;
  } catch (error) {
    console.error("Error in :", error);
  }
};
export const shuffleArray = (array) => {
  try {
    for (let i = array.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1)); // Get a random index
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]]; // Swap elements
    }
    return array;
  } catch (error) {
    console.error("Error in :", error);
  }
};

export const getRandomWithProbability = () => {
  try {
    // Define the probability distribution
    // Numbers 1-6 with probabilities: 1=10%, 2=20%, 3=30%, 4=10%, 5=20%, 6=10%
    let weightedNumbers = [
      1,
      1,
      1, // 10%
      2,
      2, // 20%
      3,
      3,
      3, // 30%
      4,
      4, // 10%
      5,
      5, // 20%
      6,
      6,
      6,
    ];

    weightedNumbers = shuffleArray(weightedNumbers);
    // Select a random index
    const randomIndex = Math.floor(Math.random() * weightedNumbers.length);

    // Return the number at the random index
    return weightedNumbers[randomIndex];
  } catch (error) {
    console.error("Error in :", error);
  }
};

export const sendRunDice = (room, res, colors, io) => {
  try {
    if (room.killing) return;
    let goti = [];
    if (room.movableSteps > 0) {
      res.value = room.movableSteps;
      res.currentColor = room.currentTurn;
      goti = getMovableGoti(room, res.value, colors);
      res.possibleMoves = goti;
    } else {
      res.value = getRandomWithProbability();
      // res.value = randomNumber(1, 6);
      if (res.magic && res.magic > 0) {
        res.value = res.magic;
      }
      // res.value = 1;
      if (res.value == 6) room.sixCount++;
      else room.sixCount = 0;

      goti = getMovableGoti(room, res.value, colors);
      res.possibleMoves = goti;
      res.currentColor = room.currentTurn;
      io.to(res.room_code).emit("_dv", res);
      room.lastDiceValue = res.value;
      room.movableSteps = res.value;
    }
    if (goti.length == 1) res.autoMove = true;
    if (typeof res.autoMove != "undefined") {
      if (typeof goti[0] != "undefined") {
        res.index = goti[0].index;
        if (goti[0].status == -1 && goti[0].currentPos == 0) {
          goti[0].status = 1;
          res.x =
            Road[room.currentTurn][
              room.data[colors[room.currentTurn]].players[
                goti[0].index
              ].currentPos
            ].x;

          res.y =
            Road[room.currentTurn][
              room.data[colors[room.currentTurn]].players[goti[0].index]
                .currentPos
            ].y + 10;

          setTimeout(() => {
            moveGoti(room, res, colors, io);
          }, 250);
          let kf = true;
        } else {
          setTimeout(() => {
            movePlayer(room, res, colors, io);
          }, 250);
        }
      }
    }

    if (typeof goti[0] == "undefined" || typeof kf != "undefined") {
      let ws = checkWinningStatus(room, res, colors);
      // let ws = false;
      if (ws) {
        room.winner = ws.winnerColor;
        room.looser = ws.looserColor;
        room.endedAt = new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });
        room.status = 1;
        // this.completionCode = 200;
        clearInterval(room.moveTimeRef);
        clearInterval(room.waitTimeRef);
        // let wlog = {
        //   start: room.createdAt,
        //   end: room.endedAt,
        //   winner: { color: room.winner, id: ws.winnerId },
        //   looser: { color: room.looser, id: ws.looserId },
        // };
        // datastore[room.code] = wlog;

        let end = {
          win: ws.winnerColor,
          lose: ws.looserColor,
        };
        io.to(room.code).emit("_end", end);
        startTimer(room, colors, io);

        // //console.log("game is finished");
        return;
      } else {
        setTimeout(() => {
          clearInterval(room.moveTimeRef);
          room.lastDiceValue = 0;
          let turn = toggleTurn(room);

          res.color = turn.current;
          res.oldColor = turn.old;
          res.bluelife = turn.bluelife;
          res.greenlife = turn.greenlife;
          io.to(res.room_code).emit("toggleTurn", res);
          startTimer(room, colors, io);
        }, 1000);
      }
    }
  } catch (error) {
    console.error("Error in :", error);
  }
};

export const moveGoti = (room, res, colors, io) => {
  try {
    let ws = checkWinningStatus(room, res, colors);
    // let ws = false;
    if (ws) {
      room.winner = ws.winnerColor;
      room.looser = ws.looserColor;
      room.endedAt = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
      room.status = 1;
      // this.completionCode = 200;
      clearInterval(room.moveTimeRef);
      clearInterval(room.waitTimeRef);
      // let wlog = {
      //   start: room.createdAt,
      //   end: room.endedAt,
      //   winner: { color: room.winner, id: ws.winnerId },
      //   looser: { color: room.looser, id: ws.looserId },
      // };
      // datastore[room.code] = wlog;

      let end = {
        win: ws.winnerColor,
        lose: ws.looserColor,
      };
      io.to(room.code).emit("_end", end);
      startTimer(room, colors, io);

      // //console.log("game is finished");
      return;
    }

    if (room.playerIsMoving) {
      ////console.log("player is already moving");
      return false;
    }
    ////console.log("level1");
    if (res.color != room.currentTurn) {
      ////console.log("this is not your turn");
    } else if (room.movableSteps == 0) {
      ////console.log("no move possible");
    } else {
      clearInterval(room.waitTimeRef);

      room.playerIsMoving = true;
      ////console.log("level2");

      // room.moveTimeRef = setInterval(() => {
      ////console.log("level3", res);

      io.to(res.room_code).emit("_goti_", res);

      // if (room.movableSteps < 1) {
      clearInterval(room.moveTimeRef);
      room.lastDiceValue = 0;

      res.bluelife = room.data[0].life;
      res.greenlife = room.data[1].life;

      let ws = checkWinningStatus(room, res, colors);
      // let ws = false;
      if (ws) {
        room.winner = ws.winnerColor;
        room.looser = ws.looserColor;
        room.endedAt = new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });
        room.status = 1;
        // this.completionCode = 200;
        clearInterval(room.moveTimeRef);
        clearInterval(room.waitTimeRef);
        // let wlog = {
        //   start: room.createdAt,
        //   end: room.endedAt,
        //   winner: { color: room.winner, id: ws.winnerId },
        //   looser: { color: room.looser, id: ws.looserId },
        // };
        // datastore[room.code] = wlog;

        let end = {
          win: ws.winnerColor,
          lose: ws.looserColor,
        };
        io.to(room.code).emit("_end", end);
        startTimer(room, colors, io);

        // //console.log("game is finished");
        return;
      }

      if (room.sixCount > 2) {
        let turn = toggleTurn(room);
        res.color = turn.current;
        res.oldColor = turn.old;
        io.to(res.room_code).emit("toggleTurn", res);
      } else {
        io.to(res.room_code).emit("reTurn", res);
      }
      startTimer(room, colors, io);
      room.playerIsMoving = false;
      clearInterval(room.waitTimeRef);
      room.waitTimeRef = null;
      room.waitTimer = 13000;
      room.movableSteps = 0;
      startTimer(room, colors, io);
      // }
      // }, 250);
    }
  } catch (error) {
    console.error("Error in :", error);
  }
};

export const ping = (socket) => {
  try {
    console.log(
      "classic online server is working : ",
      Object.keys(rooms).length
    );
    socket.on("ping", () => {
      socket.emit("pong");
    });
  } catch (error) {
    console.error("Error in :", error);
  }
};
