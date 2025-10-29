export const PlayerBorderAction = (scene) => {
  let path;

  if (scene.color == "green") {
    path = {
      blue: { x: 1006, y: 1794 },
      green: { x: 72, y: 1794 },
    };
  } else {
    path = {
      blue: { x: 72, y: 1794 },
      green: { x: 1006, y: 1794 },
    };
  }

  //   scene.playerBorder.x = path[scene.currentColor].x;
  //   scene.playerBorder.y = path[scene.currentColor].y;
  //   //console.log(scene.playerBorder);

  scene.tweens.add({
    targets: scene.playerBorder, // The object to tween
    x: path[scene.currentColor].x,
    y: path[scene.currentColor].y,
    duration: 300, // Duration of the tween in milliseconds
    ease: "linear", // Easing function (e.g., 'Linear', 'Cubic', 'Bounce', etc.)
    repeat: 0, // Number of times to repeat (-1 for infinite
  });
};
