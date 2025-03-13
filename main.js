// Game data
let gameStarted; // Boolean

let balloonX;
let balloonY;

let verticalVelocity; // Current vertical speed of the balloon
let horizontalVelocity; // Current horizontal balloon speed

let fuel; // Percentage of fuel left
let heating; // Boolean: Is the mouse down or not?

let trees; // Metadata of the trees in an array
let backgroundTrees; // Metadata of the trees on the hills in the background

// Configuration
const mainAreaWidth = 400;
const mainAreaHeight = 375;
let horizontalPadding = (window.innerWidth - mainAreaWidth) / 2;
let verticalPadding = (window.innerHeight - mainAreaHeight) / 2;
// Distant hills
const hill1BaseHeight = 75;
const hill1Speed = 0.3;
const hill1Amplitude = 15;
const hill1Stretch = 1;
// Mid distance hills
const hill2BaseHeight = 50;
const hill2Speed = 0.2;
const hill2Amplitude = 15;
const hill2Stretch = 0.5;
// Grass
const hill3BaseHeight = 15;
const hill3Speed = 1;
const hill3Amplitude = 10;
const hill3Stretch = 0.2;

// Setting canvas for drawing
const canvas = document.getElementById("game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

const introductionElement = document.getElementById("introduction"); // Intro text
const restartButton = document.getElementById("restart"); // Restart button

// Add a custom sin function that takes degrees instead of radians
Math.sinus = function (degree) {
  return Math.sin((degree / 180) * Math.PI);
};

// Initialize layout
resetGame();

// Resets game variables and layouts but does not start the game (game starts on keypress)
function resetGame() {
  // Reset game progress
  gameStarted = false;
  heating = false;
  verticalVelocity = 3;
  horizontalVelocity = 0.3;
  balloonX = 0;
  balloonY = 0;
  fuel = 500;

  introductionElement.style.opacity = 1;
  restartButton.style.display = "none";

  trees = [];
  for (let i = 1; i < window.innerWidth / 50; i++) generateTree();

  backgroundTrees = [];
  for (let i = 1; i < window.innerWidth / 30; i++) generateBackgroundTree();

  draw();
}

function generateBackgroundTree() {
  const minimumGap = 30;
  const maximumGap = 150;

  // X coordinate of the right edge of the furthest tree
  const lastTree = backgroundTrees[backgroundTrees.length - 1];
  let furthestX = lastTree ? lastTree.x : 0;

  const x =
    furthestX +
    minimumGap +
    Math.floor(Math.random() * (maximumGap - minimumGap));

  const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
  const color = treeColors[Math.floor(Math.random() * 3)];

  backgroundTrees.push({ x, color });
}

function generateTree() {
  const minimumGap = 50; // Minimum distance between two trees
  const maximumGap = 600; // Maximum distance between two trees

  const x = trees.length
    ? trees[trees.length - 1].x +
      minimumGap +
      Math.floor(Math.random() * (maximumGap - minimumGap))
    : 400;

  const h = 60 + Math.random() * 80; // Height

  const r1 = 32 + Math.random() * 16; // Radius
  const r2 = 32 + Math.random() * 16;
  const r3 = 32 + Math.random() * 16;
  const r4 = 32 + Math.random() * 16;
  const r5 = 32 + Math.random() * 16;
  const r6 = 32 + Math.random() * 16;
  const r7 = 32 + Math.random() * 16;

  const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
  const color = treeColors[Math.floor(Math.random() * 3)];

  trees.push({ x, h, r1, r2, r3, r4, r5, r6, r7, color });
}

resetGame();

// If space was pressed restart the game
window.addEventListener("keydown", function (event) {
  if (event.key == " ") {
    event.preventDefault();
    resetGame();
    return;
  }
});

window.addEventListener("mousedown", function () {
  heating = true;

  if (!gameStarted) {
    introductionElement.style.opacity = 0; // Text fades away
    gameStarted = true; // Game starts here
    window.requestAnimationFrame(animate);
  }
});

window.addEventListener("mouseup", function () {
  heating = false;
});

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  horizontalPadding = (window.innerWidth - mainAreaWidth) / 2;
  verticalPadding = (window.innerHeight - mainAreaHeight) / 2;
  draw();
});

// Dynamically create hill images from SVG images
const hillImage1 = document.createElement("img");
hillImage1.id = "hills1";
hillImage1.src = "hill1.svg";
hillImage1.style.display = "block";
hillImage1.style.position = "absolute";
hillImage1.style.bottom = "0";
hillImage1.style.left = "0";
hillImage1.style.width = "100%";
hillImage1.style.height = "auto";
document.body.appendChild(hillImage1);

const hillImage2 = document.createElement("img");
hillImage2.id = "hills2";
hillImage2.src = "hill1.svg";
hillImage2.style.display = "block";
hillImage2.style.position = "absolute";
hillImage2.style.bottom = "0";
hillImage2.style.left = "100%";
hillImage2.style.width = "100%";
hillImage2.style.height = "auto";
document.body.appendChild(hillImage2);

