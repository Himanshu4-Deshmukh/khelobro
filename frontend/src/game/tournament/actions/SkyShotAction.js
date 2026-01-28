import { RandomNumber } from "./RandomNumber";

export const SkyShotAction = (scene) => {
  let colors = [0x0000ff, 0x00ff00, 0xff0000, 0xffff00, 0xff69b4];

  scene.particles = scene.add.particles(-200, -200, "particle", {
    speed: { min: 50, max: 250 }, // Speed range
    angle: { min: 0, max: 360 }, // Spread particles in all directions
    scale: { start: 0.2, end: 0 }, // Particles shrink over time
    alpha: { start: 0.4, end: 0 }, // Fade out
    lifespan: 1000, // Each particle lasts 1 second
    blendMode: "ADD", // Additive blending for a glowing effect
    gravityY: 300, // Optional: Gravity effect for downward pull
    tint: colors, // Multiple colors for particles
  });

  setInterval(() => {
    launchFirework(scene);
  }, 300);
};

const launchFirework = (scene) => {
  // Create a particle emitter

  scene.particles.emitParticleAt(
    RandomNumber(50, 1070),
    RandomNumber(50, 1500),
    600
  );
};
