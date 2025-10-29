import { truncateName } from "../helpers/ActionHandler";
import { ReadyOption } from "../helpers/ReadyOption";

export const DrawAction = (scene) => {
  scene.bluePic = scene.add
    .image(311, 1066, scene.playerInfo.blue.profile.match(/^[^.]*/)[0])
    .setScale(1.1);

  scene.modeText = scene.add.text(
    30, // x position
    10, // y position
    scene.mode, // Text content
    {
      fontSize: "40px", // Font size
      fontStyle: "bold",
      color: "#FFDE17", // Text color
      fontFamily: "Arial", // Font family
      padding: { x: 320, y: 820 }, // Optional padding
    }
  );

  scene.blueName = scene.add.text(
    190, // x position
    1190, // y position
    truncateName(scene.playerInfo.blue.fullName), // Text content
    //   "sss",
    {
      fontSize: "30px", // Font size
      fontStyle: "bold",
      color: "#FFDE17", // Text color
      fontFamily: "Arial", // Font family
      padding: { x: 10, y: 10 }, // Optional padding
    }
  );

  if (scene.playerInfo.green.userId) {
    scene.search.setVisible(false);
    scene.searchText.setVisible(false);
    scene.greenName.setText(truncateName(scene.playerInfo.green.fullName));
    clearInterval(scene.spinAnimRef);
    scene.greenPic.setVisible(false);
    scene.greenPic = scene.add
      .sprite(772, 1066, scene.playerInfo.green.profile.match(/^[^.]*/)[0])
      .setScale(1.1);

    scene.readyBtn = scene.add.sprite(550, 1500, "ready").setScale(0.8);
    scene.waitingText = scene.add.text(
      210, // x position
      1480, // y position
      "waiting for opponnent to ready...", // Text content
      {
        fontSize: "45px", // Font size
        fontStyle: "bold",
        color: "#FFDE17", // Text color
        fontFamily: "Arial", // Font family
      }
    );

    scene.waitingText.setVisible(false);

    scene.readyBtn.setInteractive();
    scene.readyBtn.on("pointerdown", () => {
      scene.socket.emit("ready", {
        color: scene.color,
        room_code: scene.roomCode,
      });

      scene.readyBtn.setVisible(false);
      scene.waitingText.setVisible(true);
    });

    if (scene.color == "green") {
      scene.readyBtn.setVisible(false);
      scene.waitingText.setVisible(true);
    }

    ReadyOption(scene);
  }

  scene.amountText = scene.add.text(
    30, // x position
    10, // y position
    scene.amount, // Text content
    {
      fontSize: "40px", // Font size
      fontStyle: "bold",
      color: "#FFDE17", // Text color
      fontFamily: "Arial", // Font family
      padding: { x: 550, y: 820 }, // Optional padding
    }
  );
};
