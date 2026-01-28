export const AdjustGotisAction = (scene) => {
  if (scene.tokensExpanded) return;

  scene.allGotis
    .sort((a, b) => a.y - b.y)
    .forEach((goti, index) => goti.setDepth(index));

  scene.allGotis
    .filter((goti) => goti.color === scene.currentColor) // Assuming each goti has a 'color' property
    .forEach((goti) => {
      goti.setDepth(10000); // Large depth ensures they stay on top
    });

  handleTokenOverlap(scene.allGotis);

  scene.allGotis
    .filter((goti) => goti.color === scene.currentColor) // Assuming each goti has a 'color' property
    .forEach((goti) => {
      goti.setDepth(10000); // Large depth ensures they stay on top
      // goti.setScale(1);
    });
};

const handleTokenOverlap = (tokens) => {
  // Group tokens by their logical position
  const groupedTokens = {};

  tokens.forEach((token) => {
    const key = `${Math.round(token.originalX)},${Math.round(token.originalY)}`; // Use logical position for grouping
    if (!groupedTokens[key]) {
      groupedTokens[key] = [];
    }
    groupedTokens[key].push(token);
  });

  // Handle each group
  for (const key in groupedTokens) {
    const group = groupedTokens[key];

    if (group.length > 1) {
      // If there are overlapping tokens
      const spacing = 20; // Adjust spacing between tokens
      const startX = group[0].originalX - ((group.length - 1) * spacing) / 2;

      group.forEach((token, index) => {
        token.setScale(1.85 / group.length); // Scale down overlapping tokens
        token.x = startX + index * spacing; // Visually offset x
        token.y = token.originalY; // Keep y consistent with original
      });
    } else {
      // Reset for non-overlapping tokens
      const token = group[0];
      token.setScale(1); // Reset scale
      token.x = token.originalX; // Reset to original x
      token.y = token.originalY; // Reset to original y
    }
  }
};
