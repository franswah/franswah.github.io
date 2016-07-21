function drone() {
  this.speed = 5;
  this.health = 100;
  this.radius = 40;
  this.x = 100;
  this.y = 100;

  this.update = function(mod) {
    this.x += (mouseX - this.x) * this.speed * mod;
    this.y += (mouseY - this.y) * this.speed * mod;
  }

  this.render = function(context) {
    context.fillStyle = "#555555";
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    context.fill();
    context.stroke();
    context.beginPath();
    if (this.health > 20) {
      context.fillStyle = "#33d6ff";
    }
    else {
      context.fillStyle = "#FF0000";
    }

    context.arc(this.x, this.y, 35, 0, this.health / 100 * 2 * Math.PI);
    context.lineTo(this.x, this.y);
    context.fill();
    context.stroke();
  }
}
