function FRLayout(canvas, graph) {
    console.time('Algorithm execution');

    Layout.call(this, [canvas, graph]);

    this.graph = graph;
    this.area = this.canvasWidth * this.canvasHeight;
    this.k = Math.sqrt(this.area / graph.vertices.length);
    this.t = 0.9;
}

FRLayout.prototype = {
    fr: function (x) {
        return (this.k * this.k) / x;
    },

    fa: function (x) {
        return (x * x) / this.k;
    },

    step: function () {
        var graph = this.graph;
        var w = this.canvasWidth;
        var h = this.canvasHeight;

        for (var i = 0; i < graph.vertices.length; i++) {
            var v = graph.vertices[i];
            v.disp.x = 0;
            v.disp.y = 0;

            for (var j = 0; j < graph.vertices.length; j++) {
                if (i === j) continue;

                var u = graph.vertices[j];
                var diff = v.pos.subtract(u.pos);
                v.disp = v.disp.add(diff.normalize().multiply(this.fr(diff.magnitude())));
            }
        }

        //console.log(graph.vertices[0].label+' x: '+graph.vertices[0].pos.x+'; y: '+graph.vertices[0].pos.y);

        for (var l = 0; l < graph.edges.length; l++) {
            var e = graph.edges[l];
            var diff = e.v.pos.subtract(e.u.pos);

            e.v.disp = e.v.disp.subtract(diff.normalize().multiply(this.fa(diff.magnitude())));
            e.u.disp = e.u.disp.add(diff.normalize().multiply(this.fa(diff.magnitude())));
        }

        for (var k = 0; k < graph.vertices.length; k++) {
            var v = graph.vertices[k];
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

        this.t -= 0.001;

        if (this.t < 0.01) {
            this.stop();
            console.timeEnd('Start algorithm execution');
        }
    },

    run: function () {
        //if (!window.Worker) {
        console.time('Start algorithm execution');

        var self = this;
        var animate = function () {
            self.reqAnimId = requestAnimationFrame(animate);
            self.redraw();
            self.step();
        };

        animate();

        /*} else {
            console.time('Algorithm execution');
            console.profile();

            var worker = new Worker("js/worker.js");

            var self = this;
            var animate = function () {
                self.reqAnimId = requestAnimationFrame(animate);
                self.redraw();
                //self.step();

                worker.postMessage({
                    graph: self.graph,
                    w: self.canvasWidth,
                    h: self.canvasHeight,
                    t: self.t,
                    k: self.k
                });

                worker.onmessage = function (event) {
                    var graph = event.data.graph;

                    for (var i = self.graph.vertices.length - 1; i >= 0; i--) {
                        var v = self.graph.vertices[i];
                        v.changePosition(graph.vertices[i].pos.x, graph.vertices[i].pos.y);
                    }
                };

                self.t -= 0.001;
                if (self.t < 0.01) {
                    self.stop();
                }
            };

            animate();
        }*/
    }
};

inherit(FRLayout, Layout);