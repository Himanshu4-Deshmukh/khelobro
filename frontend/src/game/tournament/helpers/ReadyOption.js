export const ReadyOption = (scene) => {
  if (scene.gameStatus == 1) {
    clearInterval(scene.clockTimerRef);
    scene.scene.start("Game");
    return;
  }

  scene.timeLeft = "00:00";
  //handling timer
  scene.timerPlate = scene.add.image(190, 130, "timerplate").setScale(0.7);
  scene.clockDisplay = scene.add.text(
    140, // x position
    100, // y position
    scene.timeLeft, // Text content
    {
      fontSize: "50px", // Font size
      fontStyle: "bold",
      color: "white", // Text color
      fontFamily: "Arial", // Font family
    }
  );

  let startTime = new Date(scene.startedAt);
  // console.log(scene, scene.startedAt);
  scene.endTime = new Date(startTime.getTime() + 30 * 1000); // 10 minutes in ms

  scene.clockTimerRef = setInterval(() => {
    if (!scene || !scene.clockDisplay) {
      clearInterval(scene.clockTimerRef);
      return;
    }
    updateTimer(scene);
  }, 1000);
};

function updateTimer(scene) {
  if (!scene.endTime) return; // Ensure endTime is defined

  let currentTime = Date.now();
  let timeLeft = scene.endTime - currentTime; // Remaining time in ms

  if (timeLeft <= 0) {
    scene.timeLeft = "00:00"; // Set to zero when timer ends
    clearInterval(scene.clockTimerRef);
    if (scene.clockDisplay) {
      scene?.clockDisplay?.setText(scene?.timeLeft);
    }

    return;
  }

  let minutes = Math.floor(timeLeft / 60000);
  let seconds = Math.floor((timeLeft % 60000) / 1000);

  // Format time as MM:SS
  scene.timeLeft = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  if (scene.clockDisplay) {
    scene?.clockDisplay?.setText(scene?.timeLeft);
  }
}
