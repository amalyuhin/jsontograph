/**
 * Created with JetBrains WebStorm.
 * User: amalyuhin
 * Date: 31.05.13
 * Time: 17:46
 * To change this template use File | Settings | File Templates.
 */

module("FR", {
    setup: function(){
        var g = new Graph();

        var v1 = new Vertex(1);
        var v2 = new Vertex(2);
        var v3 = new Vertex(3);
        var v4 = new Vertex(4);
        var v5 = new Vertex(5);

        var v6 = new Vertex(6);
        var v7 = new Vertex(7);
        var v8 = new Vertex(8);

        g.addVertex(v1);
        g.addVertex(v2);
        g.addVertex(v3);
        g.addVertex(v4);
        g.addVertex(v5);
        g.addVertex(v6);

        g.addEdge(v1, v2);
        g.addEdge(v2, v3);
        g.addEdge(v2, v5);
        g.addEdge(v3, v4);
        g.addEdge(v3, v5);
        g.addEdge(v4, v5);
        g.addEdge(v1, v4);

        g.addEdge(v5, v6);
        g.addEdge(v6, v7);
        g.addEdge(v7, v8);

        var canvas = document.createElement('canvas');
        canvas.setAttribute("width", "300");
        canvas.setAttribute("height", "300");

        this.layout = new FRLayout(canvas, g);
    }
});

test("Parameter k", function(){
    var layout = this.layout;
    var k = Math.sqrt(90000 / 6);

    equals(layout.k, k);
});

test("Fattr", function(){
    var layout = this.layout;
    var k = Math.sqrt(90000 / 6);

    var p1 = new Point(10, 10);
    var p2 = new Point(100, 100);
    var disp = p1.subtract(p2).magnitude();

    var Fattr = layout.fa(disp);

    equals(Fattr, Math.pow(disp, 2) / k);
});

test("Frep", function(){
    var layout = this.layout;
    var k = Math.sqrt(90000 / 6);

    var p1 = new Point(10, 10);
    var p2 = new Point(100, 100);
    var disp = p1.subtract(p2).magnitude();

    var Frep = layout.fr(disp);

    equals(Frep, Math.pow(k, 2) / disp);
});

test("iterations", function(){
    var layout = this.layout;

    var iter = 0;
    while (layout.t > 0) {
        iter++;
        layout.step();
    }

    equals(iter, 900);
});

test("boundsOut", function(){
    expect(2);

    var graph = new Graph();

    var v = new Vertex(1);
    v.pos.x = 1000;
    v.pos.y = 100;

    var u = new Vertex(2);
    u.pos.x = 100;
    u.pos.y = 1000;

    graph.addVertex(v);
    graph.addVertex(u);

    var canvas = document.createElement('canvas');
    canvas.setAttribute("width", "500");
    canvas.setAttribute("height", "500");

    var layout = new FRLayout(canvas, graph);
    layout.step();

    equals(v.pos.x, (500 - v.radius));
    equals(u.pos.y, (500 - v.radius));
});