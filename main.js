let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {};

// events
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

window.addEventListener("mousedown", key => {
  mouse.down = true;
  mouse.x = key.x;
  mouse.y = key.y;
});

window.addEventListener("mouseup", key => {
  mouse.down = false;
  mouse.released = true;
});

window.addEventListener("mousemove", key => {
  if (
    key.x > 0 + 30 &&
    key.x < canvas.width - 30 &&
    key.y > 0 + 30 &&
    key.y < canvas.height - 30
  ) {
    mouse.x = key.x;
    mouse.y = key.y;
  } else {
    mouse.down = false;
    mouse.released = true;
  }
});

let controllers = [];
let colors = ["#FF851B", "#0074D9 ", "#2ECC40", "#FF4136"];
for (i = 0; i != 4; i++) {
  let controller = new Controller(colors[i]);
  controllers.push(controller);
}

function Controller(color) {
  this.pos = new Vector(
    Math.random() * canvas.width,
    Math.random() * canvas.height
  );
  this.maxSpeed = 30;
  this.friction = 2;
  this.spd = 10;
  this.radius = 30;
  this.acc = 0.03;
  this.buildUp = 0;
  this.vel = new Vector(Math.random() - 0.5, Math.random() - 0.5);
  this.vel = norm(this.vel);
  this.color = color;
  this.particles = [];
  this.colorMemory = this.color;

  this.update = () => {
    let particle = new Particle(
      Math.floor(this.pos.x + (Math.random() - 0.5) * 5),
      Math.floor(this.pos.y + (Math.random() - 0.5) * 5),
      Math.floor(Math.random() * (30 - 25) + 25),
      this.color,
      this
    );

    this.particles.push(particle);
    let dir = sub(mouse, this.pos);
    let distance = mag(dir);

    if (mouse.down) {
      this.spd = this.maxSpeed;

      if (distance < 400) {
        this.spd = map(distance, 0, 400, 0, this.maxSpeed);
      }

      this.vel.x = norm(dir).x;
      this.vel.y = norm(dir).y;
      if (this.buildUp < 100) {
        this.buildUp += 2;
      }
      if (distance < 10) {
        this.color = "#FFF";
      } else {
        this.color = this.colorMemory;
      }
    }

    if (mouse.released) {
      this.color = this.colorMemory;
      ctx.globalAlpha = 1;
      if (Math.floor(this.spd) <= 0 && distance < 10) {
        this.vel = new Vector(Math.random() - 0.5, Math.random() - 0.5);
        this.vel = norm(this.vel);
        this.spd = this.buildUp;
      }
      this.buildUp = 0;
    }

    // bounce
    this.bounced = false;
    if (
      (this.pos.x + this.radius >= canvas.width && this.vel.x > 0) ||
      (this.pos.x - this.radius <= 0 && this.vel.x < 0)
    ) {
      this.vel.x = -this.vel.x;
      this.vel.y = this.vel.y + Math.random() - 0.5;
      this.bounced = true;
    }
    if (
      (this.pos.y + this.radius >= canvas.height && this.vel.y > 0) ||
      (this.pos.y - this.radius <= 0 && this.vel.y < 0)
    ) {
      this.vel.y = -this.vel.y;
      this.vel.x = this.vel.x + Math.random() - 0.5;
      this.bounced = true;
    }
    this.vel = norm(this.vel);

    // move
    this.pos.x += this.vel.x * this.spd;
    this.pos.y += this.vel.y * this.spd;

    // friction  && acceleration calculation
    if (this.bounced) {
      if (this.spd > 0.1) this.spd -= this.friction;
    } else {
      if (this.spd < this.maxSpeed) {
        this.spd += this.acc;
      }
    }

    this.particles.forEach(thing => {
      thing.update();
    });

    this.draw();
  };

  this.draw = () => {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  };
}

function Particle(x, y, radius, color, controller) {
  this.controller = controller;
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = color;

  this.update = () => {
    if (this.radius <= 0.5) {
      this.controller.particles = remove(this.controller.particles, this);
    } else {
      this.draw();
      this.radius -= 0.5;
    }

    // jiggle
    this.x += (Math.random() - 0.5) * 5;
    this.y += (Math.random() - 0.5) * 5;
  };

  this.draw = () => {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  };
}

(function Update() {
  ctx.beginPath();
  window.requestAnimationFrame(Update);
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  ctx.closePath();
  controllers.forEach(controller => {
    controller.update();
  });
  mouse.released = false;
})();

function Vector(x, y) {
  return {
    x: x,
    y: y
  };
}

function mag(vector) {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}

function norm(vector) {
  vecMag = mag(vector);
  vector.x = vector.x / vecMag;
  vector.y = vector.y / vecMag;
  return vector;
}

function sub(vector1, vector2) {
  return new Vector(vector1.x - vector2.x, vector1.y - vector2.y);
}

function map(x, a, b, c, d) {
  return ((x - a) / (b - a)) * (d - c) + c;
}

function remove(array, element) {
  return array.filter(el => el !== element);
}
