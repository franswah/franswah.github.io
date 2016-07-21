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

  this.angleRadians = function() {
    if (this.length() == 0 || this.x1 - this.x2 == 0) return 0;
    return Math.atan2((this.y2 - this.y1), (this.x2 - this.x1));
  };
}