// The main game loop
function animate() {
  if (!gameStarted) return;

  const velocityChangeWhileHeating = 0.09;
  const velocityChangeWhileCooling = 0.05;

  if (heating && fuel > 0) {
    if (verticalVelocity > -3) {
      // Limit maximum rising speed
      verticalVelocity -= velocityChangeWhileHeating;
    }
    fuel -= 0.001 * -balloonY;
  } else if (verticalVelocity < 5) {
    // Limit maximum descending speed
    verticalVelocity += velocityChangeWhileCooling;
  }

  balloonY += verticalVelocity; // Move the balloon up or down
  if (balloonY > 0) balloonY = 0; // The balloon landed on the ground
  if (balloonY < 0) balloonX += horizontalVelocity; // Move balloon to the right if not on the ground

  // If a tree moves out of the picture replace it with a new one
  if (trees[0].x - (balloonX - horizontalPadding) < -100) {
    trees.shift(); // Remove first item in array
    generateTree(); // Add a new item to the array
  }

  // If a tree on the background hill moves out of the picture replace it with a new one
  if (
    backgroundTrees[0].x - (balloonX * hill1Speed - horizontalPadding) <
    -40
  ) {
    backgroundTrees.shift(); // Remove first item in array
    generateBackgroundTree(); // Add a new item to the array
  }

  // Move the hill1.svg images
  const hillWidth = hillImage1.width; // Assuming both images have the same width

  let hill1X = -balloonX * hill3Speed % hillWidth;
  let hill2X = hill1X + hillWidth;

  if (hill1X < -hillWidth) {
    hill1X += hillWidth;
  }
  if (hill2X < -hillWidth) {
    hill2X += hillWidth;
  }

  hillImage1.style.left = `${hill1X}px`;
  hillImage2.style.left = `${hill2X}px`;

  draw(); // Re-render the whole scene

  // If the balloon hit a tree OR ran out of fuel and landed then stop the game
  const hit = hitDetection();
  if (hit || (fuel <= 0 && balloonY >= 0)) {
    restartButton.style.display = "block";
    return;
  }

  window.requestAnimationFrame(animate);
}

function draw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  drawSky(); // Fill the background with a gradient

  ctx.save();
  ctx.translate(0, verticalPadding + mainAreaHeight);
  drawBackgroundHills();

  ctx.translate(horizontalPadding, 0);

  // Center main canvas area to the middle of the screen
  ctx.translate(-balloonX, 0);

  // Draw scene
  drawTrees();
  drawBalloon();

  // Restore transformation
  ctx.restore();

  // Header is last because it's on top of everything else
  drawHeader();
}

restartButton.addEventListener("click", function (event) {
  event.preventDefault();
  resetGame();
  restartButton.style.display = "none";
});

function drawCircle(cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.fill();
}

function drawTrees() {
  trees.forEach(({ x, h, r1, r2, r3, r4, r5, r6, r7, color }) => {
    ctx.save();
    ctx.translate(x, 0);

    // Trunk
    const trunkWidth = 40;
    ctx.fillStyle = "#885F37";
    ctx.beginPath();
    ctx.moveTo(-trunkWidth / 2, 0);
    ctx.quadraticCurveTo(-trunkWidth / 4, -h / 2, -trunkWidth / 2, -h);
    ctx.lineTo(trunkWidth / 2, -h);
    ctx.quadraticCurveTo(trunkWidth / 4, -h / 2, trunkWidth / 2, 0);
    ctx.closePath();
    ctx.fill();

    // Crown
    ctx.fillStyle = color;
    drawCircle(-20, -h - 15, r1);
    drawCircle(-30, -h - 25, r2);
    drawCircle(-20, -h - 35, r3);
    drawCircle(0, -h - 45, r4);
    drawCircle(20, -h - 35, r5);
    drawCircle(30, -h - 25, r6);
    drawCircle(20, -h - 15, r7);

    ctx.restore();
  });
}

function drawBalloon() {
  let balloonImg = document.getElementById("balloonImg");

  if (!balloonImg) {
    balloonImg = document.createElement("img");
    balloonImg.setAttribute("id", "balloonImg");
    balloonImg.setAttribute("src", "balloon.svg");
    balloonImg.style.width = "120px";
    balloonImg.style.height = "210px";
    document.body.appendChild(balloonImg);
  }

  // Update position
  balloonImg.style.position = "absolute";
  balloonImg.style.left = `${balloonX + window.innerWidth / 2.2}px`;
  balloonImg.style.top = `${balloonY + window.innerHeight / 2}px`;
}

