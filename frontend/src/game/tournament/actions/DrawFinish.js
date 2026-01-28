import { truncateName } from "../helpers/ActionHandler";
import { SkyShotAction } from "./SkyShotAction";

export const DrawFinish = (scene, winner, looser) => {
  // SkyShotAction(scene);

  if (winner && looser) {
    scene.clappingSound.play();
    scene.fireworksSound.play();

    if (scene.color == "blue" || true) {
      scene.add.image(540, 960, "black").setDepth(999999999);
      scene.add.image(540, 1470, "finish").setDepth(999999999);

      scene.playbtn = scene.add
        .image(540, 1830, "play")
        .setScale(0.8)
        .setDepth(999999999);
      scene.playbtn.setInteractive();
      scene.playbtn.on("pointerdown", () => {
        window.dispatchEvent(
          new CustomEvent("navigate", { detail: { path: "/tournament" } })
        );
      });

      scene.winner = scene.add
        .text(
          280, // x position
          1520, // y position
          truncateName(scene.playerInfo[winner].fullName) + " (" + winner + ")", // Text content
          {
            fontSize: "45px", // Font size
            fontStyle: "bold",
            color: "white", // Text color
            fontFamily: "Arial", // Font family
            padding: { x: 0, y: 0 }, // Optional padding
          }
        )
        .setDepth(999999999);

      scene.winner.setShadow(1, 1, "#000000", 10, true, true);
    } else {
      scene.add.image(540, 960, "black").setDepth(13);
      scene.add.image(540, 450, "finish").setDepth(14).setAngle(180);

      scene.playbtn = scene.add
        .image(540, 90, "play")
        .setScale(0.8)
        .setDepth(15)
        .setAngle(180);
      scene.playbtn.setInteractive();
      scene.playbtn.on("pointerdown", () => {
        window.dispatchEvent(
          new CustomEvent("navigate", { detail: { path: "/speedludo" } })
        );
      });

      scene.winner = scene.add
        .text(
          800, // x position
          400, // y position
          truncateName(scene.playerInfo[winner].fullName) + " (" + winner + ")", // Text content
          {
            fontSize: "45px", // Font size
            fontStyle: "bold",
            color: "white", // Text color
            fontFamily: "Arial", // Font family
            padding: { x: 0, y: 0 }, // Optional padding
          }
        )
        .setDepth(15)
        .setAngle(180);

      scene.winner.setShadow(1, 1, "#000000", 10, true, true);

      scene.looser = scene.add
        .text(
          800, // x position
          270, // y position
          truncateName(scene.playerInfo[looser].fullName) + " (" + looser + ")", // Text content
          {
            fontSize: "45px", // Font size
            fontStyle: "bold",
            color: "white", // Text color
            fontFamily: "Arial", // Font family
            padding: { x: 0, y: 0 }, // Optional padding
          }
        )
        .setDepth(15)
        .setAngle(180);

      scene.looser.setShadow(1, 1, "#000000", 10, true, true);
    }
  } else {
    if (scene.color == "blue") {
      scene.add.image(540, 960, "black").setDepth(999999999);
      scene.add.image(540, 1470, "finish3").setDepth(999999999);

      scene.playbtn = scene.add
        .image(540, 1830, "play")
        .setScale(0.8)
        .setDepth(999999999);
      scene.playbtn.setInteractive();
      scene.playbtn.on("pointerdown", () => {
        window.dispatchEvent(
          new CustomEvent("navigate", { detail: { path: "/tournament" } })
        );
      });

      scene.winner = scene.add
        .text(
          280, // x position
          1520, // y position
          truncateName(scene.playerInfo.blue.fullName), // Text content
          {
            fontSize: "45px", // Font size
            fontStyle: "bold",
            color: "white", // Text color
            fontFamily: "Arial", // Font family
            padding: { x: 0, y: 0 }, // Optional padding
          }
        )
        .setDepth(999999999);

      scene.winner.setShadow(1, 1, "#000000", 10, true, true);
    } else {
      scene.add.image(540, 960, "black").setDepth(999999999);
      scene.add.image(540, 450, "finish3").setDepth(999999999).setAngle(180);

      scene.playbtn = scene.add
        .image(540, 90, "play")
        .setScale(0.8)
        .setDepth(999999999)
        .setAngle(180);
      scene.playbtn.setInteractive();
      scene.playbtn.on("pointerdown", () => {
        window.dispatchEvent(
          new CustomEvent("navigate", { detail: { path: "/tournament" } })
        );
      });

      scene.winner = scene.add
        .text(
          800, // x position
          400, // y position
          truncateName(scene.playerInfo.blue.fullName), // Text content
          {
            fontSize: "45px", // Font size
            fontStyle: "bold",
            color: "white", // Text color
            fontFamily: "Arial", // Font family
            padding: { x: 0, y: 0 }, // Optional padding
          }
        )
        .setDepth(15)
        .setAngle(180);

      scene.winner.setShadow(1, 1, "#000000", 10, true, true);
    }
  }

  localStorage.removeItem("room_code");
  localStorage.removeItem("color");
  localStorage.removeItem("gameUid");
  clearInterval(scene.clockTimerRef);

  scene.gameStatus = 2;
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent("navigate", { detail: { path: "/tournament" } })
    );
  }, 5000);
};
