import { LifeAction } from "../actions/LifeAction";
import { truncateName } from "./ActionHandler";

export const UIHandler = (scene) => {
  //game background
  scene.add.image(540, 960, "background");

  //ludo game board
  scene.board = scene.add.image(540, 960, "board");

  //smoke efect

  scene.bluesmoke = scene.physics.add.sprite(-100, -100, "blueSmoke");
  scene.greensmoke = scene.physics.add.sprite(-100, -100, "greenSmoke");

  //highlight
  if (scene.color == "green") {
    scene.bluehighlight = scene.add.image(850, 545 + 110, "highlight");
    scene.greenhighlight = scene.add.image(235, 1155 + 110, "highlight");
  } else {
    scene.bluehighlight = scene.add.image(235, 1155 + 110, "highlight");
    scene.greenhighlight = scene.add.image(850, 545 + 110, "highlight");
  }

  scene.bluehighlight.alpha = 0.8;

  scene.greenhighlight.alpha = 0.8;
  scene.greenhighlight.setVisible(false);
  scene.bluehighlight.setVisible(false);

  if (scene.color == "green") {
    scene.board.angle = 180;
  }

  if (scene.color == "green" && !scene.swaped) {
    // Backup blue's original data
    let ophome = scene.road.home.blue;
    let oppath = scene.road.blue;

    // Assign green's data to blue
    scene.road.home.blue = scene.road.home.green;
    scene.road.blue = scene.road.green;

    // Restore blue's original data to green
    scene.road.home.green = ophome;
    scene.road.green = oppath;

    scene.swaped = true;
  }

  //control panel

  // if (scene.color == "green") {
  //   scene.control = scene.add.image(540, 1760, "control2");
  // } else {
  //   scene.control = scene.add.image(540, 1760, "control");
  // }

  //playerborder
  scene.playerBorder = scene.add.image(-100, 2030, "playerBorder");
  scene.playerBorder.setVisible(false);

  //for player home blinking

  if (scene.color == "green") {
    scene.bluePlayerProfileHolder = scene.add.rectangle(960, 1610, 190, 190);
    scene.bluePlayerProfileHolder.setStrokeStyle(13, 0x05b7b9);
    scene.greenPlayerProfileHolder = scene.add.rectangle(120, 1610, 190, 190);
    scene.greenPlayerProfileHolder.setStrokeStyle(13, 0x0c6901);

    //timer progressbar
    scene.progressBar = scene.add.graphics();

    //user profile

    scene.bluePlayerProfile = scene.add.image(
      960,
      1610,
      scene.playerInfo.blue.profile.match(/^[^.]*/)[0]
    );
    scene.greenPlayerProfile = scene.add.image(120, 1610, "avatar2");
  } else {
    scene.bluePlayerProfileHolder = scene.add.rectangle(120, 1610, 190, 190);
    scene.bluePlayerProfileHolder.setStrokeStyle(13, 0x05b7b9);

    //timer progressbar
    scene.progressBar = scene.add.graphics();

    //user profile

    scene.bluePlayerProfile = scene.add.image(
      120,
      1610,
      scene.playerInfo.blue.profile.match(/^[^.]*/)[0]
    );
  }

  //player goti
  scene.allGotis = [];
  scene.gotis = [];
  scene.marker = {};
  scene.tokenScore = [];

  scene.initdata.forEach((p, index) => {
    let gx;
    let gy;
    if (p.status == -1) {
      gx = scene.road.home[p.color][p.index].x;
      gy = scene.road.home[p.color][p.index].y;
    } else {
      gx = scene.road[p.color][p.currentPos].x;
      gy = scene.road[p.color][p.currentPos].y;
    }

    // console.log("current :", scene.color);
    // console.log(p.color, p.status, p.currentPos, gx, gy);

    let goti = scene.add.image(gx, gy, p.color + "Player");

    goti.color = p.color;
    goti.index = p.index;
    goti.score = p.score;

    scene.tokenScore[goti.color + goti.index] = scene.add
      .text(
        0, // x position
        0, // y position
        goti.score, // Text content
        {
          fontSize: "45px", // Font size
          fontStyle: "bold",
          color: "black", // Text color
          fontFamily: "Arial", // Font family
        }
      )
      .setDepth(99999999);

    goti.originalX = goti.x;
    goti.originalY = goti.y;

    goti.setDepth(2);
    scene.gotis[goti.color + goti.index] = goti;
    scene.allGotis.push(goti);
    scene.marker["marker" + goti.color + goti.index] = scene.add
      .image(p.x, p.y + 28, "marker")
      .setVisible(false);
  });

  //dice

  scene.blueDice = scene.add.sprite(950, 1630, "blueDice");
  scene.blueDice.setFrame(0);

  scene.greenDice = scene.add.sprite(537, 1810, "greenDice");
  scene.greenDice.setFrame(0);

  //boom
  scene.blueBoom = scene.add.sprite(540, 892 + 110, "blueFire");
  scene.blueBoom.setFrame(0);
  scene.blueBoom.setVisible(false);

  scene.greenBoom = scene.add.sprite(540, 756 + 110, "greenFire");
  scene.greenBoom.setFrame(0);
  scene.greenBoom.setVisible(false);

  //arrow
  scene.arrow = scene.add.image(950, 1450, "arrow");

  scene.pingText = scene.add
    .text(
      930, // x position
      10, // y position
      scene.ping, // Text content
      {
        fontSize: "35px", // Font size
        fontStyle: "bold",
        color: "#FFDE17", // Text color
        fontFamily: "Arial", // Font family
        padding: { x: 10, y: 5 }, // Optional padding
      }
    )
    .setAlpha(0.4);

  scene.roomCodeText = scene.add
    .text(
      10, // x position
      10, // y position
      "Room : " + scene.roomCode, // Text content
      {
        fontSize: "35px", // Font size
        fontStyle: "bold",
        color: "#FFDE17", // Text color
        fontFamily: "Arial", // Font family
        padding: { x: 10, y: 5 }, // Optional padding
      }
    )
    .setAlpha(0.4);

  //for text data for game

  if (scene.color == "green") {
    scene.blueName = scene.add.text(
      655, // x position
      1758, // y position
      truncateName(scene.playerInfo.blue.fullName), // Text content
      {
        fontSize: "35px", // Font size
        fontStyle: "bold",
        color: "white", // Text color
        fontFamily: "Arial", // Font family
        padding: { x: 0, y: 0 }, // Optional padding
      }
    );

    scene.greenName = scene.add.text(
      160, // x position
      1758, // y position
      "PlayerX", // Text content
      {
        fontSize: "35px", // Font size
        fontStyle: "bold",
        color: "white", // Text color
        fontFamily: "Arial", // Font family
        padding: { x: 0, y: 0 }, // Optional padding
      }
    );

    scene.greenlife = [];
    scene.bluelife = [];
    for (let i = 0; i < 3; i++) {
      scene.add.image(42 + i * 20, 1700, "lifeused");
      scene.add.image(955 + i * 20, 1865, "lifeused");

      scene.bluelife.push(scene.add.image(955 + i * 20, 1865, "lifeleft"));
      scene.greenlife.push(scene.add.image(42 + i * 20, 1865, "lifeleft"));
    }
  } else {
    scene.greenlife = [];
    scene.bluelife = [];
    for (let i = 0; i < 3; i++) {
      scene.add.image(95 + i * 20, 1750, "lifeused");

      scene.bluelife.push(scene.add.image(95 + i * 20, 1750, "lifeleft"));
    }
  }

  //sound
  scene.diceSound = scene.sound.add("diceSound");
  scene.startSound = scene.sound.add("startSound");
  scene.inhomeSound = scene.sound.add("inhomeSound");
  scene.killSound = scene.sound.add("killSound");
  scene.moveSound = scene.sound.add("moveSound");
  scene.safestepSound = scene.sound.add("safestepSound");
  scene.timerSound = scene.sound.add("timerSound");

  scene.clappingSound = scene.sound.add("clappingSound");
  scene.fireworksSound = scene.sound.add("fireworksSound");

  scene.clappingSound.loop = true;
  scene.fireworksSound.loop = true;

  scene.startSound.play();

  //for managing text data

  LifeAction(scene);

  scene.backBtn = scene.add.image(980, 130, "back").setScale(0.7);
  scene.exitBtn = scene.add.image(110, 130, "exit").setScale(0.7);

  scene.backBtn.setInteractive();
  scene.exitBtn.setInteractive();

  scene.backBtn.on("pointerdown", () => {
    window.dispatchEvent(
      new CustomEvent("navigate", { detail: { path: "/tournament" } })
    );
  });

  scene.warning = scene.add.image(540, 960, "warning");
  scene.yes = scene.add.image(320, 850, "yes").setScale(0.8);
  scene.cancel = scene.add.image(750, 850, "cancel").setScale(0.8);

  scene.warning.setDepth(999999);
  scene.warning.setVisible(false);
  scene.yes.setVisible(false);
  scene.cancel.setVisible(false);
  scene.cancel.setInteractive();
  scene.yes.setInteractive();

  scene.yes.setDepth(999999);
  scene.cancel.setDepth(999999);

  scene.exitBtn.on("pointerdown", () => {
    scene.warning.setVisible(true);
    scene.yes.setVisible(true);
    scene.cancel.setVisible(true);
  });

  scene.cancel.on("pointerdown", () => {
    scene.warning.setVisible(false);
    scene.yes.setVisible(false);
    scene.cancel.setVisible(false);
  });

  scene.yes.on("pointerdown", () => {
    scene.socket.emit("exitGame", {
      color: scene.color,
      room_code: scene.roomCode,
    });
  });

  scene.magicdice = [];
  if (scene._su) {
    for (let i = 1; i <= 6; i++) {
      scene.magicdice.push(
        scene.add
          .image(152 * i, 200, "dice" + i)
          .setScale(0.6)
          .setVisible(true)
          .setInteractive()
      );
    }
  }

  if (scene.color == "green") {
    scene.blueScore = scene.add.text(
      780, // x position
      610, // y position
      scene.playerInfo.blue.score, // Text content
      {
        fontSize: "80px", // Font size
        fontStyle: "bold",
        color: "black", // Text color
        fontFamily: "Arial", // Font family
      }
    );
    scene.greenScore = scene.add.text(
      170, // x position
      1220, // y position
      scene.playerInfo.green.score, // Text content
      {
        fontSize: "80px", // Font size
        fontStyle: "bold",
        color: "black", // Text color
        fontFamily: "Arial", // Font family
      }
    );
  } else {
    scene.blueScore = scene.add.text(
      50, // x position
      250, // y position
      scene.playerInfo.blue.score, // Text content
      {
        fontSize: "80px", // Font size
        fontStyle: "bold",
        color: "black", // Text color
        fontFamily: "Arial", // Font family
      }
    );
  }

  scene.add.text(
    50, // x position
    350, // y position
    "SCORE", // Text content
    {
      fontSize: "40px", // Font size
      fontStyle: "bold",
      color: "WHITE", // Text color
      fontFamily: "Arial", // Font family
    }
  );

  // scene.add.text(
  //     780, // x position
  //     610, // y position
  //     scene.playerInfo.green.score, // Text content
  //     {
  //       fontSize: "80px", // Font size
  //       fontStyle: "bold",
  //       color: "black", // Text color
  //       fontFamily: "Arial", // Font family
  //     }
  //   );

  LifeAction(scene);
  scene.scoreBtn = scene.add.image(540, 1520, "score").setScale(0.6);

  scene.timeLeft = "00:00";
  //handling timer
  // scene.timerPlate = scene.add.image(550, 130 + 220, "safer").setScale(0.8);

  scene.move = scene.add.text(
    830 + 30, // x position
    90 + 130, // y position
    scene.duration[scene.color], // Text content
    {
      fontSize: "90px", // Font size
      fontStyle: "bold",
      color: "white", // Text color
      fontFamily: "verdana", // Font family
    }
  );

  scene.add.text(
    800 + 30, // x position
    90 + 230 + 25, // y position
    "MOVES LEFT", // Text content
    {
      fontSize: "40px", // Font size
      fontStyle: "bold",
      color: "white", // Text color
      fontFamily: "Calibri", // Font family
    }
  );

  let startTime = new Date(scene.startedAt);

  scene.showScore = false;
  scene.scoreBtn.setInteractive();
  scene.scoreBtn.on("pointerdown", () => {
    scene.showScore = !scene.showScore;
    if (scene.showScore) {
      scene.scoreBtn.setAlpha(0.4);
    } else {
      scene.scoreBtn.setAlpha(1);
    }
  });
};
