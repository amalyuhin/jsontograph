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

test("process", function(){
    var layout = this.layout;

    layout.coarsening();

    var graph = layout.graph;
    var length = layout.graphCollection.length - 1;

    for (var m = layout.graphCollection.length - 1; m >= 0; m--) {
        console.log('l:', m);

        for (var n = layout.graphCollection[m].vertices.length; n >= 0; n--) {
            var q = layout.graphCollection[m].vertices[n];
            if (typeof q === 'undefined') continue;

            console.log('   ', q.id, ':', q.label);

        }
    }

    console.log('--------------------');

    for (var i = 0; i < layout.graph.vertices.length; i++) {
        var v = layout.graph.getNode(i);
        if (typeof v === 'undefined') continue;

        if (v.isCluster) {
            console.log('node:', v.id, v.label);
            console.log('   ', 'target1:', v.clusterData.targets[0].node.id, v.clusterData.targets[0].node.label);
            console.log('   ', 'neighbors1:', v.clusterData.targets[0].neighbors);
            console.log('   ', 'target2:', v.clusterData.targets[1].node.id, v.clusterData.targets[1].node.label);
            console.log('   ', 'neighbors2:', v.clusterData.targets[1].neighbors);
        }
    }

    function addClusterNeighbors(g, v, adjacencies) {
        console.log('graph:');
        for (var w = 0; w < g.vertices.length; w++) {
            var p = g.getNode(w);

            if (typeof p !== 'undefined') {
                console.log('   ', 'node:', p.id, p.label);
            }
        }

        for (var i = 0; i < g.vertices.length; i++) {
            var u = g.getNode(i);
            if (typeof u === 'undefined' || v.id === u.id) continue;

            var e = adjacencies[u.id];

            if (typeof e !== 'undefined' && !g.hasEdge(v.id, u.id)) {
                console.log('add edge:', v.label, ' - ', u.label);
                g.addEdge(v, u, e);

            } else if (g.hasEdge(v.id, u.id) && typeof e === 'undefined') {
                console.log('remove edge:', v.label, ' - ', u.label);
                g.removeEdge(v.id, u.id);
            }
        }
    }

    for (var p = layout.graphCollection.length-1; p > 0; p--) {
        var graphForVertices = layout.graphCollection[p];

        console.log('level:', p);

        for (var i = graphForVertices.vertices.length-1; i >= 0; i--) {

            var cluster = graphForVertices.vertices[i];
            if (typeof cluster === 'undefined') continue;

            if (cluster.isCluster && cluster.clusterData.level === p &&
                typeof graph.getNode(cluster.clusterData.targets[0].node.id) === 'undefined' &&
                typeof graph.getNode(cluster.clusterData.targets[1].node.id) === 'undefined'
            ) {
                var v = new Vertex(cluster.clusterData.targets[0].node.label);

                console.log('cluster:', cluster.id, cluster.label);

                v.id = cluster.clusterData.targets[0].node.id;
                /*v.isCluster = cluster.targets[0].node.isCluster;
                v.targets = cloner.clone(cluster.targets[0].node.targets);*/
                v.pos = new Point(cluster.pos.x, cluster.pos.y);
                v.setWeight(cluster.clusterData.targets[0].node.weight);
                graph.vertices[v.id] = v;
                graph.verticesCount++;

                console.log('add node', v.id, v.label);

                var u = new Vertex(cluster.clusterData.targets[1].node.label);

                u.id = cluster.clusterData.targets[1].node.id;
              /*  u.isCluster = cluster.targets[1].node.isCluster;
                u.targets = cloner.clone(cluster.targets[1].node.targets);*/
                u.pos = new Point(cluster.pos.x, cluster.pos.y);
                u.setWeight(cluster.clusterData.targets[1].node.weight);
                graph.vertices[u.id] = u;
                graph.verticesCount++;

                console.log('add node', u.id, u.label);

                var adjacencies1 = cloner.clone(cluster.clusterData.targets[0].neighbors);
                var adjacencies2 = cloner.clone(cluster.clusterData.targets[1].neighbors);

                graph.removeVertex(cluster.id);

                console.log('renove node', cluster.id, cluster.label);

                addClusterNeighbors(graph, v, adjacencies1);
                addClusterNeighbors(graph, u, adjacencies2);

                console.log('--------------------');
            }
        }

        for (var i = 0; i < layout.graph.vertices.length; i++) {
            var v = layout.graph.getNode(i);
            if (typeof v === 'undefined') continue;

            console.log('node:', v.id, v.label);
            console.log('   ', 'is_cluster:', v.isCluster);
            console.log('   ', 'targets:', v.targets);
        }

        console.log('*********************');
    }
});