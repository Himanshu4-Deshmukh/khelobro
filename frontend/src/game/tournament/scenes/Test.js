import { Scene } from "phaser";
import socketManager from "../helpers/socketManager";
import { RandomNumber } from "../actions/RandomNumber";
import { SkyShotAction } from "../actions/SkyShotAction";

export class Test extends Scene {
  constructor() {
    super("Test");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("finish", "finish.png");
    this.load.image("particle", "particle.png");
    this.load.image("play", "play.png");
  }

  create() {}

  update() {}
}
