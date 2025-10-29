export const AnimationHandler = (scene) => {
  //dice animations
  scene.anims.create({
    key: "blueDiceJump",
    frames: scene.anims.generateFrameNumbers("blueDiceAnim", {
      frames: [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0],
    }),
    frameRate: 60,
    repeat: 1,
  });

  scene.anims.create({
    key: "blue6",
    frames: scene.anims.generateFrameNumbers("blueDice", {
      frames: [5],
    }),
    frameRate: 24,
    repeat: 0,
  });

  scene.anims.create({
    key: "blue5",
    frames: scene.anims.generateFrameNumbers("blueDice", {
      frames: [4],
    }),
    frameRate: 24,
    repeat: 0,
  });

  scene.anims.create({
    key: "blue4",
    frames: scene.anims.generateFrameNumbers("blueDice", {
      frames: [3],
    }),
    frameRate: 24,
    repeat: 0,
  });

  scene.anims.create({
    key: "blue3",
    frames: scene.anims.generateFrameNumbers("blueDice", {
      frames: [2],
    }),
    frameRate: 24,
    repeat: 0,
  });

  scene.anims.create({
    key: "blue2",
    frames: scene.anims.generateFrameNumbers("blueDice", {
      frames: [1],
    }),
    frameRate: 24,
    repeat: 0,
  });

  scene.anims.create({
    key: "blue1",
    frames: scene.anims.generateFrameNumbers("blueDice", {
      frames: [0],
    }),
    frameRate: 24,
    repeat: 0,
  });

  scene.anims.create({
    key: "greenDiceJump",
    frames: scene.anims.generateFrameNumbers("greenDiceAnim", {
      frames: [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0],
    }),
    frameRate: 24,
    repeat: 1,
  });

  scene.anims.create({
    key: "green6",
    frames: scene.anims.generateFrameNumbers("greenDice", {
      frames: [5],
    }),
    frameRate: 24,
    repeat: 0,
  });

  scene.anims.create({
    key: "green5",
    frames: scene.anims.generateFrameNumbers("greenDice", {
      frames: [4],
    }),
    frameRate: 24,
    repeat: 0,
  });

  scene.anims.create({
    key: "green4",
    frames: scene.anims.generateFrameNumbers("greenDice", {
      frames: [3],
    }),
    frameRate: 24,
    repeat: 0,
  });

  scene.anims.create({
    key: "green3",
    frames: scene.anims.generateFrameNumbers("greenDice", {
      frames: [2],
    }),
    frameRate: 24,
    repeat: 0,
  });

  scene.anims.create({
    key: "green2",
    frames: scene.anims.generateFrameNumbers("greenDice", {
      frames: [1],
    }),
    frameRate: 24,
    repeat: 0,
  });

  scene.anims.create({
    key: "green1",
    frames: scene.anims.generateFrameNumbers("greenDice", {
      frames: [0],
    }),
    frameRate: 24,
    repeat: 0,
  });

  scene.anims.create({
    key: "blueBoom",
    frames: scene.anims.generateFrameNumbers("bluefire", {
      frames: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
      ],
    }),
    frameRate: 50,
    repeat: 0,
  });

  scene.anims.create({
    key: "greenBoom",
    frames: scene.anims.generateFrameNumbers("greenfire", {
      frames: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
      ],
    }),
    frameRate: 50,
    repeat: 0,
  });
};
