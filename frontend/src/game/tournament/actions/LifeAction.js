export const LifeAction = (scene) => {
  scene.bluelife.forEach((life, i) => {
    life.setVisible(false);

    if (i + 1 - scene.playerInfo.blue.life < 1) {
      life.setVisible(true);
    } else {
      life.setVisible(false);
    }
  });

  scene.greenlife.forEach((life, i) => {
    life.setVisible(false);

    if (i + 1 - scene.playerInfo.green.life < 1) {
      life.setVisible(true);
    } else {
      life.setVisible(false);
    }
  });
};
