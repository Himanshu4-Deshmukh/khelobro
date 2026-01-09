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
          score: pl.score,
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

export const getPlayersScores = (room) => {
  try {
    let posd = {};

    room.data.forEach((color) => {
      posd[color.color] = [];
      color.players.forEach((pl, index) => {
        let pd = {
          index: index,
          color: color.color,
          score: pl.score,
        };
        posd[color.color].push(pd);
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

export const shuffleArray = (array) => {
  try {
    for (let i = array.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
  } catch (error) {
    console.error("Error in :", error);
  }
};

// ============ NEW STACKING LOGIC ============

// const STAR_POS = 8; // 8th square after start (star box)

// const isSafeZone = (x, y) => {
//   try {
//     return Road.safe.some((p) => p.x === x && p.y === y);
//   } catch {
//     return false;
//   }
// };

// const isEntrance = (pos) => pos === 0;

// const isHomeColumn = (col, pos) => {
//   const finish = Road[col] ? Road[col].length - 1 : 56;
//   return pos >= finish - 4 && pos <= finish; // 52-56
// };

// ================= STACK-ALLOWED POSITIONS =================

// Star positions (global board index)
const STAR_POSITIONS = new Set([8, 21, 34, 47]);

// Safe zones (including home-start safe squares)
const SAFE_POSITIONS = new Set([13, 26, 39, 51]);

const isStar = (pos) => STAR_POSITIONS.has(pos);
const isSafe = (pos) => SAFE_POSITIONS.has(pos);

const isEntrance = (pos) => pos === 0;

const isHomeColumn = (col, pos) => {
  const finish = Road[col] ? Road[col].length - 1 : 56;
  return pos >= finish - 4 && pos <= finish; // 52–56
};


const getOwnOccupied = (room, colors) => {
  const col = room.currentTurn;
  const occ = new Set();
  room.data[colors[col]].players.forEach((t) => {
    if (t.status === 1) occ.add(t.currentPos);
  });
  return occ;
};

// const illegalStack = (room, dice, colors) => {
//   const col = room.currentTurn;
//   const occ = getOwnOccupied(room, colors);

//   for (const t of room.data[colors[col]].players) {
//     if (t.status === -1) {
//       if (dice === 6) continue;
//       continue;
//     }
//     if (t.status !== 1) continue;

//     const dst = t.currentPos + dice;
//     const road = Road[col][dst];
//     if (!road) continue;

//     if (isEntrance(dst)) continue;
//     if (dst === STAR_POS) continue;
//     if (isHomeColumn(col, dst)) continue;

//     if (occ.has(dst)) return true; // forbidden same-colour stack
//   }
//   return false;
// };

// ============ SMART DICE GENERATION ============


const illegalStack = (room, dice, colors) => {
  const col = room.currentTurn;
  const occ = getOwnOccupied(room, colors);

  for (const t of room.data[colors[col]].players) {
    if (t.status !== 1) continue;

    const dst = t.currentPos + dice;
    if (!Road[col][dst]) continue;

    // ✅ stacking allowed here
    if (
      isEntrance(dst) ||
      isStar(dst) ||
      isSafe(dst) ||
      isHomeColumn(col, dst)
    ) {
      continue;
    }

    // ❌ forbidden same-colour stack
    if (occ.has(dst)) return true;
  }
  return false;
};

export const generatePlayableDice = (room, colors) => {
  try {
    // 1. Six-limit: max 2 sixes in a row
    let pool = [1, 2, 3, 4, 5, 6];
    if (room.sixCount >= 2) pool = [1, 2, 3, 4, 5];

    // 2. Split into preferred (no illegal stacking) and fallback
    const preferred = [];
    const fallback = [];
    shuffleArray(pool).forEach((d) => {
      if (!illegalStack(room, d, colors)) preferred.push(d);
      else fallback.push(d);
    });
    const candidates = preferred.length ? preferred : fallback;

    // 3. Weighted pick (matching original distribution)
    const weighted = [];
    candidates.forEach((n) => {
      if (n === 1 || n === 6) {
        weighted.push(n, n, n); // 10% each
      } else if (n === 2 || n === 5) {
        weighted.push(n, n, n); // 20% each
      } else if (n === 3) {
        weighted.push(n, n, n); // 30%
      } else if (n === 4) {
        weighted.push(n, n, n); // 10%
      }
    });
    return shuffleArray(weighted)[0];
  } catch (error) {
    console.error("Error in generatePlayableDice:", error);
    return randomNumber(1, 6);
  }
};

export const getRandomWithProbability = () => {
  try {
    // Define the probability distribution
    // Numbers 1-6 with probabilities: 1=10%, 2=20%, 3=30%, 4=10%, 5=20%, 6=10%
    let weightedNumbers = [
      1, 1, 1, // 10%
      2, 2, // 20%
      2,
      3, 3, 3, // 30%
      4, 4, // 10%
      4,
      5, 5, // 20%
      5,
      6, 6,
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

// ============ UPDATED MOVABLE GOTI WITH STACKING PREVENTION ============

// export const getMovableGoti = (room, dv, colors) => {
//   try {
//     const col = room.currentTurn;
//     const occ = getOwnOccupied(room, colors);
//     let player = [];

//     room.data[colors[col]].players.forEach((pl) => {
//       let canMove = false;

//       // Token at home, can only move with 6
//       if (pl.status == -1) {
//         if (dv == 6) {
//           canMove = true;
//         }
//       }
//       // Token on board
//       else if (pl.status == 1) {
//         const dst = pl.currentPos + dv;
//         const road = Road[col][dst];

//         if (road !== undefined) {
//           // Check if destination allows stacking
//           if (isEntrance(dst)) {
//             canMove = true; // Entrance allows stacking
//           } else if (dst === STAR_POS) {
//             canMove = true; // Star allows stacking
//           } else if (isHomeColumn(col, dst)) {
//             canMove = true; // Home column allows stacking
//           } else if (!occ.has(dst)) {
//             canMove = true; // No same-color token at destination
//           }
//           // Otherwise: same-color overlap in non-allowed zone -> illegal
//         }
//       }

//       if (canMove) {
//         player.push(pl);
//       }
//     });

//     return player;
//   } catch (error) {
//     console.error("Error in :", error);
//   }
// };

export const getMovableGoti = (room, dv, colors) => {
  try {
    const col = room.currentTurn;
    const occ = getOwnOccupied(room, colors);
    const player = [];

    room.data[colors[col]].players.forEach((pl) => {
      let canMove = false;

      if (pl.status === -1 && dv === 6) {
        canMove = true;
      }
      else if (pl.status === 1) {
        const dst = pl.currentPos + dv;
        if (!Road[col][dst]) return;

        if (
          isEntrance(dst) ||
          isStar(dst) ||
          isSafe(dst) ||
          isHomeColumn(col, dst) ||
          !occ.has(dst)
        ) {
          canMove = true;
        }
      }

      if (canMove) player.push(pl);
    });

    return player;
  } catch (error) {
    console.error("Error in getMovableGoti:", error);
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

      let end = {
        win: ws.winnerColor,
        winScore: ws.winnerScore,
        lose: ws.looserColor,
        loseScore: ws.looserScore,
        sc: ws.sc,
      };
      updateGameData({ gameUid: room._id, data: { ...end, roomData: room } })
        .then((result) => {
          // Game data updated successfully
        })
        .catch((error) => {
          // Error updating game data
        });
      io.to(room.code).emit("_end", end);
      setTimeout(() => {
        delete rooms[room.code];
      }, 1000 * 60 * 5);
      return;
    } else {
      if (!room.waitTimeRef && room.waitTimer == 13000) {
        room.killing = false;
        room.waitTimeRef = setInterval(() => {
          let obfix = {};
          obfix.scoresData = getPlayersScores(room);
          obfix.progress = room.waitTimer / 13000;

          io.to(room.code).emit("timerProgress", obfix);

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

      if (killer.x == pos.x && killer.y == pos.y + 10) {
        rt.dead = victim;
      }
    });

    if (rt.dead) {
      let dpos = Road[rt.color][rt.dead.currentPos];
      let totalp = 0;

      victims.forEach((victim) => {
        let pos = Road[rt.color][victim.currentPos];
        if (dpos.x == pos.x && dpos.y == pos.y) {
          totalp++;
        }
      });

      if (totalp > 1) {
        rt = {};
      }
    }

    return rt;
  } catch (error) {
    console.error("Error in :", error);
  }
};

export const isSomeoneGetKilled2 = (room, killer, colors) => {
  try {
    let rt = {};
    return {};
  } catch (error) {
    console.error("Error in :", error);
  }
};

export const movePlayer = (room, res, colors, io) => {
  try {
    if (room.playerIsMoving) {
      return false;
    }
    if (res.color != room.currentTurn) {
    } else if (room.movableSteps == 0) {
    } else if (room.data[colors[res.color]].players[res.index].status == -1) {
    } else if (
      typeof Road[room.currentTurn][
      room.data[colors[res.color]].players[res.index].currentPos +
      room.lastDiceValue
      ] == "undefined"
    ) {
    } else {
      clearInterval(room.waitTimeRef);

      room.playerIsMoving = true;
      res.currentPos =
        room.data[colors[res.color]].players[res.index].currentPos;
      io.to(res.room_code).emit("moveGoti", res);

      room.data[colors[res.color]].players[res.index].score +=
        room.movableSteps;
      room.data[colors[res.color]].score += room.movableSteps;
      room.playerInfo[res.color].score += room.movableSteps;

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

            if (dead && typeof dead.dead != "undefined") {
              let kill = dead.dead;

              let p = room.data[colors[dead.color]].players[kill.index];
              room.data[colors[res.color]].players[res.index].score += p.score;
              room.data[colors[res.color]].score += p.score;
              room.playerInfo[res.color].score += p.score;

              let killhim = {};

              killhim.index = kill.index;
              killhim.color = dead.color;
              killhim.currentPos = p.currentPos;

              timetokill = p.currentPos * 85 + 150;

              p.status = -1;
              p.currentPos = 0;

              room.data[colors[dead.color]].score -= p.score;
              room.playerInfo[dead.color].score -= p.score;
              p.score = 0;
              room.killing = true;
              io.to(room.code).emit("_kill", killhim);
              room.extraChance = true;
            } else {
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

            room.data[colors[res.color]].winners += 1;

            let mul = Number(room.data[colors[res.color]].winners) + 1;
            let bam =
              mul * room.data[colors[res.color]].players[res.index].score;

            room.data[colors[res.color]].score +=
              bam - room.data[colors[res.color]].players[res.index].score;
            room.playerInfo[res.color].score +=
              bam - room.data[colors[res.color]].players[res.index].score;
            room.data[colors[res.color]].players[res.index].score = bam;

            io.to(room.code).emit("_win", win);
            room.extraChance = true;
            timetokill = 350;
            let ws = checkWinningStatus(room, res, colors);
            if (ws) {
              room.winner = ws.winnerColor;
              room.looser = ws.looserColor;
              room.endedAt = new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              });
              room.status = 1;
              clearInterval(room.moveTimeRef);
              clearInterval(room.waitTimeRef);

              let end = {
                win: ws.winnerColor,
                lose: ws.looserColor,
              };
              io.to(room.code).emit("_end", end);
              startTimer(room, colors, io);
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
              res.scoresData = getPlayersScores(room);

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
            res.scoresData = getPlayersScores(room);

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
    let currentTime = Date.now();

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

    ob.sc = false;
    if (
      bluewinner > 3 ||
      greenteam.life < 0 ||
      greenwinner > 3 ||
      blueteam.life < 0 ||
      currentTime >= room.expectedEndingTime ||
      greenteam.exit ||
      blueteam.exit
    ) {
      if (greenteam.life < 0 || greenteam.exit) {
        ob.sc = true;
        ob.winnerColor = "blue";
        ob.winnerScore = blueteam.score;
        ob.winnerId = blueteam.userId;
        ob.looserColor = "green";
        ob.looserScore = greenteam.score;
        ob.looserId = greenteam.userId;
      } else if (blueteam.life < 0 || blueteam.exit) {
        ob.sc = true;

        ob.winnerColor = "green";
        ob.winnerScore = greenteam.score;
        ob.winnerId = greenteam.userId;
        ob.looserColor = "blue";
        ob.looserScore = blueteam.score;
        ob.looserId = blueteam.userId;
      } else if (greenteam.score > blueteam.score) {
        ob.winnerColor = "green";
        ob.winnerScore = greenteam.score;
        ob.winnerId = greenteam.userId;
        ob.looserColor = "blue";
        ob.looserScore = blueteam.score;
        ob.looserId = blueteam.userId;
      } else if (blueteam.score == greenteam.score) {
        ob.winnerColor = null;
        ob.winnerScore = blueteam.score;
        ob.winnerId = null;
        ob.looserColor = null;
        ob.looserScore = greenteam.score;
        ob.looserId = null;
      } else {
        ob.looserColor = "green";
        ob.looserScore = greenteam.score;
        ob.looserId = greenteam.userId;
        ob.winnerColor = "blue";
        ob.winnerScore = blueteam.score;
        ob.winnerId = blueteam.userId;
      }
    } else {
      ob = false;
    }

    if (ob) {
    }

    return ob;
  } catch (error) {
    console.error("Error in :", error);
  }
};

// ============ UPDATED DICE ROLL WITH SMART GENERATION ============

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
      // Use smart dice generation instead of random
      if (res.magic && res.magic > 0) {
        res.value = res.magic;
      } else {
        res.value = generatePlayableDice(room, colors);
      }

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
      if (ws) {
        room.winner = ws.winnerColor;
        room.looser = ws.looserColor;
        room.endedAt = new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });
        room.status = 1;
        clearInterval(room.moveTimeRef);
        clearInterval(room.waitTimeRef);

        let end = {
          win: ws.winnerColor,
          winScore: ws.winnerScore,
          lose: ws.looserColor,
          loseScore: ws.looserScore,
        };

        io.to(room.code).emit("_end", end);
        startTimer(room, colors, io);
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
          res.scoresData = getPlayersScores(room);

          io.to(res.room_code).emit("toggleTurn", res);
          startTimer(room, colors, io);
        }, 1000);
      }
    }
  } catch (error) {
    console.error("Error in :", error);
  }
};

/* --------------------------------------------------------- */
/*  stillHasMoves  (birth-dice reuse)                       */
/* --------------------------------------------------------- */
const stillHasMoves = (room, dice, colors) =>
  getMovableGoti(room, dice, colors).length > 0;

export const moveGoti = (room, res, colors, io) => {
  try {
    const ws = checkWinningStatus(room, res, colors);
    if (ws) {                                                       // game over
      room.winner = ws.winnerColor;
      room.looser = ws.looserColor;
      room.endedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      room.status = 1;
      clearInterval(room.moveTimeRef);
      clearInterval(room.waitTimeRef);
      io.to(room.code).emit('_end', { win: ws.winnerColor, lose: ws.looserColor });
      startTimer(room, colors, io);
      return;
    }

    if (room.playerIsMoving) return false;                          // sanity
    if (res.color !== room.currentTurn) return false;

    clearInterval(room.waitTimeRef);
    room.playerIsMoving = true;
    io.to(res.room_code).emit('_goti_', res);                       // show birth

    /* ---------------------------------------------------------
     * NEW: keep dice on 6 birth
     * --------------------------------------------------------- */
    if (room.lastDiceValue === 6 && stillHasMoves(room, 6, colors)) {
      // player has another move with the same 6 – keep dice
      room.lastDiceValue = 0;
      room.movableSteps = 0;
      res.bluelife = room.data[0].life;
      res.greenlife = room.data[1].life;
      res.scoresData = getPlayersScores(room);
      io.to(res.room_code).emit('reTurn', res);
      startTimer(room, colors, io);
    } else {
      // nothing more to do – finish turn normally
      room.lastDiceValue = 0;
      const turn = toggleTurn(room);
      res.color = turn.current;
      res.oldColor = turn.old;
      res.bluelife = turn.bluelife;
      res.greenlife = turn.greenlife;
      res.scoresData = getPlayersScores(room);
      io.to(res.room_code).emit('toggleTurn', res);
      startTimer(room, colors, io);
    }

    room.playerIsMoving = false;
    clearInterval(room.waitTimeRef);
    room.waitTimeRef = null;
    room.waitTimer = 13000;
    room.movableSteps = 0;
  } catch (e) {
    console.error('moveGoti', e);
  }
};

export const ping = (socket) => {
  console.log("speedludo server is working : ", Object.keys(rooms).length);
  socket.on("ping", () => socket.emit("pong"));
};