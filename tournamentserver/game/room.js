import { Road } from "./road.js";

class Room {
  constructor(roomCode) {
    this.code = roomCode;
    this.createdAt = Date.now();
    this.endedAt = null;
    this.status = 0;
    this.winner = null;
    this.looser = null;
    this.completionCode = null;
    this.currentTurn = "blue";
    this.movableSteps = 0;
    this.moveTimeRef = null;
    this.waitTimeRef = null;
    this.waitTimer = 10000;
    this.playerIsMoving = false;
    this.lastDiceValue = 0;
    this.extraChance = false;
    this.playersJoined = 0;
    this.amount = null;
    this.mode = "Legue";
    this.killing = false;
    this.sixCount = 0;

    this.playerInfo = {
      blue: {},
      green: {},
      yellow: {},
      red: {},
    };

    this.data = [
      {
        winners: 0,
        userId: null,
        user: null,
        life: 3,
        color: "blue",
        score: 0,
        players: [
          {
            index: 0,
            status: 1,
            currentPos: 0,
            homePosition: { x: 167, y: 1170 },
            score: 0,
          },
          {
            index: 1,
            status: 1,
            currentPos: 0,
            homePosition: { x: 303, y: 1170 },
            score: 0,
          },
          {
            index: 2,
            status: 1,
            currentPos: 0,
            homePosition: { x: 167, y: 1305 },
            score: 0,
          },
          {
            index: 3,
            status: 1,
            currentPos: 0,
            homePosition: { x: 303, y: 1305 },
            score: 0,
          },
        ],
      },
      {
        winners: 0,
        userId: null,
        user: null,
        life: 3,
        color: "green",
        score: 0,
        players: [
          {
            index: 0,
            status: 1,
            currentPos: 0,
            homePosition: { x: 780, y: 560 },
            score: 0,
          },
          {
            index: 1,
            status: 1,
            currentPos: 0,
            homePosition: { x: 917, y: 560 },
            score: 0,
          },
          {
            index: 2,
            status: 1,
            currentPos: 0,
            homePosition: { x: 780, y: 693 },
            score: 0,
          },
          {
            index: 3,
            status: 1,
            currentPos: 0,
            homePosition: { x: 917, y: 693 },
            score: 0,
          },
        ],
      },
      {
        winners: 0,
        userId: null,
        user: null,
        life: 3,
        color: "yellow",
        score: 0,
        players: [
          {
            index: 0,
            status: 1,
            currentPos: 0,
            homePosition: { x: 780, y: 560 },
            score: 0,
          },
          {
            index: 1,
            status: 1,
            currentPos: 0,
            homePosition: { x: 917, y: 560 },
            score: 0,
          },
          {
            index: 2,
            status: 1,
            currentPos: 0,
            homePosition: { x: 780, y: 693 },
            score: 0,
          },
          {
            index: 3,
            status: 1,
            currentPos: 0,
            homePosition: { x: 917, y: 693 },
            score: 0,
          },
        ],
      },
      {
        winners: 0,
        userId: null,
        user: null,
        life: 3,
        color: "red",
        score: 0,
        players: [
          {
            index: 0,
            status: 1,
            currentPos: 0,
            homePosition: { x: 780, y: 560 },
            score: 0,
          },
          {
            index: 1,
            status: 1,
            currentPos: 0,
            homePosition: { x: 917, y: 560 },
            score: 0,
          },
          {
            index: 2,
            status: 1,
            currentPos: 0,
            homePosition: { x: 780, y: 693 },
            score: 0,
          },
          {
            index: 3,
            status: 1,
            currentPos: 0,
            homePosition: { x: 917, y: 693 },
            score: 0,
          },
        ],
      },
    ];

    // -------------------------------------------------
    // ⭐ RANDOMIZE POSITIONS FOR GREEN + YELLOW + RED ONLY
    // -------------------------------------------------
    const usedCoordinates = new Set();

    const roadRef = {
      green: Road.green,
      yellow: Road.yellow,
      red: Road.red,
    };

    this.data.forEach((entry) => {
      if (entry.color === "blue") return; // skip blue completely

      entry.players.forEach((player) => {
        const road = roadRef[entry.color];

        // random position 0–50
        let pos = Math.floor(Math.random() * 51);
        let key = `${road[pos].x}-${road[pos].y}`;

        // ensure unique x,y
        while (usedCoordinates.has(key)) {
          pos = Math.floor(Math.random() * 51);
          key = `${road[pos].x}-${road[pos].y}`;
        }

        usedCoordinates.add(key);

        player.currentPos = pos;
        player.score = pos;
        player.homePosition = { x: road[pos].x, y: road[pos].y };
      });
    });
  }
}

export default Room;
