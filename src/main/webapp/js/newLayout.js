Layout = function(canvId, graph, options) {	
  this.graph = graph;
  
  options = optioins || {};

  var canv = document.getElementById(canvId);

  this.canvWidth = canv.getAttribute('width');
  this.canvHeight = canv.getAttribute('height');
  this.canvasId = canvId;
  this.context = canv.getContext("2d");

  this.msec = 10;
  this.animateInterval;
};

Layout.prototype = {
  clear: function(){
    this.context.clearRect(0, 0, this.canvWidth, this.canvHeight);
  },

  draw: function(){
    ctx.save();
    ctx.beginPath();

    this.graph.edges.forEach(function(e){
        ctx.moveTo(e.v.pos.x, e.v.pos.y);
        ctx.lineTo(e.u.pos.x, e.u.pos.y);
    });

    ctx.stroke();
    ctx.restore();
    
    this.graph.vertices.forEach(function(v){
        /* ctx.beginPath();
         ctx.arc(v.pos.x, v.pos.y, 10, 0, Math.PI * 2, false);
         ctx.closePath();
         ctx.fill();*/
        ctx.save();

        ctx.textAlign = 'center';
        ctx.font="14px Arial";
        ctx.translate(v.pos.x, v.pos.y);
        //ctx.rotate(Math.atan2(dy,dx));
        ctx.fillText(v.label,0,0);
        ctx.restore();
    });  
  },

  step: function(){
    
  },

  run: function(){
    var self = this;

    self.animateInterval = setInretval(function(){
      self.clear();
      self.step();
      self.draw();    
    }, self.msec);
  }
};