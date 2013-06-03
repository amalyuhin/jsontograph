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
        var v2 = new Vertex(4);
        var v3 = new Vertex(3);
        var v4 = new Vertex(2);
        var v5 = new Vertex(5);

        g.addVertex(v1);
        g.addVertex(v2);
        g.addVertex(v3);
        g.addVertex(v4);
        g.addVertex(v5);

        v1.setWeight(1);
        v2.setWeight(4);
        v3.setWeight(3);
        v4.setWeight(2);
        v5.setWeight(5);

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

test("getFirstNeighbor", function(){
    var layout = this.layout;
    var v2 = layout.graph.getNode(1);

    equals(layout.getFirstNeighbor(0).id, v2.id);
});

test("getMinWeightNeighbor", function(){
    var layout = this.layout;
    var v4 = layout.graph.getNode(3);

    equals(layout.getMinWeightNeighbor(0).id, v4.id);
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

            console.log('options:', e);

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

test("run", function(){
    var layout = this.layout;

    layout.coarsening();
    layout.extending();

    var iter = 0;
    while (iter <= layout.maxIterations) {
        layout.step(0.9);
        iter++;
        console.log(iter);
    }

    layout.redraw();

});

test("array copy", function(){
    var graph = this.layout.graph;
    var startTime, endTime, i;

    function debug(arr) {
        for (var i = 0, len = arr.length; i < len; i++) {
            console.log(i, ':', arr[i]);
        }
        console.log('-----------------');
    }

    startTime = Date.now();
    for (i = 0; i < 1000; i++) {
        var arr1 = cloner.clone(graph.vertices);
    }
    endTime = Date.now();
    console.log("Clone copy:", (endTime - startTime), "ms");
    debug(arr1);

    startTime = Date.now();
    for (i = 0; i < 1000; i++) {
        var arr2 = JSON.parse(JSON.stringify(graph.vertices));
    }
    endTime = Date.now();
    console.log("JSON.parse copy:", (endTime - startTime), "ms");
    debug(arr2);
});

test("clone", function(){
    var graph = this.layout.graph;
    var startTime, endTime, i;

    startTime = Date.now();
    for (i = 0; i < 1000; i++) {
        var g1 = cloner.clone(graph);
    }
    endTime = Date.now();
    console.log("Clone all graph:", (endTime - startTime), "ms");

    startTime = Date.now();
    for (i = 0; i < 1000; i++) {
        var g2 = {
            vertices: cloner.clone(graph.vertices),
            edges: cloner.clone(graph.edges),
            edgesMap: cloner.clone(graph.edgesMap)
        };
    }
    endTime = Date.now();
    console.log("Clone some properties:", (endTime - startTime), "ms");
});

test("random graph", function(){
    expect(4);

    var g1 = Graph.random(301);
    var g2 = Graph.random(1000, 700);

    equals(g1.vertices.length, 301);
    equals(g1.edges.length, 300);
    equals(g2.vertices.length, 1000);
    equals(g2.edges.length, 700);
});

test("graph cloning", function(){
    var g = Graph.random(301, 300);
    var collection = [];

    for (var i = 0; i < 100; i++) {
        collection.push(cloner.clone(g));
    }
});

test("algorithm", function() {
    var graph = Graph.random(3, 3);
    var layout = new WalshawLayout(document.createElement('canvas'), graph);

    var iter = 0;
    graph.edges.forEach(function(e){
        iter++;
        console.log(iter, 'Edge:', e.v.id, '-', e.u.id);
    });

    console.log('----------------');
    graph.edgesMap.forEach(function(v, i){
        v.forEach(function(u, j){
            console.log(i, j, u);
        });
    });
    console.log('----------------');

    function coarsening() {
        var vertexCount = graph.getVerticesCount();
        var isMarked = [];

        // Добавляем исходный граф в коллекцию
        layout.addGraph(graph);

        // Повторяем, пока количество вершин больше 2
        var level = 1;
        while (vertexCount > 2) {
            var count = vertexCount;
            var i;

            graph.vertices.forEach(function(v){
                isMarked[v.id] = false;
            });

            console.log('level:', level);

            for (i = graph.vertices.length-1; i >= 0; i--) {
                var v = graph.getNode(i);
                if (v === undefined || isMarked[v.id] === true) continue;

                isMarked[v.id] = true;

                var neighbor = layout.getMinWeightNeighbor(v.id);
                if (neighbor === null) {
                    console.log(v.id, 'has no neighbors');
                    graph.edges.forEach(function(e){
                        if (e.v.id === v.id || e.u.id === v.id) {
                            console.log('   ', u.id, u.label);
                        }
                    });
                }

                if (neighbor !== null && !isMarked[neighbor.id]) {
                    // Помечаем вершины
                    isMarked[neighbor.id] = true;

                    var cluster = new Vertex(v.label + ":" + neighbor.label);
                    cluster.isCluster = true;

                    var targets = [];
                    targets.push({node: cloner.clone(v)});
                    targets.push({node: cloner.clone(neighbor)});

                    cluster.clusterData = {
                        level: level,
                        targets: targets
                    };

                    graph.addVertex(cluster);

                    cluster.setWeight(v.getWeight() + neighbor.getWeight());
                    cluster.pos = v.pos.center(neighbor.pos);

                    isMarked[cluster.id] = true;

                    for (var k = graph.vertices.length-1; k >= 0; k--) {
                        if (i === k || k === neighbor.id) continue;

                        var u = graph.getNode(k);
                        if (u === undefined) continue;

                        // Добавляем ребра которых не хватает
                        if (!graph.addEdge(cluster.id, u.id) &&
                            graph.hasEdge(v.id, u.id) || graph.hasEdge(neighbor.id, u.id)
                        ) {
                            console.log('add edge', cluster.id, u.id);
                            graph.addEdge(cluster, u);
                        }
                    }

                    graph.removeVertex(neighbor.id);
                    graph.removeVertex(v.id);
                }
            }

            // Добавляем полученный граф в коллекцию
            layout.addGraph(graph);
            level++;

            vertexCount = graph.getVerticesCount();
            if (count === vertexCount) {
                break;
            }
        }

        /*var v1, v2;
        for (var key in graph.vertices) if (graph.vertices.hasOwnProperty(key)) {
            graph.vertices[key].pos = Point.random();

            if (!v1) {
                v1 = graph.vertices[key].pos;
            } else {
                v2 = graph.vertices[key].pos;
            }
        }

        layout.k = v1.subtract(v2).magnitude();*/

        if (vertexCount > 2) {
            throw "Граф не является связным. Процесс будет завершен.";
        }

        var initPos = [];
        graph.vertices.forEach(function(v){
            v.updatePosition(Point.random());
            initPos.push(v.pos);
        });

        console.log(initPos.length);

        for (i = 0; i < graph.vertices.length; i++) {
            var v = graph.getNode(i);
            if (v === undefined) continue;

            console.log('node: ', 'id:', v.id, 'marked:', isMarked[v.id], 'label:', v.label);
        }
    }

    coarsening();

    equals(graph.getVerticesCount(), 2);
});