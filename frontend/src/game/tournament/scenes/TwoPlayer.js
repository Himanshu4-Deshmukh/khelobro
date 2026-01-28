import { Scene } from "phaser";

import { AssetsHandler } from "../helpers/AssetsHandler";
import { UIHandler } from "../helpers/UIHandler";
import { AnimationHandler } from "../helpers/AnimationHandler";
import { ActionHandler } from "../helpers/ActionHandler";
import { Init } from "../helpers/Init";
import { GetData } from "../helpers/GetData";
import { PingAction } from "../actions/PingAction";
import { AdjustGotisAction } from "../actions/AdjustGotisAction";

import { LifeAction } from "../actions/LifeAction";
import { DrawFinish } from "../actions/DrawFinish";

export class TwoPlayer extends Scene {
  swaped = false;
  currentDice;
  currentColor;
  road = {
    home: {
      blue: [
        { x: 167, y: 1170 },
        { x: 303, y: 1170 },
        { x: 167, y: 1305 },
        { x: 303, y: 1305 },
      ],
      red: [
        { x: 167, y: 560 },
        { x: 303, y: 560 },
        { x: 167, y: 693 },
        { x: 303, y: 693 },
      ],
      yellow: [
        { x: 780, y: 1170 },
        { x: 917, y: 1170 },
        { x: 780, y: 1305 },
        { x: 917, y: 1305 },
      ],
      green: [
        { x: 780, y: 560 },
        { x: 917, y: 560 },
        { x: 780, y: 693 },
        { x: 917, y: 693 },
      ],
    },

    safe: [
      { x: 472, y: 1338 },
      { x: 608, y: 526 },
      { x: 200, y: 998 },
      { x: 132, y: 862 },
      { x: 472, y: 594 },
      { x: 880, y: 866 },
      { x: 948, y: 1002 },
      { x: 608, y: 1274 },
    ],
    blue: [
      { x: 472, y: 1338 },
      { x: 472, y: 1270 },
      { x: 472, y: 1202 },
      { x: 472, y: 1134 },
      { x: 472, y: 1066 },
      { x: 404, y: 998 },
      { x: 336, y: 998 },
      { x: 268, y: 998 },
      { x: 200, y: 998 },
      { x: 132, y: 998 },
      { x: 64, y: 998 },
      { x: 64, y: 930 },
      { x: 64, y: 862 },
      { x: 132, y: 862 },
      { x: 200, y: 862 },
      { x: 268, y: 862 },
      { x: 336, y: 862 },
      { x: 404, y: 862 },
      { x: 472, y: 794 },
      { x: 472, y: 730 },
      { x: 472, y: 662 },
      { x: 472, y: 594 },
      { x: 472, y: 526 },
      { x: 472, y: 458 },
      { x: 540, y: 458 },
      { x: 608, y: 458 },
      { x: 608, y: 526 },
      { x: 608, y: 594 },
      { x: 608, y: 662 },
      { x: 608, y: 730 },
      { x: 608, y: 798 },
      { x: 676, y: 866 },
      { x: 744, y: 866 },
      { x: 812, y: 866 },
      { x: 880, y: 866 },
      { x: 948, y: 866 },
      { x: 1016, y: 866 },
      { x: 1016, y: 934 },
      { x: 1016, y: 1002 },
      { x: 948, y: 1002 },
      { x: 880, y: 1002 },
      { x: 812, y: 1002 },
      { x: 744, y: 1002 },
      { x: 676, y: 1002 },
      { x: 608, y: 1070 },
      { x: 608, y: 1138 },
      { x: 608, y: 1206 },
      { x: 608, y: 1274 },
      { x: 608, y: 1342 },
      { x: 608, y: 1410 },
      { x: 540, y: 1410 },
      { x: 540, y: 1342 },
      { x: 540, y: 1274 },
      { x: 540, y: 1206 },
      { x: 540, y: 1138 },
      { x: 540, y: 1070 },
      { x: 540, y: 1002 },
    ],
    green: [
      { x: 608, y: 526 },
      { x: 608, y: 594 },
      { x: 608, y: 662 },
      { x: 608, y: 730 },
      { x: 608, y: 798 },
      { x: 676, y: 866 },
      { x: 744, y: 866 },
      { x: 812, y: 866 },
      { x: 880, y: 866 },
      { x: 948, y: 866 },
      { x: 1016, y: 866 },
      { x: 1016, y: 934 },
      { x: 1016, y: 1002 },
      { x: 948, y: 1002 },
      { x: 880, y: 1002 },
      { x: 812, y: 1002 },
      { x: 744, y: 1002 },
      { x: 676, y: 1002 },
      { x: 608, y: 1070 },
      { x: 608, y: 1138 },
      { x: 608, y: 1206 },
      { x: 608, y: 1274 },
      { x: 608, y: 1342 },
      { x: 608, y: 1410 },
      { x: 540, y: 1410 },
      { x: 472, y: 1410 },
      { x: 472, y: 1338 },
      { x: 472, y: 1270 },
      { x: 472, y: 1202 },
      { x: 472, y: 1134 },
      { x: 472, y: 1066 },
      { x: 404, y: 998 },
      { x: 336, y: 998 },
      { x: 268, y: 998 },
      { x: 200, y: 998 },
      { x: 132, y: 998 },
      { x: 64, y: 998 },
      { x: 64, y: 930 },
      { x: 64, y: 862 },
      { x: 132, y: 862 },
      { x: 200, y: 862 },
      { x: 268, y: 862 },
      { x: 336, y: 862 },
      { x: 404, y: 862 },
      { x: 472, y: 794 },
      { x: 472, y: 730 },
      { x: 472, y: 662 },
      { x: 472, y: 594 },
      { x: 472, y: 526 },
      { x: 472, y: 458 },
      { x: 540, y: 458 },
      { x: 540, y: 526 },
      { x: 540, y: 594 },
      { x: 540, y: 662 },
      { x: 540, y: 730 },
      { x: 540, y: 798 },
      { x: 540, y: 866 },
    ],
    red: [
      { x: 132, y: 862 },
      { x: 200, y: 862 },
      { x: 268, y: 862 },
      { x: 336, y: 862 },
      { x: 404, y: 862 },
      { x: 472, y: 794 },
      { x: 472, y: 730 },
      { x: 472, y: 662 },
      { x: 472, y: 594 },
      { x: 472, y: 526 },
      { x: 472, y: 458 },
      { x: 540, y: 458 },
      { x: 608, y: 458 },
      { x: 608, y: 526 },
      { x: 608, y: 594 },
      { x: 608, y: 662 },
      { x: 608, y: 730 },
      { x: 608, y: 798 },
      { x: 676, y: 866 },
      { x: 744, y: 866 },
      { x: 812, y: 866 },
      { x: 880, y: 866 },
      { x: 948, y: 866 },
      { x: 1016, y: 866 },
      { x: 1016, y: 934 },
      { x: 1016, y: 1002 },
      { x: 948, y: 1002 },
      { x: 880, y: 1002 },
      { x: 812, y: 1002 },
      { x: 744, y: 1002 },
      { x: 676, y: 1002 },
      { x: 608, y: 1070 },
      { x: 608, y: 1138 },
      { x: 608, y: 1206 },
      { x: 608, y: 1274 },
      { x: 608, y: 1342 },
      { x: 608, y: 1410 },
      { x: 540, y: 1410 },
      { x: 472, y: 1410 },
      { x: 472, y: 1338 },
      { x: 472, y: 1270 },
      { x: 472, y: 1202 },
      { x: 472, y: 1134 },
      { x: 472, y: 1066 },
      { x: 404, y: 998 },
      { x: 336, y: 998 },
      { x: 268, y: 998 },
      { x: 200, y: 998 },
      { x: 132, y: 998 },
      { x: 64, y: 998 },
      { x: 64, y: 930 },
    ],
    yellow: [
      { x: 948, y: 1002 },
      { x: 880, y: 1002 },
      { x: 812, y: 1002 },
      { x: 744, y: 1002 },
      { x: 676, y: 1002 },
      { x: 608, y: 1070 },
      { x: 608, y: 1138 },
      { x: 608, y: 1206 },
      { x: 608, y: 1274 },
      { x: 608, y: 1342 },
      { x: 608, y: 1410 },
      { x: 540, y: 1410 },
      { x: 472, y: 1410 },
      { x: 472, y: 1338 },
      { x: 472, y: 1270 },
      { x: 472, y: 1202 },
      { x: 472, y: 1134 },
      { x: 472, y: 1066 },
      { x: 404, y: 998 },
      { x: 336, y: 998 },
      { x: 268, y: 998 },
      { x: 200, y: 998 },
      { x: 132, y: 998 },
      { x: 64, y: 998 },
      { x: 64, y: 930 },
      { x: 64, y: 862 },
      { x: 132, y: 862 },
      { x: 200, y: 862 },
      { x: 268, y: 862 },
      { x: 336, y: 862 },
      { x: 404, y: 862 },
      { x: 472, y: 794 },
      { x: 472, y: 730 },
      { x: 472, y: 662 },
      { x: 472, y: 594 },
      { x: 472, y: 526 },
      { x: 472, y: 458 },
      { x: 540, y: 458 },
      { x: 608, y: 458 },
      { x: 608, y: 526 },
      { x: 608, y: 594 },
      { x: 608, y: 662 },
      { x: 608, y: 730 },
      { x: 608, y: 798 },
      { x: 676, y: 866 },
      { x: 744, y: 866 },
      { x: 812, y: 866 },
      { x: 880, y: 866 },
      { x: 948, y: 866 },
      { x: 1016, y: 866 },
      { x: 1016, y: 934 },
    ],
  };

