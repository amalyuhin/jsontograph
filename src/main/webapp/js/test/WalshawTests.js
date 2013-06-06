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

test("run", function(){
    var graph = new Graph();
    var count = 100;

    for (var i = 0; i < count; i++) {
        graph.addVertex(new Vertex(i+1));
    }

    var v = graph.getNode(0);
    graph.vertices.forEach(function(u){
        if (v.id !== u.id) {
            graph.addEdge(v, u);
        }
    });

    var layout = new WalshawLayout(document.createElement('canvas'), graph);

    layout.coarsening();
    layout.extending();

    var iter = 0;
    while (iter <= layout.maxIterations) {
        layout.step(0.9);
        iter++;
        console.log(iter);
    }

    layout.graph.vertices.forEach(function(v){
        console.log('v:', v.id, v.pos.x, v.pos.y);
    });
    //layout.redraw();

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

test("dataTest", function(){
    expect(2);

    var graph = new Graph();
    var count = 10;

    for (var i = 0; i < count; i++) {
        graph.addVertex(new Vertex(i+1));
    }

    var v = graph.getNode(0);
    graph.vertices.forEach(function(u){
        if (v.id !== u.id) {
            graph.addEdge(v, u);
        }
    });

    var layout = new WalshawLayout(document.createElement('canvas'), graph);

    layout.coarsening();
    equals(graph.getVerticesCount(), 2);

    function cool (t) {
        return t * 0.001;
    }

    function step() {
        var graph = layout.graph;
        var verticesNb = graph.vertices.length;
        var oldPos = [];
        var v, u, delta, i, j;
        var t = 0.9;

        var converged = false;

        while (!converged) {
            converged = true;

            graph.vertices.forEach(function(node){
                oldPos[node.id] = new Point(node.pos.x, node.pos.y);
            });

            for (i = 0; i < verticesNb; i++) {
                v = graph.getNode(i);
                if (v === undefined) continue;

                var disp = new Point(0, 0);

                for (j = 0; j < verticesNb; j++) {
                    u = graph.getNode(j);
                    if (i === j || u === undefined) continue;

                    delta = u.pos.subtract(v.pos);
                    if (delta.magnitude() < 0.1) {
                        delta = new Point((0.1 + Math.random() * 0.1), (0.1 + Math.random() * 0.1));
                    }

                    var t1 = delta.normalize().multiply(layout.fr(delta.magnitude(), u.getWeight()));
                    disp = disp.add(t1);
                    console.log('t1:', t1.x, t1.y);
                }

                for (j = 0; j < verticesNb; j++) {
                    u = graph.getNode(j);
                    if (typeof u === 'undefined' || !graph.hasEdge(v.id, u.id)) continue;

                    delta = u.pos.subtract(v.pos);
                    if (delta.magnitude() < 0.1) {
                        delta = new Point((0.1 + Math.random() * 0.1), (0.1 + Math.random() * 0.1));
                    }

                    var t2 = delta.normalize().multiply(layout.fa(delta.magnitude()));
                    disp = disp.add(t2);
                    console.log('t2:', t2.x, t2.y);
                }

                //if (disp.magnitude() > 0) {
                var newPos = v.pos.add(disp.normalize().multiply(Math.min(t, disp.magnitude())));
                v.updatePosition(newPos);
                //}

                //console.log(v.pos.subtract(oldPos[v.id]).magnitude(), '>', (layout.k * 0.01), ":", (v.pos.subtract(oldPos[v.id]).magnitude() > (layout.k * 0.01)));

                if (v.pos.subtract(oldPos[v.id]).magnitude() > (0.0001)) {
                    converged = false;
                }
            }

            t = cool(t);
        }
    }

    function extending() {
        function hasEdge(g, vId, uId) {
            return ((g.edgesMap[vId] != undefined && g.edgesMap[vId][uId]) ||
                (g.edgesMap[uId] != undefined && g.edgesMap[uId][vId]));
        }

        function getEdge(g, vId, uId) {
            var edgesLength = g.edges.length;

            for (var i = 0; i < edgesLength; i++) {
                var e = g.edges[i];
                if (e === undefined) continue;

                if ((e.v.id === vId && e.u.id === uId) || (e.v.id === uId && e.u.id === vId)) {
                    return e;
                }
            }

            return null;
        }

        var graph = layout.graph;
        var minLevel = 0;
        var g;

        for (var l = layout.graphCollection.length - 1; l >= minLevel; l--) {
            g = layout.graphCollection[l];

            if (l > minLevel) {
                for (var i = g.vertices.length-1; i >= 0; i--) {
                    var cluster = g.vertices[i];
                    if (cluster === undefined) continue;

                    if (cluster.isCluster && cluster.clusterData.level === l &&
                        graph.getNode(cluster.clusterData.targets[0].node.id) === undefined &&
                        graph.getNode(cluster.clusterData.targets[1].node.id) === undefined
                        ) {
                        var v = new Vertex(cluster.clusterData.targets[0].node.label);

                        v.id = cluster.clusterData.targets[0].node.id;
                        v.pos = new Point(cluster.pos.x, cluster.pos.y);
                        v.setWeight(cluster.clusterData.targets[0].node.weight);
                        graph.vertices[v.id] = v;
                        graph.verticesCount++;

                        var u = new Vertex(cluster.clusterData.targets[1].node.label);

                        u.id = cluster.clusterData.targets[1].node.id;
                        u.pos = new Point(cluster.pos.x, cluster.pos.y);
                        u.setWeight(cluster.clusterData.targets[1].node.weight);
                        graph.vertices[u.id] = u;
                        graph.verticesCount++;

                        graph.removeVertex(cluster.id);
                    }
                }

            } else {
                for (var j = g.vertices.length-1; j >= 0; j--) {
                    if (graph.vertices[j] === undefined || g.vertices[j] === undefined) continue;

                    for (var k = g.vertices.length-1; k >= 0; k--) {
                        if (j === k || graph.vertices[k] === undefined || g.vertices[k] === undefined) continue;

                        if (hasEdge(g, j, k) && !hasEdge(graph, j, k)) {
                            var e = getEdge(g, j, k);

                            if (e === null) {
                                graph.addEdge(graph.vertices[j], graph.vertices[k]);
                            } else {
                                graph.addEdge(graph.vertices[j], graph.vertices[k], e.options);
                            }
                        }

                        if (!hasEdge(g, j, k) && hasEdge(graph, j, k)) {
                            graph.removeEdge(j, k);
                        }
                    }
                }
            }

            step();

            layout.k = layout.k * Math.sqrt(4/5);
            delete layout.graphCollection[l];
        }

        delete layout.graphCollection;
    }

    extending();
    equals(graph.getVerticesCount(), count);

    graph.vertices.forEach(function(v){
        console.log('v:', v.id, v.pos.x, v.pos.y);
    });
});


test("test1", function(){
    var layout = this.layout;

    function extending() {
        function hasEdge(g, vId, uId) {
            return ((g.edgesMap[vId] != undefined && g.edgesMap[vId][uId]) ||
                (g.edgesMap[uId] != undefined && g.edgesMap[uId][vId]));
        }

        function getEdge(g, vId, uId) {
            var edgesLength = g.edges.length;

            for (var i = 0; i < edgesLength; i++) {
                var e = g.edges[i];
                if (e === undefined) continue;

                if ((e.v.id === vId && e.u.id === uId) || (e.v.id === uId && e.u.id === vId)) {
                    return e;
                }
            }

            return null;
        }

        var graph = layout.graph;
        var minLevel = 0;
        var g;

        for (var l = layout.graphCollection.length - 1; l >= minLevel; l--) {
            g = layout.graphCollection[l];

            if (l > minLevel) {
                for (var i = g.vertices.length-1; i >= 0; i--) {
                    var cluster = g.vertices[i];
                    if (cluster === undefined) continue;

                    if (cluster.isCluster && cluster.clusterData.level === l &&
                        graph.getNode(cluster.clusterData.targets[0].node.id) === undefined &&
                        graph.getNode(cluster.clusterData.targets[1].node.id) === undefined
                        ) {
                        var v = new Vertex(cluster.clusterData.targets[0].node.label);

                        v.id = cluster.clusterData.targets[0].node.id;
                        v.pos = new Point(cluster.pos.x, cluster.pos.y);
                        v.setWeight(cluster.clusterData.targets[0].node.weight);
                        graph.vertices[v.id] = v;
                        graph.verticesCount++;

                        var u = new Vertex(cluster.clusterData.targets[1].node.label);

                        u.id = cluster.clusterData.targets[1].node.id;
                        u.pos = new Point(cluster.pos.x, cluster.pos.y);
                        u.setWeight(cluster.clusterData.targets[1].node.weight);
                        graph.vertices[u.id] = u;
                        graph.verticesCount++;

                        graph.removeVertex(cluster.id);
                    }
                }

            } else {
                for (var j = g.vertices.length-1; j >= 0; j--) {
                    if (graph.vertices[j] === undefined || g.vertices[j] === undefined) continue;

                    for (var k = g.vertices.length-1; k >= 0; k--) {
                        if (j === k || graph.vertices[k] === undefined || g.vertices[k] === undefined) continue;

                        if (hasEdge(g, j, k) && !hasEdge(graph, j, k)) {
                            var e = getEdge(g, j, k);

                            if (e === null) {
                                graph.addEdge(graph.vertices[j], graph.vertices[k]);
                            } else {
                                graph.addEdge(graph.vertices[j], graph.vertices[k], e.options);
                            }
                        }

                        if (!hasEdge(g, j, k) && hasEdge(graph, j, k)) {
                            graph.removeEdge(j, k);
                        }
                    }
                }
            }

            layout.k = layout.k * Math.sqrt(4/7);
            delete layout.graphCollection[l];
        }

        delete layout.graphCollection;
    }

    layout.coarsening();

    var it = 0;
    layout.graph.vertices.forEach(function(node){
        if (it < 1) {
            node.pos.x = 10;
            node.pos.y = 10;
        } else {
            node.pos.x = 35;
            node.pos.y = 20;
        }
    });

    extending();

    var iter = 0;
    while (iter <= 100) {
        layout.step();
        iter++;
        console.log('------------------');
    }
});