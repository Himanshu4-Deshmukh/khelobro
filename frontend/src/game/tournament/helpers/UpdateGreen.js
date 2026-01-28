export const UpdateGreen = (scene) => {
  scene.socket.on("_gj", (res) => {
    scene.playerInfo.green = res.greenInfo;

    let temp = scene.registry.get("playerInfo");
    temp.green = res.greenInfo;
    scene.registry.set("playerInfo", temp);

    ////console.log(res);
    scene.greenName.setText(res.greenInfo.fullName);
    scene.gameStatus = res.gameStatus;
    scene.registry.set("gameStatus", scene.gameStatus);
    scene.search.setVisible(false);
    scene.searchText.setVisible(false);

    clearInterval(scene.spinAnimRef);
    scene.greenPic = scene.add.sprite(772, 1066, "avatar2").setScale(1.1);
    setTimeout(() => {
      scene.scene.start("Game");
    }, 500);
  });
};
