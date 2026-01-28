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

export class SpeedGame extends Scene {
  currentDice;
  currentColor;
  road = {
    home: {
      blue: [
        { x: 167, y: 1060 },
        { x: 303, y: 1060 },
        { x: 167, y: 1195 },
        { x: 303, y: 1195 },
      ],
      green: [
        { x: 780, y: 450 },
        { x: 917, y: 450 },
        { x: 780, y: 583 },
        { x: 917, y: 583 },
      ],
    },
    safe: [
      { x: 472, y: 1228 },
      { x: 608, y: 416 },
      { x: 200, y: 888 },
      { x: 132, y: 752 },
      { x: 472, y: 484 },
      { x: 880, y: 756 },
      { x: 948, y: 892 },
      { x: 608, y: 1164 },
    ],
    blue: [
      { x: 472, y: 1228 },
      { x: 472, y: 1160 },
      { x: 472, y: 1092 },
      { x: 472, y: 1024 },
      { x: 472, y: 956 },
      { x: 404, y: 888 },
      { x: 336, y: 888 },
      { x: 268, y: 888 },
      { x: 200, y: 888 },
      { x: 132, y: 888 },
      { x: 64, y: 888 },
      { x: 64, y: 820 },
      { x: 64, y: 752 },
      { x: 132, y: 752 },
      { x: 200, y: 752 },
      { x: 268, y: 752 },
      { x: 336, y: 752 },
      { x: 404, y: 752 },
      { x: 472, y: 684 },
      { x: 472, y: 620 },
      { x: 472, y: 552 },
      { x: 472, y: 484 },
      { x: 472, y: 416 },
      { x: 472, y: 348 },
      { x: 540, y: 348 },
      { x: 608, y: 348 },
      { x: 608, y: 416 },
      { x: 608, y: 484 },
      { x: 608, y: 552 },
      { x: 608, y: 620 },
      { x: 608, y: 688 },
      { x: 676, y: 756 },
      { x: 744, y: 756 },
      { x: 812, y: 756 },
      { x: 880, y: 756 },
      { x: 948, y: 756 },
      { x: 1016, y: 756 },
      { x: 1016, y: 824 },
      { x: 1016, y: 892 },
      { x: 948, y: 892 },
      { x: 880, y: 892 },
      { x: 812, y: 892 },
      { x: 744, y: 892 },
      { x: 676, y: 892 },
      { x: 608, y: 960 },
      { x: 608, y: 1028 },
      { x: 608, y: 1096 },
      { x: 608, y: 1164 },
      { x: 608, y: 1232 },
      { x: 608, y: 1300 },
      { x: 540, y: 1300 },
      { x: 540, y: 1232 },
      { x: 540, y: 1164 },
      { x: 540, y: 1096 },
      { x: 540, y: 1028 },
      { x: 540, y: 960 },
      { x: 540, y: 892 },
    ],
    green: [
      { x: 608, y: 416 },
      { x: 608, y: 484 },
      { x: 608, y: 552 },
      { x: 608, y: 620 },
      { x: 608, y: 688 },
      { x: 676, y: 756 },
      { x: 744, y: 756 },
      { x: 812, y: 756 },
      { x: 880, y: 756 },
      { x: 948, y: 756 },
      { x: 1016, y: 756 },
      { x: 1016, y: 824 },
      { x: 1016, y: 892 },
      { x: 948, y: 892 },
      { x: 880, y: 892 },
      { x: 812, y: 892 },
      { x: 744, y: 892 },
      { x: 676, y: 892 },
      { x: 608, y: 960 },
      { x: 608, y: 1028 },
      { x: 608, y: 1096 },
      { x: 608, y: 1164 },
      { x: 608, y: 1232 },
      { x: 608, y: 1300 },
      { x: 540, y: 1300 },
      { x: 472, y: 1300 },

      { x: 472, y: 1228 },
      { x: 472, y: 1160 },
      { x: 472, y: 1092 },
      { x: 472, y: 1024 },
      { x: 472, y: 956 },
      { x: 404, y: 888 },
      { x: 336, y: 888 },
      { x: 268, y: 888 },
      { x: 200, y: 888 },
      { x: 132, y: 888 },
      { x: 64, y: 888 },
      { x: 64, y: 820 },
      { x: 64, y: 752 },
      { x: 132, y: 752 },
      { x: 200, y: 752 },
      { x: 268, y: 752 },
      { x: 336, y: 752 },
      { x: 404, y: 752 },
      { x: 472, y: 684 },
      { x: 472, y: 620 },
      { x: 472, y: 552 },
      { x: 472, y: 484 },
      { x: 472, y: 416 },
      { x: 472, y: 348 },
      { x: 540, y: 348 },
      { x: 540, y: 416 },
      { x: 540, y: 484 },
      { x: 540, y: 552 },
      { x: 540, y: 620 },
      { x: 540, y: 688 },
      { x: 540, y: 756 },
    ],
    yellow: [
      { x: 948, y: 892 },
      { x: 880, y: 892 },
      { x: 812, y: 892 },
      { x: 744, y: 892 },
      { x: 676, y: 892 },
      { x: 608, y: 960 },
      { x: 608, y: 1028 },
      { x: 608, y: 1096 },
      { x: 608, y: 1164 },
      { x: 608, y: 1232 },
      { x: 608, y: 1300 },
      { x: 540, y: 1300 },
      { x: 472, y: 1300 },

      { x: 472, y: 1228 },
      { x: 472, y: 1160 },
      { x: 472, y: 1092 },
      { x: 472, y: 1024 },
      { x: 472, y: 956 },
      { x: 404, y: 888 },
      { x: 336, y: 888 },
      { x: 268, y: 888 },
      { x: 200, y: 888 },
      { x: 132, y: 888 },
      { x: 64, y: 888 },
      { x: 64, y: 820 },
      { x: 64, y: 752 },
      { x: 132, y: 752 },
      { x: 200, y: 752 },
      { x: 268, y: 752 },
      { x: 336, y: 752 },
      { x: 404, y: 752 },
      { x: 472, y: 684 },
      { x: 472, y: 620 },
      { x: 472, y: 552 },
      { x: 472, y: 484 },
      { x: 472, y: 416 },
      { x: 472, y: 348 },
      { x: 540, y: 348 },
      { x: 608, y: 348 },
      { x: 608, y: 416 },
      { x: 608, y: 484 },
      { x: 608, y: 552 },
      { x: 608, y: 620 },
      { x: 608, y: 688 },
      { x: 676, y: 756 },
      { x: 744, y: 756 },
      { x: 812, y: 756 },
      { x: 880, y: 756 },
      { x: 948, y: 756 },
      { x: 1016, y: 756 },
      { x: 1016, y: 824 },
      { x: 948, y: 824 },

      { x: 880, y: 824 },
      { x: 812, y: 824 },
      { x: 744, y: 824 },
      { x: 676, y: 824 },
      { x: 608, y: 824 },
    ],
    red: [
      { x: 132, y: 752 },
      { x: 200, y: 752 },
      { x: 268, y: 752 },
      { x: 336, y: 752 },
      { x: 404, y: 752 },
      { x: 472, y: 684 },
      { x: 472, y: 620 },
      { x: 472, y: 552 },
      { x: 472, y: 484 },
      { x: 472, y: 416 },
      { x: 472, y: 348 },
      { x: 540, y: 348 },
      { x: 608, y: 348 },
      { x: 608, y: 416 },
      { x: 608, y: 484 },
      { x: 608, y: 552 },
      { x: 608, y: 620 },
      { x: 608, y: 688 },
      { x: 676, y: 756 },
      { x: 744, y: 756 },
      { x: 812, y: 756 },
      { x: 880, y: 756 },
      { x: 948, y: 756 },
      { x: 1016, y: 756 },
      { x: 1016, y: 824 },
      { x: 1016, y: 892 },
      { x: 948, y: 892 },
      { x: 880, y: 892 },
      { x: 812, y: 892 },
      { x: 744, y: 892 },
      { x: 676, y: 892 },
      { x: 608, y: 960 },
      { x: 608, y: 1028 },
      { x: 608, y: 1096 },
      { x: 608, y: 1164 },
      { x: 608, y: 1232 },
      { x: 608, y: 1300 },
      { x: 540, y: 1300 },
      { x: 472, y: 1300 },
      { x: 472, y: 1228 },
      { x: 472, y: 1160 },
      { x: 472, y: 1092 },
      { x: 472, y: 1024 },
      { x: 472, y: 956 },
      { x: 404, y: 888 },
      { x: 336, y: 888 },
      { x: 268, y: 888 },
      { x: 200, y: 888 },
      { x: 132, y: 888 },
      { x: 64, y: 888 },
      { x: 64, y: 820 },
      { x: 132, y: 820 },
      { x: 200, y: 820 },
      { x: 268, y: 820 },
      { x: 336, y: 820 },
      { x: 404, y: 820 },
      { x: 472, y: 820 },
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

    AssetsHandler(this);
  }

  create() {
    UIHandler(this);
    Init(this);
    AnimationHandler(this);
    ActionHandler(this);
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
      this.tokenScore[goti.color + goti.index].x = goti.x - 30;
      this.tokenScore[goti.color + goti.index].y = goti.y - 100;
      this.tokenScore[goti.color + goti.index].setDepth(goti.depth);
      this.tokenScore[goti.color + goti.index].setVisible(this.showScore);
    });

    const speed = 3.5;
    for (let i = 0; i < 4; i++) {
      this.marker["markerblue" + i].angle += speed;
      this.marker["markergreen" + i].angle += speed;
      this.marker["markerred" + i].angle += speed;
      this.marker["markeryellow" + i].angle += speed;
    }
  }
}
