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
  return name;
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
        // console.log("magic happens");
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
          .filter((goti) => goti.color === res.currentColor) // Assuming each goti has a 'color' property
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

  scene.tokensExpanded = false;
  scene.bg = scene.add
    .image(190, 200, "safer")
    .setVisible(false)
    .setDepth(999999)
    .setOrigin(0, 0.5);

  scene.gotiClicked = false;

  scene.allGotis.forEach((goti) => {
    goti.setInteractive();
    goti.on("pointerdown", () => {
      // console.log("goti clicked");
      const total_tokens_on_same_location = [];

      scene.allGotis.forEach((token) => {
        if (
          token.originalX == goti.originalX &&
          token.originalY == goti.originalY
        ) {
          total_tokens_on_same_location.push(token);
        }
      });

      if (
        total_tokens_on_same_location.length > 1 &&
        scene.tokensExpanded == false
      ) {
        scene.tokensExpanded = true;
        //console.log("this location have more tokens than 1");
        //console.log(total_tokens_on_same_location);

        // If there are overlapping tokens
        const spacing = 70; // Adjust spacing between tokens
        const startX =
          total_tokens_on_same_location[0].originalX -
          ((total_tokens_on_same_location.length - 1) * spacing) / 2;

        scene.bg.x = startX - 35 * total_tokens_on_same_location.length;
        scene.bg.y = total_tokens_on_same_location[0].originalY;
        scene.bg.displayWidth = 115 * total_tokens_on_same_location.length;
        scene.bg.setVisible(true);
        total_tokens_on_same_location.forEach((token, index) => {
          token.setScale(1); // Scale down overlapping tokens
          token.x = startX + index * spacing; // Visually offset x
          token.y = token.originalY; // Keep y consistent with original
          token.setDepth(1000000);
        });
        return;
      } else {
      }

      scene.tokensExpanded = false;
      scene.bg.setVisible(false);

      //goti old action method
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

      //goti old action method ended
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
    scene.tokensExpanded = false;
    scene.bg.setVisible(false);
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
        scaleX: { value: 1.35, duration: 60, yoyo: true },
        scaleY: { value: 1.35, duration: 60, yoyo: true },
        x: step.x,
        y: step.y,
        duration: 120,
        ease: "Quad.easeOut",
        onComplete: () => {
          goti.setScale(1);
          SmokeAction(scene, res.color, goti.x, goti.y + 15);
        },
      });

      stepCount++;
    }, 130);
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
      // goti.y -= 180;
    });
    // scene.add.image(win.x, win.y - 180, "crown").setDepth(12);
    // scene.board.y -= 180;

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
      scene.currentDice = scene.blueDice || scene.greenDice; // Fallback to blue or green dice
    }
    if (scene.currentDice?.setVisible) {
      scene.currentDice.setVisible(false);
    }

    const newDice = scene[`${res.color}Dice`];
    if (true) {
      scene.currentDice = newDice;
      scene.currentDice.setVisible(true).setInteractive();
    } else {
      // //console.warn(`Dice for color ${res.color} not found`);
    }
    scene.currentColor = res.color;

    const highlight = scene[`${res.color}highlight`];
    const oldHighlight = scene[`${res.oldColor}highlight`];
    if (oldHighlight?.setVisible) oldHighlight.setVisible(false);
    if (highlight?.setVisible) highlight.setVisible(true);

    if (res.safeSound) scene.safestepSound.play();
    PlayerBorderAction(scene);

    // Debug log (remove after testing)
    // //console.log("Turn change:", {
    //   res,
    //   currentDice: scene.currentDice,
    //   newDiceExists: !!newDice,
    //   highlightExists: !!highlight,
    //   oldHighlightExists: !!oldHighlight,
    // });
  };

  scene.socket.on("toggleTurn", (res) => handleTurnChange(res));
  scene.socket.on("reTurn", (res) => handleTurnChange(res, true));

  // Dice sync with fallback
  if (scene.currentDice?.play) {
    scene.currentDice.play(`${scene.currentColor}${scene.diceValue}`);
    scene.currentDice.setInteractive(scene.diceValue === 0);
  } else {
    //console.warn("Initial dice sync skipped: currentDice not ready");
    scene.currentDice = scene.blueDice || scene.greenDice; // Fallback
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
