import { SmokeAction } from "./SmokeAction";

export const MovePlayerAction = (scene, goti) => {
  if (scene.moves.length < 1) {
    clearInterval(scene._timeref);
  }

  scene._timeref = setInterval(() => {
    if (scene.moves.length < 1) {
      clearInterval(scene._timeref);
      scene.playerIsMoving = false;
    }

    scene.tweens.add({
      targets: goti, // The object to tween
      props: {
        scaleX: { value: 1.35, duration: 65, yoyo: true },
        scaleY: { value: 1.35, duration: 65, yoyo: true },
        y: { value: scene.moves[0].y, duration: 65 },
        x: { value: scene.moves[0].x, duration: 65 },
      },
      duration: 130, // Duration of the tween in milliseconds
      ease: "Quad.easeOut", // Easing function (e.g., 'Linear', 'Cubic', 'Bounce', etc.)
      repeat: 0, // Number of times to repeat (-1 for infinite)
      onComplete: () => {
        goti.setScale(1);
        SmokeAction(scene, goti.color, goti.x, goti.y + 15);
        scene.moves.shift();
      },
    });
  }, 130);
};
