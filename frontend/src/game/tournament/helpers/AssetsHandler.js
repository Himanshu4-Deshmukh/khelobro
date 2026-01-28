export const AssetsHandler = (scene) => {
  scene.load.setPath("/assets/");
  scene.load.image("background", "background.png");
  scene.load.image("black", "black.png");

  scene.load.image("board", "ludo_board.png");
  scene.load.image("control", "control_panel.png");
  scene.load.image("control2", "control_panel2.png");

  scene.load.image("bluePlayer", "blue_player.png");
  scene.load.image("greenPlayer", "green_player.png");
  scene.load.image("redPlayer", "red_player.png");
  scene.load.image("yellowPlayer", "yellow_player.png");

  scene.load.image("noprofile", "noprofile.png");
  scene.load.spritesheet("blueDiceAnim", "blue_dice_anim.png", {
    frameWidth: 115,
    frameHeight: 115,
  });
  scene.load.spritesheet("greenDiceAnim", "green_dice_anim.png", {
    frameWidth: 115,
    frameHeight: 115,
  });

  scene.load.spritesheet("blueDice", "blue_dice_idle.png", {
    frameWidth: 115,
    frameHeight: 115,
  });
  scene.load.spritesheet("greenDice", "green_dice_idle.png", {
    frameWidth: 115,
    frameHeight: 115,
  });
  scene.load.image("ready", "ready.png");

  scene.load.image("dice1", "dice1.png");
  scene.load.image("prize", "prize.png");

  scene.load.image("dice2", "dice2.png");
  scene.load.image("dice3", "dice3.png");
  scene.load.image("dice4", "dice4.png");
  scene.load.image("dice5", "dice5.png");
  scene.load.image("dice6", "dice6.png");

  scene.load.image("arrow", "arrow.png");
  scene.load.image("highlight", "highlighter.png");

  scene.load.image("blueSmoke", "blue_trail.png");
  scene.load.image("greenSmoke", "green_trail.png");

  scene.load.audio("diceSound", "dice.mp3");
  scene.load.audio("startSound", "game_started.mp3");
  scene.load.audio("inhomeSound", "inhome.mp3");
  scene.load.audio("killSound", "killed.mp3");
  scene.load.audio("moveSound", "move.mp3");
  scene.load.audio("safestepSound", "safestep.mp3");
  scene.load.audio("timerSound", "timer.mp3");
  scene.load.audio("clappingSound", "clapping.mp3");
  scene.load.audio("fireworksSound", "fireworks.mp3");

  scene.load.image("playerBorder", "playerborder.png");

  for (let i = 1; i <= 20; i++) {
    scene.load.image("avatar" + i, "avatars/avatar" + i + ".png?v=4");
  }

  scene.load.image("marker", "moveMarker.png");

  scene.load.spritesheet("bluefire", "bluefire.png", {
    frameWidth: 256,
    frameHeight: 256,
  });

  scene.load.spritesheet("greenfire", "greenfire.png", {
    frameWidth: 256,
    frameHeight: 256,
  });

  // scene.load.image("crown", "crown.png");
  scene.load.image("lifeleft", "leftlife.png");
  scene.load.image("lifeused", "endlife.png");

  scene.load.image("finish", "finish.png");
  scene.load.image("finish3", "finish3.png");

  scene.load.image("particle", "particle.png");
  scene.load.image("play", "play.png");
  scene.load.image("back", "back.png");
  scene.load.image("timerplate", "timer.png");
  scene.load.image("safer", "safer.png");
  scene.load.image("score", "score.png");

  scene.load.image("exit", "exit.png");
  scene.load.image("warning", "warning.png");
  scene.load.image("yes", "yes.png");
  scene.load.image("cancel", "cancel.png");
};
