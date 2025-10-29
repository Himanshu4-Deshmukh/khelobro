import { Scene } from "phaser";
import { DrawAction } from "../actions/DrawAction";

export const GetData = (scene) => {
  const gameUid = localStorage.getItem("gameUid"); // Retrieve gameUid from localStorage
  const deviceId = localStorage.getItem("_di"); // Retrieve gameUid from localStorage
  const token = localStorage.getItem("_tk"); // Retrieve gameUid from localStorage
  if (!gameUid || !deviceId || !token) {
    location.href = "/classic-1token";
  }

  scene.socket.emit("join", { gameUid, deviceId, token });

  scene.socket.on("gohome", () => {
    localStorage.removeItem("gameUid");
    window.dispatchEvent(
      new CustomEvent("navigate", { detail: { path: "/classic-1token" } })
    );
  });

  scene.socket.on("startgame", (res) => {
    clearInterval(scene.clockTimerRef);
    scene.scene.start("Game");
  });

  scene.socket.on("sync_join_status", (res) => {
    // console.log("sync join status", res);
    scene.roomCode = res.room_code;
    scene.initdata = res.players;
    scene.currentColor = res.currentTurn;
    scene.diceValue = res.lastDiceValue;
    scene.roomCode = res.room_code;
    scene.userId = res.playerInfo.userId;
    scene.playerInfo = res.playerInfo;
    scene.color = res.color;
    scene.gameStatus = res.gameStatus;
    scene.amount = res.amount;
    scene.mode = res.mode;

    scene.startedAt = res.startedAt;
    scene.duration = res.duration;
    scene.dones = res.dones;
    scene.deads = res.deads;
    scene._su = res._su;
    scene.prize = res.prize;

    scene.registry.set("prize", scene.prize);
    scene.registry.set("_su", scene._su);
    scene.registry.set("deads", scene.deads);
    scene.registry.set("dones", scene.dones);

    scene.registry.set("startedAt", scene.startedAt);
    scene.registry.set("duration", scene.duration);

    scene.registry.set("roomCode", scene.roomCode);
    scene.registry.set("initdata", scene.initdata);
    scene.registry.set("currentColor", scene.currentColor);
    scene.registry.set("diceValue", scene.diceValue);
    scene.registry.set("roomCode", scene.roomCode);
    scene.registry.set("userId", scene.userId);
    scene.registry.set("playerInfo", scene.playerInfo);
    scene.registry.set("color", scene.color);
    scene.registry.set("gameStatus", scene.gameStatus);
    scene.registry.set("amount", scene.amount);
    scene.registry.set("mode", scene.mode);
    scene.registry.set("safe", res.safe);

    setTimeout(() => {
      DrawAction(scene);
    }, 0);

    // localStorage.setItem("room_code", scene.roomCode);
    // localStorage.setItem("color", scene.color);
  });

  // scene.socket.on("restart", () => {
  //   localStorage.removeItem("room_code");
  //   localStorage.removeItem("color");
  //   window.location.reload();
  // });

  // checking status of join request
  scene.socket.on("join_status", (res) => {
    // console.log("join status", res);

    scene.roomCode = res.room_code;
    scene.initdata = res.players;
    scene.currentColor = res.currentTurn;
    scene.diceValue = res.lastDiceValue;
    scene.roomCode = res.room_code;
    scene.userId = res.playerInfo.fullName;
    scene.playerInfo = res.playerInfo;
    scene.color = res.color;
    scene.gameStatus = res.gameStatus;
    scene.amount = res.amount;
    scene.mode = res.mode;
    scene.startedAt = res.startedAt;
    scene.duration = res.duration;
    scene.dones = res.dones;
    scene.deads = res.deads;
    scene._su = res._su;
    scene.prize = res.prize;

    scene.registry.set("prize", scene.prize);
    scene.registry.set("_su", scene._su);
    scene.registry.set("deads", scene.deads);
    scene.registry.set("dones", scene.dones);

    scene.registry.set("startedAt", scene.startedAt);
    scene.registry.set("duration", scene.duration);

    scene.registry.set("roomCode", scene.roomCode);
    scene.registry.set("initdata", scene.initdata);
    scene.registry.set("currentColor", scene.currentColor);
    scene.registry.set("diceValue", scene.diceValue);
    scene.registry.set("roomCode", scene.roomCode);
    scene.registry.set("userId", scene.userId);
    scene.registry.set("playerInfo", scene.playerInfo);
    scene.registry.set("color", scene.color);
    scene.registry.set("gameStatus", scene.gameStatus);
    scene.registry.set("amount", scene.amount);
    scene.registry.set("mode", scene.mode);
    scene.registry.set("safe", res.safe);

    setTimeout(() => {
      DrawAction(scene);
    }, 0);

    // localStorage.setItem("room_code", scene.roomCode);
    // localStorage.setItem("color", scene.color);
  });

  // Listen for any socket errors
  scene.socket.on("connect_error", (err) => {
    //console.error("Socket connection error:", err);
  });
  // sending join request
};
