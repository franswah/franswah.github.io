function laserPellets(robot) {
    this.bullets = [];
    this.bulletDam = 2;
    this.bulletVel = 450;
    this.robot = robot;
    this.firerate = 15;
    this.firecount = 0;

    this.fire = function() {
      if (this.firecount == 0) {
        this.bullets.push(new bullet(this.robot.x + robot.width / 2, this.robot.y - robot.height + 20, this.robot.drone));
        this.firecount = this.firerate;
      }
      else {
        this.firecount--;
      }
    }

    this.stop = function() {
      this.firecount = 0;
    }

    this.update = function(mod) {
      var size = this.bullets.length;
      for (ndx = 0; ndx < size; ndx++) {
        var bul = this.bullets.shift();
        bul.x += bul.vector.normalizeDX() * mod * this.bulletVel;
        bul.y += bul.vector.normalizeDY() * mod * this.bulletVel;

        if (bul.x < canvas.width && bul.y < canvas.height && bul.x > 0  && bul.y > 0) {
          if (bul.x < this.robot.drone.x + this.robot.drone.radius && bul.x > this.robot.drone.x - this.robot.drone.radius
              && bul.y < this.robot.drone.y + this.robot.drone.radius && bul.y > this.robot.drone.y - this.robot.drone.radius) {
            this.robot.drone.health -= this.bulletDam;
            if (this.robot.drone.health < 0) this.robot.drone.health = 0;
          }
          else {
            this.bullets.push(bul);
          }
        }
      }
    }

    this.render = function(context) {
      context.fillStyle = "#FF0000";
      this.bullets.forEach(function(item) {
        context.fillRect(item.x, item.y, 10, 10);
      });
    }
}

function laserBeam(robot) {

  this.fire = function() {

  }
}

function bullet(x, y, drone) {
  this.x = x;
  this.y = y;
  this.vector = new vector2d(this.x, this.y, drone.x, drone.y);
}
