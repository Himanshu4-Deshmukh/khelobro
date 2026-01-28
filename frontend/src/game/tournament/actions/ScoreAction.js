export const ScoreAction = (scene, res) => {
  const colors = ["blue"];

  colors.forEach((color) => {
    let score = 0;
    score += Number(res.scoresData[color][0].score);
    scene.gotis[color + "0"].score = res.scoresData[color][0].score;

    score += Number(res.scoresData[color][1].score);
    scene.gotis[color + "1"].score = res.scoresData[color][1].score;

    score += Number(res.scoresData[color][2].score);
    scene.gotis[color + "2"].score = res.scoresData[color][2].score;

    score += Number(res.scoresData[color][3].score);
    scene.gotis[color + "3"].score = res.scoresData[color][3].score;

    scene.playerInfo[color].score = score;
    scene[color + "Score"].setText(scene.playerInfo[color].score);
    scene.move.setText(res.moves[scene.color]);
  });
};
