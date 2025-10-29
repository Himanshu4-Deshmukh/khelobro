import { Scene } from "phaser";

import { GetData } from "../helpers/GetData";
import { RandomNumber } from "../actions/RandomNumber";
import { UpdateGreen } from "../helpers/UpdateGreen";
import { ReadyOption } from "../helpers/ReadyOption";

export class TwoPlayerWaiting extends Scene {
  radius = 25; // Radius of the circular path
  angle = 0; // Starting angle
  centerX = 250; // Center of the circular path
  centerY = 1570; // Center of the circular path
  images = [];

  constructor() {
    super("GameWait");
  }

  preload() {
    this.socket = this.registry.get("socket");
    GetData(this);
    this.load.setPath("/assets");
    this.load.image("background2", "waiting_background.png");
    this.load.image("search", "search.png");
    this.load.image("profile", "noprofile.png");
    this.load.image("searchText", "searching_text.png");

    for (let i = 1; i <= 20; i++) {
      this.load.image("avatar" + i, "avatars/avatar" + i + ".png?v=6");
      this.images.push("avatar" + i);
    }
  }

  create() {
    //game background
    this.add.image(540, 1100, "background2");

    //search animation
    this.search = this.add.image(250, 1600, "search").setScale(0.65);

    this.bluePic = this.add.image(311, 1066, "profile").setScale(1.1);
    this.greenPic = this.add.image(772, 1066, "profile").setScale(1.1);

    this.greenName = this.add.text(
      650, // x position
      1190, // y position
      "......", // Text content
      {
        fontSize: "30px", // Font size
        fontStyle: "bold",
        color: "#FFDE17", // Text color
        fontFamily: "Arial", // Font family
        padding: { x: 10, y: 10 }, // Optional padding
      }
    );

    this.searchText = this.add.image(540, 1560, "searchText");

    this.spinAnimRef = setInterval(() => {
      this.greenPic.setTexture("avatar" + RandomNumber(1, 20));
    }, 100);

    UpdateGreen(this);
  }

  update() {
    // Increment the angle
    this.angle += 0.05;

    // Calculate new x and y based on the angle
    this.search.x = this.centerX + this.radius * Math.cos(this.angle);
    this.search.y = this.centerY + this.radius * Math.sin(this.angle);

    // Loop the angle back to prevent overflow
    if (this.angle >= 2 * Math.PI) {
      this.angle = 0;
    }
  }
}
