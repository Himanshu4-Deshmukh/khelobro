import { PlayerBorderAction } from "../actions/PlayerBorderAction.js";

export const Init = (scene) => {
  scene.greenDice.setVisible(false);
  scene.blueDice.setVisible(false);

  scene.currentDice = scene[scene.currentColor + "Dice"];
  scene.currentDice.setVisible(true);
  scene.currentDice.setInteractive();

  scene[scene.currentColor + "highlight"].setVisible(true);

  if (scene.diceValue > 0) {
    scene.arrow.setVisible(false);
  } else {
    scene.arrow.setVisible(true);
  }

  if (scene.color != scene.currentColor) {
    scene.arrow.setVisible(false);
  }

  // scene.playerBorder.x = 200;
  PlayerBorderAction(scene);
};