function drawHeader() {
  // Fuel meter
  ctx.strokeStyle = fuel <= 30 ? "red" : "white";
  ctx.strokeRect(30, 30, 150, 30);
  ctx.fillStyle = fuel <= 30 ? "rgba(255,0,0,0.5)" : "rgba(150,150,200,0.5)";
  ctx.fillRect(30, 30, (150 * fuel) / 100, 30);

  // Score
  const score = Math.floor(balloonX / 30);
  ctx.fillStyle = "black";
  ctx.font = "bold 32px Tahoma";
  ctx.textAlign = "end";
  ctx.textBaseline = "top";
  ctx.fillText(`${score} m`, window.innerWidth - 30, 30);
}

function drawSky() {
  var gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  gradient.addColorStop(0, "#AADBEA");
  gradient.addColorStop(1, "#FEF1E1");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawBackgroundHills() {
  // Draw hills
  drawHill(
    hill1BaseHeight,
    hill1Speed,
    hill1Amplitude,
    hill1Stretch,
    "#AAD155" // #95C629"
  );
  drawHill(
    hill2BaseHeight,
    hill2Speed,
    hill2Amplitude,
    hill2Stretch,
    "#84B249" // "#659F1C"
  );

  drawHill(
    hill3BaseHeight,
    hill3Speed,
    hill3Amplitude,
    hill3Stretch,
    "#26532B"
  );

  // Draw background trees
  backgroundTrees.forEach((tree) => drawBackgroundTree(tree.x, tree.color));
}

// A hill is a shape under a stretched out sinus wave
function drawHill(baseHeight, speedMultiplier, amplitude, stretch, color) {
  ctx.beginPath();
  ctx.moveTo(0, window.innerHeight);
  ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
  for (let i = 0; i <= window.innerWidth; i++) {
    ctx.lineTo(i, getHillY(i, baseHeight, speedMultiplier, amplitude, stretch));
  }
  ctx.lineTo(window.innerWidth, window.innerHeight);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawBackgroundTree(x, color) {
  ctx.save();
  ctx.translate(
    (-balloonX * hill1Speed + x) * hill1Stretch,
    getTreeY(x, hill1BaseHeight, hill1Amplitude)
  );

  const treeTrunkHeight = 5;
  const treeTrunkWidth = 2;
  const treeCrownHeight = 25;
  const treeCrownWidth = 10;

  // Draw trunk
  ctx.fillStyle = "#7D833C";
  ctx.fillRect(
    -treeTrunkWidth / 2,
    -treeTrunkHeight,
    treeTrunkWidth,
    treeTrunkHeight
  );

  // Draw crown
  ctx.beginPath();
  ctx.moveTo(-treeCrownWidth / 2, -treeTrunkHeight);
  ctx.lineTo(0, -(treeTrunkHeight + treeCrownHeight));
  ctx.lineTo(treeCrownWidth / 2, -treeTrunkHeight);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

function getHillY(x, baseHeight, speedMultiplier, amplitude, stretch) {
  const sineBaseY = -baseHeight;
  return (
    Math.sinus((balloonX * speedMultiplier + x) * stretch) * amplitude +
    sineBaseY
  );
}

function getTreeY(x, baseHeight, amplitude) {
  const sineBaseY = -baseHeight;
  return Math.sinus(x) * amplitude + sineBaseY;
}

function hitDetection() {
  const cartBottomLeft = { x: balloonX - 30, y: balloonY };
  const cartBottomRight = { x: balloonX + 30, y: balloonY };
  const cartTopRight = { x: balloonX + 30, y: balloonY - 40 };

  for (const { x, h, r1, r2, r3, r4, r5 } of trees) {
    const treeBottomLeft = { x: x - 20, y: -h - 15 };
    const treeLeft = { x: x - 30, y: -h - 25 };
    const treeTopLeft = { x: x - 20, y: -h - 35 };
    const treeTop = { x: x, y: -h - 45 };
    const treeTopRight = { x: x + 20, y: -h - 35 };

    if (getDistance(cartBottomLeft, treeBottomLeft) < r1) return true;
    if (getDistance(cartBottomRight, treeBottomLeft) < r1) return true;
    if (getDistance(cartTopRight, treeBottomLeft) < r1) return true;

    if (getDistance(cartBottomLeft, treeLeft) < r2) return true;
    if (getDistance(cartBottomRight, treeLeft) < r2) return true;
    if (getDistance(cartTopRight, treeLeft) < r2) return true;

    if (getDistance(cartBottomLeft, treeTopLeft) < r3) return true;
    if (getDistance(cartBottomRight, treeTopLeft) < r3) return true;
    if (getDistance(cartTopRight, treeTopLeft) < r3) return true;

    if (getDistance(cartBottomLeft, treeTop) < r4) return true;
    if (getDistance(cartBottomRight, treeTop) < r4) return true;
    if (getDistance(cartTopRight, treeTop) < r4) return true;

    if (getDistance(cartBottomLeft, treeTopRight) < r5) return true;
    if (getDistance(cartBottomRight, treeTopRight) < r5) return true;
    if (getDistance(cartTopRight, treeTopRight) < r5) return true;
  }
}

function getDistance(point1, point2) {
  return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
}
