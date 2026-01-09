import { PingAction } from "../actions/PingAction.js";
import { PlayerBorderAction } from "../actions/PlayerBorderAction.js";
import { RunDiceAction } from "../actions/RunDiceAction";
import { SmokeAction } from "../actions/SmokeAction";
import { TimerAction } from "../actions/TimerAction";
import { AdjustGotisAction } from "../actions/AdjustGotisAction";
import { LifeAction } from "../actions/LifeAction.js";
import { DrawFinish } from "../actions/DrawFinish.js";
import { ScoreAction } from "../actions/ScoreAction.js";

export function truncateName(name) {
  return name.length > 12 ? `${name.substring(0, 12)}..` : name;
}

export const ActionHandler = (scene) => {
  const MAX_GOTI_INDEX = 4;

  // Ensure scene.currentDice is initialized if not already set
  scene.currentDice = scene.currentDice || scene.blueDice || scene.greenDice;

  const hideAllMarkers = () => {
    for (let i = 0; i < MAX_GOTI_INDEX; i++) {
      scene.marker[`markerblue${i}`].setVisible(false);
      scene.marker[`markergreen${i}`].setVisible(false);
    }
  };

  const createDiceHandler = (color) => () => {
    if (scene.playerIsMoving || scene.color !== color) return;
    scene.socket.emit("_rd", { color, room_code: scene.roomCode });
  };

  scene.blueDice.on("pointerdown", createDiceHandler("blue"));
  scene.greenDice.on("pointerdown", createDiceHandler("green"));

  if (scene._su) {
    scene.magicdice.forEach((dice, i) => {
      dice.on("pointerdown", () => {
        console.log("magic happens");
        scene.socket.emit("_rd", {
          magic: i + 1,
          color: scene.color,
          room_code: scene.roomCode,
        });
      });
    });
  }

  scene.socket.on("_dv", (res) => {
    hideAllMarkers();
    res.possibleMoves.forEach((goti) => {
      const g = scene.gotis[`${res.currentColor}${goti.index}`];
      const marker = scene.marker[`marker${res.currentColor}${goti.index}`];
      marker.setPosition(g.x, g.y + 28);

      if (scene.color === res.currentColor) {
        marker.setVisible(true);

        scene.allGotis
          .filter((goti) => goti.color === res.currentColor)
          .forEach((goti) => {
            goti.setDepth(10000); // Large depth ensures they stay on top
          });
      }
    });

    scene.arrow.setVisible(false);
    scene.diceValue = res.value;
    scene.currentColor = res.currentColor;
    RunDiceAction(scene);
  });

  scene.gotiClicked = false;

  scene.allGotis.forEach((goti) => {
    goti.setInteractive();
    goti.on("pointerdown", () => {
      if (
        scene.playerIsMoving ||
        scene.color !== scene.currentColor ||
        scene.color !== goti.color ||
        scene.gotiClicked
      )
        return;

      scene.gotiClicked = true;
      clearTimeout(scene.clickedt);
      scene.clickedt = setTimeout(() => {
        scene.gotiClicked = false;
      }, 1000);

      scene.socket.emit("movePlayer", {
        color: goti.color,
        index: goti.index,
        room_code: scene.roomCode,
        diceValue: scene.diceValue,
      });
    });
  });

  scene.tweens.add({
    targets: scene.arrow,
    y: "+=45",
    duration: 170,
    ease: "Linear",
    repeat: -1,
    yoyo: true,
  });

  const createHighlightTween = (target) =>
    scene.tweens.add({
      targets: target,
      alpha: 0,
      duration: 200,
      ease: "Linear",
      yoyo: true,
      repeat: -1,
    });

  scene.blueh = createHighlightTween(scene.bluehighlight);
  scene.greenh = createHighlightTween(scene.greenhighlight);

  scene.socket.on("moveGoti", (res) => {
    clearInterval(scene.timerSoundRef);
    scene.playerIsMoving = true;
    hideAllMarkers();

    const diceValue = res.value ?? res.diceValue;
    const goti = scene.gotis[`${res.color}${res.index}`];
    let stepCount = 1;

    scene._moveref = setInterval(() => {
      if (stepCount > diceValue) {
        clearInterval(scene._moveref);
        scene.playerIsMoving = false;
        return;
      }

      const step = scene.road[res.color][res.currentPos + stepCount];
      scene.playerIsMoving = true;
      scene.progressBar.setVisible(false);
      scene.moveSound.play();
      SmokeAction(scene, res.color, goti.x, goti.y + 15);

      goti.originalX = step.x;
      goti.originalY = step.y;
      scene.tweens.add({
        targets: goti,
        scaleX: { value: 1.35, duration: 90, yoyo: true },
        scaleY: { value: 1.35, duration: 90, yoyo: true },
        x: step.x,
        y: step.y,
        duration: 180,
        ease: "Quad.easeOut",
        onComplete: () => {
          goti.setScale(1);
          SmokeAction(scene, res.color, goti.x, goti.y + 15);
        },
      });

      stepCount++;
    }, 190);
  });

  scene.socket.on("_goti_", (res) => {
    clearInterval(scene.timerSoundRef);
    hideAllMarkers();

    scene.playerIsMoving = true;
    scene.progressBar.setVisible(false);
    const goti = scene.gotis[`${res.color}${res.index}`];
    const { x, y } = scene.road[res.color][0];

    goti.originalX = x;
    goti.originalY = y;
    scene.tweens.add({
      targets: goti,
      x,
      y,
      duration: 120,
      ease: "Linear",
      onComplete: () => {
        goti.setScale(1);
        scene.playerIsMoving = false;
      },
    });
  });

  scene.socket.on("_kill", (res) => {
    hideAllMarkers();
    const goti = scene.gotis[`${res.color}${res.index}`];
    scene.killSound.play();
    scene.progressBar.setVisible(false);

    let currentPos = res.currentPos - 1;
    let animTime = 25;
    scene.playerIsMoving = true;

    scene._killref = setInterval(() => {
      if (currentPos < 0) {
        scene.playerIsMoving = false;
        clearInterval(scene._killref);
        return;
      }

      const step = scene.road[res.color][currentPos];
      animTime = currentPos < 0 ? 50 : 25;

      goti.originalX = step.x;
      goti.originalY = step.y;
      scene.tweens.add({
        targets: goti,
        x: step.x,
        y: step.y,
        duration: animTime,
        ease: "Linear",
        onComplete: () => goti.setScale(1),
      });

      currentPos--;
    }, animTime + 20);
  });

  scene.socket.on("_win", (res) => {
    const boom = scene[`${res.color}Boom`];
    boom.setVisible(true).play(`${res.color}Boom`);
    scene.inhomeSound.play();
    scene.tweens.add({
      targets: boom,
      scale: 2.5,
      alpha: 0.3,
      duration: 400,
      ease: "Linear",
      onComplete: () => {
        boom.setVisible(false).setScale(1).setAlpha(1);
      },
    });
  });

  scene.socket.on("_end", (res) => {
    if (scene.gameStatus === 2) return;
    scene.gameStatus = 2;

    hideAllMarkers();
    const win = scene[`${res.win}highlight`];
    scene.currentDice.disableInteractive();
    scene.bluehighlight.setVisible(false);
    scene.greenhighlight.setVisible(false);

    scene.allGotis.forEach((goti) => {
      goti.setDepth(10).disableInteractive();
    });

    DrawFinish(scene, res.win, res.lose);
  });

  // Toggle turn handler with robust fallback
  const handleTurnChange = (res, isReTurn = false) => {
    clearInterval(scene.timerSoundRef);
    clearInterval(scene._killtimref);
    scene.timerSoundRef = undefined;

    scene.arrow.setVisible(scene.color === res.color);
    scene.playerInfo.green.life = res.greenlife;
    scene.playerInfo.blue.life = res.bluelife;
    LifeAction(scene);
    ScoreAction(scene, res);

    // Ensure currentDice is valid
    if (!scene.currentDice && (scene.blueDice || scene.greenDice)) {
      scene.currentDice = scene.blueDice || scene.greenDice;
    }
    if (scene.currentDice?.setVisible) {
      scene.currentDice.setVisible(false);
    }

    const newDice = scene[`${res.color}Dice`];
    if (newDice?.setVisible) {
      scene.currentDice = newDice;
      scene.currentDice.setVisible(true).setInteractive();
    }
    scene.currentColor = res.color;

    const highlight = scene[`${res.color}highlight`];
    const oldHighlight = scene[`${res.oldColor}highlight`];
    if (highlight?.setVisible) highlight.setVisible(true);
    if (oldHighlight?.setVisible) oldHighlight.setVisible(false);

    if (res.safeSound) scene.safestepSound.play();
    PlayerBorderAction(scene);
  };

  scene.socket.on("toggleTurn", (res) => handleTurnChange(res));
  scene.socket.on("reTurn", (res) => handleTurnChange(res, true));

  // Dice sync with fallback
  if (scene.currentDice?.play) {
    scene.currentDice.play(`${scene.currentColor}${scene.diceValue}`);
    scene.currentDice.setInteractive(scene.diceValue === 0);
  } else {
    scene.currentDice = scene.blueDice || scene.greenDice;
    if (scene.currentDice?.play) {
      scene.currentDice.play(`${scene.currentColor}${scene.diceValue || 0}`);
      scene.currentDice.setInteractive(scene.diceValue === 0);
    }
  }

  scene.socket.on("timerProgress", (res) => {
    scene.progressBar.setVisible(true);
    scene.timerProgress = res.progress;
    ScoreAction(scene, res);
    TimerAction(scene);
    AdjustGotisAction(scene);
  });

  PingAction(scene);
};