function FRLayout(canvas, graph) {
    console.time('Algorithm execution');

    Layout.call(this, [canvas, graph]);

    this.graph = graph;

    this.area = this.canvasWidth * this.canvasHeight;
    this.k = Math.sqrt(this.area / graph.vertices.length);

    this.t = 7;
    this.dt = 0.07;
}

FRLayout.prototype = {
    fr: function (x) {
        return (this.k * this.k) / x;
    },

    fa: function (x) {
        return (x * x) / this.k;
    },

    cool: function () {
        var t = this.t - this.dt;
        this.t = t.toFixed(3);
    },

    step: function () {
        var graph = this.graph;
        var w = this.canvasWidth;
        var h = this.canvasHeight;
        var v, diff;

        for (var i = 0; i < graph.vertices.length; i++) {
            v = graph.vertices[i];
            v.disp.x = 0;
            v.disp.y = 0;

            for (var j = 0; j < graph.vertices.length; j++) {
                if (i === j) continue;

                var u = graph.vertices[j];
                diff = v.pos.subtract(u.pos);
                v.disp = v.disp.add(diff.normalize().multiply(this.fr(diff.magnitude())));
            }
        }

        for (var l = 0; l < graph.edges.length; l++) {
            var e = graph.edges[l];
            diff = e.v.pos.subtract(e.u.pos);

            e.v.disp = e.v.disp.subtract(diff.normalize().multiply(this.fa(diff.magnitude())));
            e.u.disp = e.u.disp.add(diff.normalize().multiply(this.fa(diff.magnitude())));
        }

        for (var k = 0; k < graph.vertices.length; k++) {
            v = graph.vertices[k];
            var damping = Math.min(v.disp.magnitude(), this.t);

            v.pos = v.pos.add(v.disp.normalize().multiply(damping));
            v.pos.x = Math.min((w-10), Math.max(10, v.pos.x));
            v.pos.y = Math.min((h-10), Math.max(10, v.pos.y));

            var newPos = {
                x: Math.min((w - 10), Math.max(10, v.pos.x)),
                y: Math.min((h - 10), Math.max(10, v.pos.y))
            };

            v.changePosition(newPos.x, newPos.y);
        }

        this.cool();
    },

    run: function () {
        console.time('Start algorithm execution');

        var self = this;
        var animate = function () {
            self.reqAnimId = requestAnimationFrame(animate);

            self.redraw();
            self.step();

            if (self.t < 0) {
                self.stop();
            }
        };

        animate();
    }
};

inherit(FRLayout, Layout);