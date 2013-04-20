function labelBox(canvas, labelColors) {
  this.canvas = canvas;
  this.context = canvas.getContext("2d");
  this.canvasWidth = canvas.getAttribute('width');
  this.canvasHeight = canvas.getAttribute('height');

  this.labelColors = labelColors;

  this.boxHeight = 0;
  this.boxOffsetX = 0;
  this.boxOffsetTop = 0;

  this.init();
}

labelBox.prototype = {
  init: function () {
    this.boxHeight = 15;
    this.boxOffsetX = 30;
    this.boxOffsetTop = 5; 
  },

  draw: function() {
    var top = this.boxOffsetX;
    var width = 0;
    var i = 1;
    for (var label in this.labelColors) {
      var color = this.labelColors[label];

      top = (this.boxHeight + this.boxOffsetTop)*i;

      var tmpWidth = this.context.measureText(label).width + this.boxOffsetX;
      if (tmpWidth > width) {
        width = tmpWidth;
      }

      if ((top+this.boxHeight) > this.canvasHeight) {
        this.boxOffsetX += width;
        i = 0;
      }

      this.drawshape(this.boxOffsetX, top, label, color);
      i++;
    }
  },

  drawshape: function(x, y, label, color) {
    var ctx = this.context;

    ctx.fillRect(x, y, this.boxHeight, this.boxHeight);  

    ctx.beginPath();
    ctx.rect(x, y, this.boxHeight, this.boxHeight);    
    ctx.fillStyle = color;
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, (x+this.boxHeight+10), (y+this.boxHeight/2));
  }
};