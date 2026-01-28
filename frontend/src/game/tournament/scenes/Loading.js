import { Scene } from "phaser";
import { AssetsHandler } from "../helpers/AssetsHandler";

export class Loading extends Scene {
  constructor() {
    super("LoadingScene");
  }

  preload() {
    this.load.setPath("/assets");
    // Add a background image or color
    this.add.rectangle(540, 960, 1080, 1920, 0x1d1d1d);

    // Add loading text
    let loadingText = this.add
      .text(540, 860, "Ludo Online v3.9", {
        fontSize: "50px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Create a loading bar
    let progressBar = this.add.graphics();
    let progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(50, 980, 980, 60);

    // Add percentage text
    let percentText = this.add
      .text(540, 1250, "0%", { fontSize: "100px", color: "#ffffff" })
      .setOrigin(0.5);

    // Load assets
    this.load.on("progress", (value) => {
      percentText.setText(parseInt(value * 100) + "%");
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(50, 980, 980 * value, 60);
    });

    // Handle complete
    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Example assets (replace with your actual assets)
    AssetsHandler(this);
  }

  create() {
    // Start the main game scene
    this.scene.start("Splash");
  }
}
