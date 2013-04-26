/**
 * Created with JetBrains PhpStorm.
 * User: Andrey
 * Date: 21.09.12
 * Time: 1:07
 * To change this template use File | Settings | File Templates.
 */

function Layout(canvas, graph) {
    this.canvas = canvas;
    this.context = canvas[0].getContext("2d");
    this.canvasWidth = canvas[0].getAttribute('width');
    this.canvasHeight = canvas[0].getAttribute('height');

    this.graph = graph;

    this.msec = 10;
    this.animateInterval = 0;
    this.scale = 1;
    this.originx = 0;
    this.originy = 0;

    this.reqAnimId = null;

    this.eventListeners = [];
}

Layout.prototype = {
    zoom: function (originx, originy, scale) {
        this.scale = scale;
        this.originx = originx;
        this.originy = originy;
    },

    clear: function () {
        this.context.clearRect(this.originx, this.originy, this.canvasWidth / this.scale, this.canvasHeight / this.scale);
    },

    draw: function () {
        var ctx = this.context;

        for (var i = this.graph.edges.length - 1; i >= 0; i--) {
            var e = this.graph.edges[i];

            ctx.strokeStyle = e.options.lineColor;
            if (e.isSelected) {
                ctx.globalAlpha = 1;
                ctx.lineWidth = e.options.selectedLineWidth;
            } else {
                ctx.lineWidth = e.options.lineWidth;
            }

            ctx.beginPath();

            ctx.moveTo(e.v.pos.x, e.v.pos.y);
            ctx.lineTo(e.u.pos.x, e.u.pos.y);

            ctx.stroke();
        }

        ctx.beginPath();
        ctx.textAlign = "center";
        for (var j = this.graph.vertices.length; j >= 0; j--) {
            var v = this.graph.vertices[j];

            if (typeof v === 'undefined') continue;

            var buffer = document.createElement('canvas');
            buffer.width = 2 * v.radius;
            buffer.height = 2 * v.radius;
            var buffer_context = buffer.getContext('2d');

            buffer_context.arc(v.radius, v.radius, v.radius, 0, Math.PI * 2, false);
            if (v.isSelected) {
                buffer_context.fillStyle = v.options.selectedFillStyle
            } else {
                buffer_context.fillStyle = v.options.fillStyle;
            }
            buffer_context.fill();

            ctx.save();
            ctx.translate(v.pos.x - v.radius, v.pos.y - v.radius);
            ctx.drawImage(buffer, 0, 0);
            ctx.restore();
        }
        ctx.stroke();
    },

    redraw: function () {
        this.clear();
        this.draw();
    },

    step: function () {

    },

    run: function () {
        console.time('Start algorithm execution.');
        console.profile();

        var self = this;
        var animate = function () {
            self.reqAnimId = requestAnimationFrame(animate);
            self.redraw();
            self.step();
        };

        animate();
    },

    stop: function () {
        /*var self = this;
         clearInterval(self.animateInterval);
         console.timeEnd('Algorithm execution');*/

        if (this.reqAnimId) {
            cancelRequestAnimationFrame(this.reqAnimId);
            this.reqAnimId = null;

            console.profileEnd();
            console.timeEnd('Stop algorithm execution.');
        }
    }
};


function inherit(Child, Parent) {
    var F = function () {
    };
    F.prototype = Parent.prototype;
    var f = new F();

    for (var prop in Child.prototype) f[prop] = Child.prototype[prop];
    Child.prototype = f;
    Child.prototype.super = Parent.prototype;
}