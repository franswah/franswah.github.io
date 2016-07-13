var bg = document.getElementById("bg-layer");
var bgctx = bg.getContext("2d");
bg.width = 1080;
bg.height = 720;
bgctx.fillStyle = "#ddddff";
bgctx.fillRect(0,0,1080,720);
document.body.appendChild(bg);

var canvas = document.getElementById("robot-layer");
var ctx = canvas.getContext("2d");
canvas.width = 1080;
canvas.height = 720;
document.body.appendChild(canvas);

var ground = bg.height - 20;
var mouseX = 50;
var mouseY = 50;

var robot = {
  speed: 256,
  x: 50,
  y: ground,
  h: 30,
  w: 20
};

var probe = {
  speed: 5,
  health: 100,
  radius: 40,
  x: 100,
  y: 100
};

var bullets = [];

var bulletVel = 500;
var bulletDam = 5;

var keysDown = {};

addEventListener("keydown", function(e) {
  keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function(e) {
  delete keysDown[e.keyCode];
}, false);

canvas.addEventListener("mousemove", function(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

addEventListener("click", function(e) {
  bullets.push(new bullet());
});

function vector2d(x1, y1, x2, y2) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;

  this.length = function() {
    return Math.sqrt(Math.pow((this.x2 - this.x1),2) + Math.pow((this.y2 - this.y1),2));
  };

  this.normalizeDX = function() {
    if (this.length() == 0) return 0;
    return (this.x2 - this.x1) / this.length();
  };
  this.normalizeDY = function() {
    if (this.length() == 0) return 0;
    return (this.y2 - this.y1) / this.length();
  };
}

function bullet() {
  this.x = robot.x;
  this.y = robot.y;
  this.vector = new vector2d(this.x, this.y, probe.x, probe.y);
}

var update = function(modifier) {
  if (37 in keysDown) {
    robot.x -= robot.speed * modifier;
  }
  if (39 in keysDown) {
    robot.x += robot.speed * modifier;
  }

  probe.x += (mouseX - probe.x) * probe.speed * modifier;
  probe.y += (mouseY - probe.y) * probe.speed * modifier;

  var size = bullets.length;
  for (ndx = 0; ndx < size; ndx++) {
    var bul = bullets.shift();
    bul.x += bul.vector.normalizeDX() * modifier * bulletVel;
    bul.y += bul.vector.normalizeDY() * modifier * bulletVel;

    if (bul.x < canvas.width && bul.y < canvas.height && bul.x > 0  && bul.y > 0) {
      if (bul.x < probe.x + probe.radius && bul.x > probe.x - probe.radius
          && bul.y < probe.y + probe.radius && bul.y > probe.y - probe.radius) {
        probe.health -= bulletDam;
        if (probe.health < 0) probe.health = 0;
      }
      else {
        bullets.push(bul);
      }
    }
  }
}

var render = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#555555";
  ctx.fillRect(robot.x - robot.w/2, ground - robot.h, robot.w, robot.h);
  ctx.beginPath();
  ctx.arc(probe.x, probe.y, probe.radius, 0, 2*Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = "#33d6ff";
  ctx.arc(probe.x, probe.y, 35, 0, probe.health / 100 * 2 * Math.PI);
  ctx.lineTo(probe.x, probe.y);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FF0000";
  bullets.forEach(function(item) {
    ctx.fillRect(item.x, item.y, 10, 10);
  });
}

var main = function() {
  var now = Date.now();
  var delta = now - then;

  update(delta / 1000);
  render();

  then = now;

  requestAnimationFrame(main);
}

var then = Date.now();
main();
