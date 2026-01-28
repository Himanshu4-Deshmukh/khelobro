export const PingAction = (scene) => {
  scene.pingIntervalRef = setInterval(() => {
    scene.pingStartTime = Date.now();
    scene.socket.emit("ping");
    scene.socket.on("pong", () => {
      scene.ping = Date.now() - scene.pingStartTime;
      scene.pingText.setText(scene.ping + "ms");
    });
  }, 2500);
};
