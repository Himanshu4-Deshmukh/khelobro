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
    this.waitTimer = 13000;
    this.playerIsMoving = false;
    this.lastDiceValue = 0;
    this.extraChance = false;
    this.playersJoined = 0;
    this.amount = null;
    this.mode = "Classic";
    this.killing = false;
    this.sixCount = 0;
    this.playerInfo = {
      blue: {},
      green: {},
    };
    this.data = [
      {
        userId: null,
        user: null,
        life: 5,
        color: "blue",
        players: [
          {
            index: 0,
            status: -1, //-1 home,1 out of home,2 reached
            currentPos: 0,
            homePosition: { x: 167, y: 1170 }, // Increased by 110
          },
          {
            index: 1,
            status: -1, //-1 home,1 out of home,2 reached
            currentPos: 0,
            homePosition: { x: 303, y: 1170 }, // Increased by 110
          },
          {
            index: 2,
            status: 1, //-1 home,1 out of home,2 reached
            currentPos: 0,
            homePosition: { x: 167, y: 1305 }, // Increased by 110
          },
          {
            index: 3,
            status: 1, //-1 home,1 out of home,2 reached
            currentPos: 0,
            homePosition: { x: 303, y: 1305 }, // Increased by 110
          },
        ],
      },
      {
        userId: null,
        user: null,
        life: 5,
        color: "green",
        players: [
          {
            index: 0,
            status: -1, //-1 home,1 out of home,2 reached
            currentPos: 0,
            homePosition: { x: 780, y: 560 }, // Increased by 110
          },
          {
            index: 1,
            status: -1, //-1 home,1 out of home,2 reached
            currentPos: 0,
            homePosition: { x: 917, y: 560 }, // Increased by 110
          },
          {
            index: 2,
            status: 1, //-1 home,1 out of home,2 reached
            currentPos: 0,
            homePosition: { x: 780, y: 693 }, // Increased by 110
          },
          {
            index: 3,
            status: 1, //-1 home,1 out of home,2 reached
            currentPos: 0,
            homePosition: { x: 917, y: 693 }, // Increased by 110
          },
        ],
      },
    ];
  }
}

export default Room;
