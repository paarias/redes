let maxVelocity = 1;
let frictionDecay = 0.4;

let attractionStrength = 32;
let repulsionStrength = 33;

let plantGroup = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(2); // 👈 mejora nitidez en pantallas retina o 4K

  background(255); // 👈 Fondo blanco al inicio

  for (let i = 0; i < 3; i++) {
    let x = width * 0.25 * (i + 1);
    let y = height / 2;
    plantGroup.push(new Plant(x, y));
  }
}

function draw() {
  background(255, 255, 255, 10); // 👈 Redibuja fondo con transparencia para suavizar trazos

  for (let plant of plantGroup) {
    if (!plant.isComplete()) {
      plant.update();
      plant.display();
    }
  }
}

function mousePressed() {
  background(255);
  plantGroup = [];

  for (let i = 0; i < 3; i++) {
    let x = width * 0.25 * (i + 1);
    let y = height / 2;
    plantGroup.push(new Plant(x, y));
  }
}

class Plant {
  constructor(x, y) {
    this.originX = x;
    this.originY = y;

    this.minDistance = floor(random(15, 21));
    this.maxNodes = floor(random(240, 320));

    this.rangeAttraction = this.minDistance;
    this.rangeRepulsion = this.minDistance * 10;

    this.particles = [];

    for (let i = -4; i <= 4; i++) {
      let offsetY = -i * (this.minDistance * 3);
      let offsetX = random(-20, 20);
      this.particles.push(new Node(offsetX, offsetY, this.rangeAttraction, this.rangeRepulsion));
    }
  }

  isComplete() {
    return this.particles.length > this.maxNodes;
  }

  update() {
    for (let i = 1; i < this.particles.length - 1; i++) {
      let current = this.particles[i];
      let prev = this.particles[i - 1];
      let next = this.particles[i + 1];

      let vecPrev = p5.Vector.sub(prev.pos, current.pos);
      let vecNext = p5.Vector.sub(next.pos, current.pos);

      let curvature = 1 - abs(p5.Vector.dot(vecPrev.copy().normalize(), vecNext.copy().normalize()));

      if (randomGaussian(0, 1) < curvature) {
        if (vecNext.mag() >= this.minDistance) {
          let midpoint = p5.Vector.add(current.pos, next.pos).div(2);
          let newParticle = new Node(midpoint.x, midpoint.y, this.rangeAttraction, this.rangeRepulsion);
          this.particles.splice(i + 1, 0, newParticle);
          i++;
        }
      }
    }

    for (let node of this.particles) {
      for (let target of this.particles) {
        if (node !== target) {
          node.applyForce(target);
        }
      }
      node.update();
    }
  }

  display() {
    noFill();
    stroke(0, 55, 35, 2);
    strokeWeight(1);

    push();
    translate(this.originX, this.originY);
    beginShape();
    for (let i = 1; i < this.particles.length; i++) {
      let p = this.particles[i];
      vertex(p.pos.x, p.pos.y);
    }
    endShape();
    pop();
  }
}

class Node {
  constructor(x, y, attractionRange, repulsionRange) {
    this.pos = createVector(x, y);
    this.vel = createVector();
    this.acc = createVector();

    this.radius = 4;
    this.color = color(0);

    this.rangeAttract = attractionRange;
    this.rangeRepel = repulsionRange;
  }

  update() {
    this.vel.add(this.acc);
    this.acc.mult(0);
    this.pos.add(this.vel);
    this.vel.mult(frictionDecay);
  }

  applyForce(otherNode) {
    let direction = p5.Vector.sub(otherNode.pos, this.pos);
    let distance = direction.mag();
    direction.normalize();

    if (distance < this.rangeAttract) {
      let attraction = direction.copy().mult(attractionStrength).div(distance * distance);
      this.acc.add(attraction);
    }

    if (distance < this.rangeRepel) {
      let repulsion = direction.copy().mult(-repulsionStrength).div(distance * distance);
      this.acc.add(repulsion);
    }
  }
}
