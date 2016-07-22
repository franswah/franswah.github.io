var robotImage = new Image();
robotImage.src = 'media/robot.png';

function robot(drone) {
  this.speed = 256;
  this.x = 50;
  this.y = ground;
  this.height = 100;
  this.width = 95;
  this.upAccel = 0;
  this.h = 30;
  this.w = 20;
  this.drone = drone;
  this.weapon = new laserPellets(this);
  this.jumpTime = 0;
  this.maxJumpTime = 25;

  this.update = function(mod, keys) {
      if (37 in keys || 65 in keys) {
        this.x -= this.speed * mod;
      }
      if (39 in keys || 68 in keys) {
        this.x += this.speed * mod;
      }
      if (1 in keys) {
        this.weapon.fire();
      }
      else {
        this.weapon.stop();
      }

      if ((32 in keys || 38 in keys) && (this.jumpTime < this.maxJumpTime)) {
        this.jumpTime++;
        this.upAccel = 10 * (1 - Math.pow(this.jumpTime/this.maxJumpTime, 2));
      }

      if(this.upAccel > -gravity) {
        this.y -= this.upAccel;
        this.upAccel--;
      }
      if (this.y > ground) {
        this.y = ground;
        this.jumpTime = 0;
      }

      this.weapon.update(mod);
  }

  this.render = function(context) {
    this.weapon.render(context);

    var lineOfSight = new vector2d(this.x + this.width/2, this.y - this.height, this.drone.x, this.drone.y);

    context.translate(this.x + this.width/2, this.y - this.height);
    context.drawImage(robotImage,220, 5, 198, 222, -this.width/2, 0, this.width, this.height);
    context.rotate(lineOfSight.angleRadians());
    if (this.x > this.drone.x) {
      context.translate(0, 30);
      context.drawImage(robotImage,188, 237, 173, 97, -this.width/2, -40, this.width, this.height/2);
      context.translate(0, -30);
    }
    else {
      context.drawImage(robotImage,5, 237, 173, 97, -this.width/2, -40, this.width, this.height/2);
    }

    context.rotate(-lineOfSight.angleRadians());
    context.translate(0, 30);
    context.rotate(lineOfSight.angleRadians());
    context.drawImage(robotImage,5, 5, 205, 93, -15, -15, this.width/1.3, this.height/2.8);
    context.rotate(-lineOfSight.angleRadians());
    context.translate(0, -30);
    context.translate(-(this.x + this.width/2), -(this.y - this.height));
  }
}
