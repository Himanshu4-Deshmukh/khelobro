export const RunDiceAction = (scene) => {
  scene.diceSound.play();
  scene.currentDice.disableInteractive();
  scene.currentDice.play(scene.currentColor + "DiceJump");
  if (scene.color == "blue" || true) {
    scene.tweens.add({
      targets: scene.currentDice,
      props: {
        scaleX: { value: 1.7, duration: 70, yoyo: true },
        scaleY: { value: 1.7, duration: 70, yoyo: true },
        y: { value: scene.currentDice.y - 120, duration: 70, yoyo: true },
      },
      ease: "linear",
      duration: 140,
      onComplete: () => {
        scene.blueDice.play("blue" + scene.diceValue);
        scene.greenDice.play("green" + scene.diceValue);
        scene.currentDice.setInteractive();
      },
    });
  } else {
    scene.tweens.add({
      targets: scene.currentDice,
      props: {
        scaleX: { value: 1.7, duration: 110, yoyo: true },
        scaleY: { value: 1.7, duration: 110, yoyo: true },
        y: { value: scene.currentDice.y + 120, duration: 110, yoyo: true },
      },
      ease: "linear",
      duration: 220,
      onComplete: () => {
        scene.blueDice.play("blue" + scene.diceValue);
        scene.greenDice.play("green" + scene.diceValue);
        scene.currentDice.setInteractive();
      },
    });
  }
};
