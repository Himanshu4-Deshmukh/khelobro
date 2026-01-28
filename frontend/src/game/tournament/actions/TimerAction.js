export const TimerAction = (scene) => {
  if (scene.timerProgress < 0.01 || scene.progressBar > 0.4) {
    clearInterval(scene.timerSoundRef);
    scene.timerSoundRef = undefined;
    return;
  }
  let profile = scene[scene.currentColor + "PlayerProfile"];
  let color = 0x3dff01;
  if (scene.timerProgress < 0.4) {
    color = 0xff0000;

    if (!scene.timerSoundRef && scene.timerProgress == 0.3923076923076923) {
      scene.timerSoundRef = setInterval(() => {
        //console.log("alram!!!!!!!!!!!!");
        if (scene.timerSound) {
          scene?.timerSound?.play();
        }
      }, 700);
    }
  }

  scene.maskRect = scene.add
    .rectangle(profile.x, profile.y, 212, 212, color)
    .setVisible(false);
  scene.mask = scene.maskRect.createGeometryMask();

  scene.progressBar.clear();
  scene.progressBar.fillStyle(color, 1);
  if (true) {
    scene.progressBar.slice(
      profile.x,
      profile.y,
      200,
      Phaser.Math.DegToRad(270),
      Phaser.Math.DegToRad(270 + 360 * scene.timerProgress),
      false
    );
  } else {
    scene.progressBar.slice(
      profile.x,
      profile.y,
      200,
      Phaser.Math.DegToRad(90),
      Phaser.Math.DegToRad(90 + 360 * scene.timerProgress),
      false
    );
  }

  scene.progressBar.setMask(scene.mask);
  scene.progressBar.fillPath();
};
