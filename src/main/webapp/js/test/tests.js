/**
 * Created with JetBrains WebStorm.
 * User: amalyuhin
 * Date: 23.05.13
 * Time: 5:35
 * To change this template use File | Settings | File Templates.
 */

module("Walshaw");
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

    equals(layout.graph.getVerticesCount(), 2);
});

test("extending", function(){
    function hasEdge(g, vId, uId) {
        return ((typeof(g.edgesMap[vId]) !== 'undefined' && g.edgesMap[vId][uId] === true) ||
        (typeof(g.edgesMap[uId]) !== 'undefined' && g.edgesMap[uId][vId] === true));
    }

    function getEdge(g, vId, uId) {
        var edgesLength = g.edges.length;

        for (var i = 0; i < edgesLength; i++) {
            var e = g.edges[i];
            if (typeof e === 'undefined') continue;

            if ((e.v.id === vId && e.u.id === uId) || (e.v.id === uId && e.u.id === vId)) {
                return e;
            }
        }

        return null;
    }

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

    var graph = layout.graph;
    var length = layout.graphCollection.length - 1;

    for (var l = length; --l >= 0;) {

        var graphForVertices = layout.graphCollection[l+1];
        var verticesNb = graphForVertices.vertices.length;

        for (var i = 0; i < verticesNb; i++) {

            var node = graphForVertices.vertices[i];
            if (typeof node === 'undefined') continue;

            if (node.isCluster) {
                var v = new Vertex(node.targets[0].label);
                v.id = node.targets[0].id;
                v.pos.x = node.pos.x;
                v.pos.y = node.pos.y;
                v.setWeight(node.targets[0].weight);

                var u = new Vertex(node.targets[1].label);
                u.id = node.targets[1].id;
                u.pos.x = node.pos.x;
                u.pos.y = node.pos.y;
                u.setWeight(node.targets[1].weight);

                graph.vertices[v.id] = v;
                graph.vertices[u.id] = u;
                graph.verticesCount++;
                graph.verticesCount++;

                graph.removeVertex(node.id);
            }
        }

        var graphForEdges = layout.graphCollection[l];

        for (var j = graphForEdges.vertices.length-1; j >= 0; j--) {
            if (typeof graph.vertices[j] === 'undefined' || typeof graphForEdges.vertices[j] === 'undefined') continue;

            for (var k = graphForEdges.vertices.length-1; k >= 0; k--) {
                if (j === k || typeof graph.vertices[k] === 'undefined' || typeof graphForEdges.vertices[k] === 'undefined') continue;

                if (hasEdge(graphForEdges, j, k) && !hasEdge(graph, j, k)) {
                    var e = getEdge(g, j, k);

                    if (e) {
                        graph.addEdge(graph.vertices[j], graph.vertices[k], e.options);
                    } else {
                        graph.addEdge(graph.vertices[j], graph.vertices[k]);
                    }
                }

                if (!hasEdge(graphForEdges, j, k) && hasEdge(graph, j, k)) {
                    graph.removeEdge(j, k);
                }
            }
        }

        for (var t=0; t<graph.vertices.length; t++) {
            var tmp = graph.getNode(t);
            if (typeof tmp === 'undefined') continue;

            console.log(tmp.label, ':', tmp.pos.x, ',', tmp.pos.y);
        }

        console.log('-----------------------------');
    }

    equals(layout.graph.getVerticesCount(), 5);
});