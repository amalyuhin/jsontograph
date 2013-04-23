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
        this.super.step();

        var graph = this.graph;
        var diff;
        var w = this.canvasWidth;
        var h = this.canvasHeight;

        //console.log(graph.vertices[0].label+' x: '+graph.vertices[0].pos.x+'; y: '+graph.vertices[0].pos.y);

        for (var i = 0; i < graph.vertices.length; i++) {
            var v = graph.vertices[i];
            v.disp.x = 0;
            v.disp.y = 0;

            for (var j = 0; j < graph.vertices.length; j++) {
                if (i === j) continue;

                var u = graph.vertices[j];
                diff = v.pos.subtract(u.pos);
                v.disp = v.disp.add(diff.normalise().multiply(this.fr(diff.magnitude())));
            }
        }

        //console.log(graph.vertices[0].label+' x: '+graph.vertices[0].pos.x+'; y: '+graph.vertices[0].pos.y);

        for (var l = 0; l < graph.edges.length; l++) {
            var e = graph.edges[l];
            diff = e.v.pos.subtract(e.u.pos);

            e.v.disp = e.v.disp.subtract(diff.normalise().multiply(this.fa(diff.magnitude())));
            e.u.disp = e.u.disp.add(diff.normalise().multiply(this.fa(diff.magnitude())));
        }

        //console.log(graph.vertices[0].label+' x: '+graph.vertices[0].pos.x+'; y: '+graph.vertices[0].pos.y);

        for (var k = 0; k < graph.vertices.length; k++) {
            var v = graph.vertices[k];
            var damping = Math.min(v.disp.magnitude(), this.t);

            v.pos = v.pos.add(v.disp.normalise().multiply(damping));
            /*v.pos.x = Math.min((w-10), Math.max(10, v.pos.x));
             v.pos.y = Math.min((h-10), Math.max(10, v.pos.y)); */

            var newPos = {
                x: Math.min((w - 10), Math.max(10, v.pos.x)),
                y: Math.min((h - 10), Math.max(10, v.pos.y))
            }
            v.changePosition(newPos.x, newPos.y);
        }

        //console.log(graph.vertices[0].label+' x: '+graph.vertices[0].pos.x+'; y: '+graph.vertices[0].pos.y);

        this.t -= 0.001;

        if (this.t < 0.01) {
            this.stop();
        }
    }
};

inherit(FRLayout, Layout);