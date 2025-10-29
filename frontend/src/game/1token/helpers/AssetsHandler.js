export const AssetsHandler = (scene) => {
  scene.load.setPath("/assets");
  scene.load.image("background", "background.png?v=3");
  scene.load.image("black", "black.png?v=3");

  scene.load.image("board", "ludo_board.png?v=3");
  scene.load.image("control", "control_panel.png?v=3565");
  scene.load.image("control2", "control_panel2.png?v=32656");

  scene.load.image("bluePlayer", "blue_player.png?v=3");
  scene.load.image("greenPlayer", "green_player.png?v=3");
  scene.load.image("noprofile", "noprofile.png?v=3");
  scene.load.spritesheet("blueDiceAnim", "blue_dice_anim.png?v=3", {
    frameWidth: 115,
    frameHeight: 115,
  });
  scene.load.spritesheet("greenDiceAnim", "green_dice_anim.png?v=3", {
    frameWidth: 115,
    frameHeight: 115,
  });
  scene.load.image("prize", "prize.png?v=3");

  scene.load.spritesheet("blueDice", "blue_dice_idle.png?v=3", {
    frameWidth: 115,
    frameHeight: 115,
  });
  scene.load.spritesheet("greenDice", "green_dice_idle.png?v=3", {
    frameWidth: 115,
    frameHeight: 115,
  });

  scene.load.image("dice1", "dice1.png?v=3");
  scene.load.image("dice2", "dice2.png?v=3");
  scene.load.image("dice3", "dice3.png?v=3");
  scene.load.image("dice4", "dice4.png?v=3");
  scene.load.image("dice5", "dice5.png?v=3");
  scene.load.image("dice6", "dice6.png?v=3");

  scene.load.image("arrow", "arrow.png?v=3");
  scene.load.image("highlight", "highlighter.png?v=3");

  scene.load.image("blueSmoke", "blue_trail.png?v=3");
  scene.load.image("greenSmoke", "green_trail.png?v=3");

  scene.load.audio("diceSound", "dice.mp3?v=3");
  scene.load.audio("startSound", "game_started.mp3?v=3");
  scene.load.audio("inhomeSound", "inhome.mp3?v=3");
  scene.load.audio("killSound", "killed.mp3?v=3");
  scene.load.audio("moveSound", "move.mp3?v=3");
  scene.load.audio("safestepSound", "safestep.mp3?v=3");
  scene.load.audio("timerSound", "timer.mp3?v=3");
  scene.load.audio("clappingSound", "clapping.mp3?v=3");
  scene.load.audio("fireworksSound", "fireworks.mp3?v=3");

  scene.load.image("playerBorder", "playerborder.png?v=3");
  scene.load.image("ready", "ready.png?v=3");

  for (let i = 1; i <= 20; i++) {
    scene.load.image("avatar" + i, "avatars/avatar" + i + ".png?v=35");
  }

  scene.load.image("marker", "moveMarker.png?v=3");

  scene.load.spritesheet("bluefire", "bluefire.png?v=3", {
    frameWidth: 256,
    frameHeight: 256,
  });

  scene.load.spritesheet("greenfire", "greenfire.png?v=3", {
    frameWidth: 256,
    frameHeight: 256,
  });

  scene.load.image("timerplate", "timer.png?v=3");

  scene.load.image("lifeleft", "leftlife.png?v=3");
  scene.load.image("lifeused", "endlife.png?v=3");

  scene.load.image("finish", "finish.png?v=3");
  scene.load.image("particle", "particle.png?v=3");
  scene.load.image("play", "play.png?v=3");
  scene.load.image("back", "back.png?v=3");
  scene.load.image("exit", "exit.png?v=3");
  scene.load.image("warning", "warning.png?v=3");
  scene.load.image("yes", "yes.png?v=3");
  scene.load.image("cancel", "cancel.png?v=3");
};
