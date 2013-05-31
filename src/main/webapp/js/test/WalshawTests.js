/**
 * Created with JetBrains WebStorm.
 * User: amalyuhin
 * Date: 23.05.13
 * Time: 5:35
 * To change this template use File | Settings | File Templates.
 */

module("Walshaw", {
    setup: function(){
        var g = new Graph();

        var v1 = new Vertex(1);
        var v2 = new Vertex(2);
        var v3 = new Vertex(3);
        var v4 = new Vertex(4);
        var v5 = new Vertex(5);

        v1.setWeight(1);
        v2.setWeight(2);
        v3.setWeight(3);
        v4.setWeight(4);
        v5.setWeight(5);

        g.addVertex(v1);
        g.addVertex(v2);
        g.addVertex(v3);
        g.addVertex(v4);
        g.addVertex(v5);

        g.addEdge(v1, v2);
        g.addEdge(v2, v3);
        g.addEdge(v2, v5);
        g.addEdge(v3, v4);
        g.addEdge(v3, v5);
        g.addEdge(v4, v5);
        g.addEdge(v1, v4);

        this.layout = new WalshawLayout(document.createElement('canvas'), g);
    }
});

test("Fattr", function(){
    var layout = this.layout;
    layout.k = 0.05;

    var p1 = new Point(10, 10);
    var p2 = new Point(100, 100);
    var disp = p1.subtract(p2).magnitude();

    var Fattr = layout.fa(disp);

    equals(Fattr, Math.pow(disp, 2) / 0.05);
});

test("Frep", function(){
    var layout = this.layout;
    layout.k = 0.05;

    var p1 = new Point(10, 10);
    var p2 = new Point(100, 100);
    var disp = p1.subtract(p2).magnitude();
    var w = 1;

    var Fattr = layout.fr(disp, w);

    equals(Fattr, (-0.2 * w * Math.pow(0.05, 2) / disp));
});

test("getMinWeightNeighbor", function(){
    var layout = this.layout;
    var v2 = layout.graph.getNode(1);

    equals(layout.getMinWeightNeighbor(0).id, v2.id);
});

test("coarsening", function(){
    var layout = this.layout;

    layout.coarsening();

    equals(layout.graph.getVerticesCount(), 2);
});

test("extending", function(){
    var layout = this.layout;

    layout.coarsening();
    layout.extending();

    equals(this.layout.graph.getVerticesCount(), 5);
});