  moves = [];
  constructor() {
    super("Game");
  }

  preload() {
    this.socket = this.registry.get("socket");
    this.ping = "0ms";
    this.roomCode = this.registry.get("roomCode");
    this.initdata = this.registry.get("initdata");
    this.currentColor = this.registry.get("currentColor");
    this.diceValue = this.registry.get("diceValue");
    this.roomCode = this.registry.get("roomCode");
    this.userId = this.registry.get("userId");
    this.playerInfo = this.registry.get("playerInfo");
    this.color = this.registry.get("color");
    this.gameStatus = this.registry.get("gameStatus");
    this.amount = this.registry.get("amount");
    this.mode = this.registry.get("mode");
    this.safe = this.registry.get("safe");
    this.duration = this.registry.get("duration");
    this.startedAt = this.registry.get("startedAt");
    this.dones = this.registry.get("dones");
    this.deads = this.registry.get("deads");
    this._su = this.registry.get("_su");
    this.prize = this.registry.get("prize");

    // this._su = true;

    AssetsHandler(this);
  }

  create() {
    UIHandler(this);
    Init(this);
    AnimationHandler(this);
    ActionHandler(this);

    // this.road.home.red.forEach((pos, index) => {
    //   this.add.image(pos.x, pos.y, "yellowPlayer");
    // });
    // AdjustGotisAction(this);
  }

  update() {
    // if (this.playerIsMoving == false) {
    //   AdjustGotisAction(this);
    // }
    // this.markers.forEach((marker) => {
    //   marker.angle += 1;
    // });

    this.allGotis.forEach((goti) => {
      this.tokenScore[goti.color + goti.index].setText(goti.score);

      if (this.color == "blue" || true) {
        this.tokenScore[goti.color + goti.index].x = goti.x - 30;
        this.tokenScore[goti.color + goti.index].y = goti.y - 100;
      } else {
        this.tokenScore[goti.color + goti.index].x = goti.x + 30;
        this.tokenScore[goti.color + goti.index].y = goti.y + 100;
      }

      this.tokenScore[goti.color + goti.index].setDepth(goti.depth);
      this.tokenScore[goti.color + goti.index].setVisible(this.showScore);
    });
    const speed = 3.5;
    for (let i = 0; i < 4; i++) {
      this.marker["markerblue" + i].angle += speed;
      this.marker["markergreen" + i].angle += speed;
    }
  }
}
