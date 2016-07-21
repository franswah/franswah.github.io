var WIDTH = 920;
var HEIGHT = 500;



var bg = document.getElementById("bg_layer");
bg.width = WIDTH;
bg.height = HEIGHT;
var bgctx = bg.getContext("2d");
bgctx.fillStyle = "#ddddff";
bgctx.fillRect(0,0,bg.width,bg.height);

var canvas = document.getElementById("robot_layer");
canvas.width = WIDTH;
canvas.height = HEIGHT;
var ctx = canvas.getContext("2d");

var ground = bg.height - 20;
var mouseX = 50;
var mouseY = 50;

var drone = new drone();
var robot = new robot(drone);

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
  var rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

canvas.addEventListener("mousedown", function(e) {
  keysDown[1] = true;
}, false);

canvas.addEventListener("mouseup", function(e) {
  delete keysDown[1];
}, false);

canvas.onselectstart = function () { return false; }

var update = function(modifier) {
  robot.update(modifier, keysDown);
  drone.update(modifier);


}

var render = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  robot.render(ctx);
  drone.render(ctx);
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
