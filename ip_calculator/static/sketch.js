let string = "CALCULADORA™";
const size = 170;
const fontFile = "/static/Brockmann/Brockmann-Bold.ttf";
const textAlpha = 8;
const backgroundColor = 8;
const strokeAlpha = 40;
const strokeColor = 254;

const fontSampleFactor = 0.9;
const noiseZoom = 0.005;
const noiseOctaves = 4;
const noiseFalloff = 0.5;

const zOffsetChange = 0;
const individualZOffset = 0;
const lineSpeed = 14;
const newPointsCount = 100;

let seed;
let font;
let points = [];
let startingPoints;

function preload() {
  font = loadFont(fontFile);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  fill(backgroundColor, textAlpha);
  stroke(strokeColor, strokeAlpha);
  colorMode(HSB, 300);
  noiseDetail(noiseOctaves, noiseFalloff);
  seed = floor(random(1000000));
  start();
}

function start() {
  background(backgroundColor);
  textSize(size);

  randomSeed(seed);
  noiseSeed(seed);
  frameCount = 0;

  startingPoints = font.textToPoints(
    string,
    width / 2 - textWidth(string) / 2,
    height / 2,
    size,
    { sampleFactor: fontSampleFactor }
  );

  points = [];
  for (let p = 0; p < startingPoints.length; p++) {
    points[p] = startingPoints[p];
    points[p].zOffset = random();
  }
}

function draw() {
  noStroke();
  text(string, width / 2 - textWidth(string) / 2, height / 2);
  stroke(strokeColor, strokeAlpha);

  for (let pt = 0; pt < points.length; pt++) {
    let p = points[pt];
    let noiseX = p.x * noiseZoom;
    let noiseY = p.y * noiseZoom;
    let noiseZ = frameCount * zOffsetChange + p.zOffset * individualZOffset;

    let newPX = p.x + map(noise(noiseX, noiseY, noiseZ), 0, 1, -lineSpeed, lineSpeed);
    let newPY = p.y + map(noise(noiseX, noiseY, noiseZ + 214), 0, 1, -lineSpeed, lineSpeed);

    line(p.x, p.y, newPX, newPY);
    p.x = newPX;
    p.y = newPY;
  }
}

function mouseDragged() {
  for (let i = 0; i < newPointsCount; i++) {
    let angle = random(TAU);
    let magnitude = randomGaussian() * Math.sqrt(newPointsCount - 1) * 3;
    let newPoint = {
      x: mouseX + magnitude * cos(angle),
      y: mouseY + magnitude * sin(angle),
      zOffset: random(),
    };
    points.push(newPoint);
    startingPoints.push(newPoint);
  }
}

