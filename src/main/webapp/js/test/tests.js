/**
 * Created with JetBrains WebStorm.
 * User: amalyuhin
 * Date: 23.05.13
 * Time: 5:35
 * To change this template use File | Settings | File Templates.
 */

module('Walshaw');
test("coarsening", function(){
    var g = new Graph();

    var v1 = new Vertex(1);
    var v2 = new Vertex(2);
    var v3 = new Vertex(3);
    var v4 = new Vertex(4);
    var v5 = new Vertex(5);

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

    var layout = new WalshawLayout(document.createElement('canvas'), g);
    layout.coarsening();

    equals(layout.graph.verticesCount, 2);
});
