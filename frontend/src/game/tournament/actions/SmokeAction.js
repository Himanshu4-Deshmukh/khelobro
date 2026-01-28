export const SmokeAction = (scene, color, x, y) => {
  scene.smoke = scene.add.particles(0, 0, color + "Smoke", {
    lifespan: 170,
    speed: 0,
    scale: { start: 1, end: 2.7 },
    alpha: { start: 1, end: 0 },
    emitting: false,
    duration: 170,
  });

  scene.smoke.emitParticleAt(x, y, 1);
  scene.smoke.setDepth(1);
  scene.smoke.once("complete", () => {
    scene.smoke.destroy();
  });
};
