export const AdjustCamera = (scene) => {
  scene.physics.world.setBounds(0, 280, 1080, 1920);

  scene.cameras.main.setBounds(0, 280, 1080, 1920);
  scene.cameras.main.setPosition(0, 280);
};
