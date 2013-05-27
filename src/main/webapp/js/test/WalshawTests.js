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
    layout.extending();

    equals(layout.graph.getVerticesCount(), 5);
});

test("extendingAdvantage", function(){
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
                if (typeof graph.getNode(node.targets[0].id) === 'undefined' && typeof graph.getNode(node.targets[1].id) === 'undefined') {
                    var v = new Vertex(node.targets[0].label);
                    v.id = node.targets[0].id;
                    v.pos.x = node.pos.x;
                    v.pos.y = node.pos.y;
                    v.setWeight(node.targets[0].weight);
                    graph.vertices[v.id] = v;
                    graph.verticesCount++;

                    var u = new Vertex(node.targets[1].label);
                    u.id = node.targets[1].id;
                    u.pos.x = node.pos.x;
                    u.pos.y = node.pos.y;
                    u.setWeight(node.targets[1].weight);
                    graph.vertices[u.id] = u;
                    graph.verticesCount++;

                    graph.removeVertex(node.id);
                }
            }
        }

        var graphForEdges = layout.graphCollection[l];

        for (var j = graphForEdges.vertices.length-1; j >= 0; j--) {
            if (typeof graph.vertices[j] === 'undefined' || typeof graphForEdges.vertices[j] === 'undefined') continue;

            for (var k = graphForEdges.vertices.length-1; k >= 0; k--) {
                if (j === k || typeof graph.vertices[k] === 'undefined' || typeof graphForEdges.vertices[k] === 'undefined') continue;

                if (hasEdge(graphForEdges, j, k) && !hasEdge(graph, j, k)) {
                    var e = getEdge(graphForEdges, j, k);

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

test("process", function() {
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
    //layout.extending();

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

    function step(layout, k) {
        var graph = layout.graph;
        var verticesNb = graph.vertices.length;
        var disp, diff;

        for (var t = 0; t < verticesNb; t++) {
            var q = graph.getNode(t);
            if (typeof q === 'undefined') continue;

            console.log(q.id, ':', q.pos.x, q.pos.y);
        }

        console.log('=========================');

        while (!layout.converged) {
            layout.converged = true;

            for (var i = 0; i < verticesNb; i++) {
                var v = graph.getNode(i);
                if (typeof v === 'undefined') continue;

                disp = new Point(0, 0);

                console.log('=========Loop1==========');
                for (var j = 0; j < verticesNb; j++) {
                    var u = graph.getNode(j);
                    if (typeof u === 'undefined' || i === j) continue;

                    diff =  u.pos.subtract(v.pos);
                    disp = disp.add(diff.normalize().multiply(layout.fr(diff.magnitude(), u.getWeight())));

                    console.log('diff', j, ':', diff.x, diff.y);
                    console.log('disp', j, ':', disp.x, disp.y);

                    if (isNaN(disp.x) || isNaN(disp.y)) {
                        console.log('   ', diff.normalize().x, diff.normalize().y);
                        console.log('   ', diff.magnitude());
                        console.log('   ', u.getWeight());
                        console.log('   ', layout.fr(0, 1));
                        console.log('   ', layout.fr(diff.magnitude(), u.getWeight()));
                    }
                }
                console.log('=========================');

                console.log('=========Loop2==========');
                for (var l = 0; l < verticesNb; l++) {
                    var n = graph.getNode(l);
                    if (typeof n === 'undefined' || !graph.hasEdge(v.id, n.id)) continue;

                    diff = n.pos.subtract(v.pos);
                    disp = disp.add(diff.normalize().multiply(layout.fa(diff.magnitude())));

                    console.log('diff', l, ':', diff.x, diff.y);
                    console.log('disp', l, ':', disp.x, disp.y);
                }
                console.log('=========================');

                var damping = Math.min(layout.t, disp.magnitude());
                var newPos = v.pos.add(disp.normalize().multiply(damping));
                var delta = newPos.subtract(v.pos);


                if (delta.magnitude() > (k * 0.01)) layout.converged = false;
                v.updatePosition(newPos);
                console.log(v.pos.x, ':', v.pos.y);
            }

            console.log(k);
            console.log("--------------------");
        }
    }

    var graph = layout.graph;
    var length = layout.graphCollection.length - 1;

    for (var l = length; --l >= 0;) {
        var graphForVertices = layout.graphCollection[l+1];

        for (var i = graphForVertices.vertices.length-1; i >= 0; i--) {
            var node = graphForVertices.vertices[i];
            if (typeof node === 'undefined') continue;

            if (node.isCluster &&
                typeof graph.getNode(node.targets[0].id) === 'undefined' &&
                typeof graph.getNode(node.targets[1].id) === 'undefined'
                ) {
                var v = new Vertex(node.targets[0].label);
                v.id = node.targets[0].id;
                v.pos = new Point(node.pos.x + ((Math.random() - 0.5)*5), node.pos.y + ((Math.random() - 0.5)*5));
                v.setWeight(node.targets[0].weight);
                graph.vertices[v.id] = v;
                graph.verticesCount++;

                var u = new Vertex(node.targets[1].label);
                u.id = node.targets[1].id;
                u.pos = new Point(node.pos.x + ((Math.random() - 0.5)*5), node.pos.y + ((Math.random() - 0.5)*5));
                u.setWeight(node.targets[1].weight);
                graph.vertices[u.id] = u;
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
                    var e = getEdge(graphForEdges, j, k);

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

        layout.k = layout.k * Math.sqrt(4 / 7);

        step(layout, layout.k);
    }

    delete this.graphCollection;
});