import { Scene } from "phaser";

import { AssetsHandler } from "../helpers/AssetsHandler";

export class Splash extends Scene {
  constructor() {
    super("Splash");

    this.ready = false;
  }

  preload() {
    this.socket = this.game.registry.get("socket");
    this.registry.set("socket", this.socket);
    this.load.setPath("/assets");
    this.load.image("logo", "logo.png");
    this.load.image("loader", "loader.png");

    this.load.image("background2", "waiting_background.png");
    this.load.image("search", "search.png");
    this.load.image("profile", "noprofile.png");
    this.load.image("searchText", "searching_text.png");

    AssetsHandler(this);
  }

  create() {
    //console.log(this.game);

    this.logo = this.add.image(540, 800, "logo");
    this.loader = this.add.image(540, 1100, "loader");
  }

  update() {
    if (this.ready) return;
    if (this.socket.connected) {
      // //console.log("socket connected");

      this.ready = true;
      setTimeout(() => {
        this.loader.setVisible(false);
        this.scene.start("GameWait");
      }, 200);
    } else {
      // //console.log("waiting for socket connection");
    }
    this.loader.angle += 5;
  }
}
