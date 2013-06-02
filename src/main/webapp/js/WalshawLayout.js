/**
 * Created with JetBrains PhpStorm.
 * User: Andrey
 * Date: 03.10.12
 * Time: 23:13
 * To change this template use File | Settings | File Templates.
 */

function WalshawLayout(canvas, graph) {
    console.time('Algorithm execution');

    Layout.call(this, [canvas, graph]);

    this.graph = graph;

    this.area = this.canvasWidth * this.canvasHeight;
    this.k = 0;
    this.maxIterations = 90;

    this.graphCollection = [];
    this.isMarked = [];
}

WalshawLayout.prototype = {
    fr: function (x, w) {
        return -0.2 * (w * Math.pow(this.k, 2) / x);
    },

    fa: function (x) {
        return Math.pow(x, 2) / this.k;
    },

    cool: function (t) {
        return t * 0.9;
    },

    addGraph: function (graph) {
        this.graphCollection[this.graphCollection.length] = {
            vertices: cloner.clone(graph.vertices),
            edges: cloner.clone(graph.edges),
            edgesMap: cloner.clone(graph.edgesMap)
        };
    },

    getFirstNeighbor: function (id) {
        var graph = this.graph;
        var verticesNb = graph.vertices.length;

        for (var i = 0; i < verticesNb; i++) {
            var node = graph.getNode(i);
            if (typeof node === 'undefined' || this.isMarked[node.id]) continue;
            if (typeof node === 'undefined' || this.isMarked[node.id]) continue;

            if (graph.hasEdge(id, i)) {
                return node;
            }
        }

        return null;
    },

    getMinWeightNeighbor: function (id) {
        var graph = this.graph;
        var neighbor = this.getFirstNeighbor(id);
        var verticesNb = graph.vertices.length;

        if (neighbor === null) return neighbor;

        // Ищем соседа с минимальным весом
        for (var i = 0; i < verticesNb; i++) {
            if (graph.hasEdge(id, i)) {
                var v = graph.getNode(i);
                if (typeof v === 'undefined' || this.isMarked[v.id]) continue;

                if (neighbor.getWeight() > v.getWeight()) {
                    neighbor = v;
                }
            }
        }

        return neighbor;
    },

    coarsening: function () {
        var graph = this.graph;
        var vertexCount = graph.getVerticesCount();

        // Добавляем исходный граф в коллекцию
        this.addGraph(graph);

        // Повторяем, пока количество вершин больше 2
        var level = 1;
        while (vertexCount > 2) {
            var count = vertexCount;

            // Сбрасываем отмеченные вершины
            for (var i = graph.vertices.length-1; i >= 0; i--) {
                this.isMarked[i] = false;
            }

            for (var j = graph.vertices.length-1; j >= 0; j--) {
                var v = graph.getNode(j);
                if (typeof v === 'undefined' || this.isMarked[v.id] === true) continue;

                this.isMarked[v.id] = true;

                var neighbor = this.getMinWeightNeighbor(j);
                if (neighbor !== null) {
                    // Помечаем вершины
                    this.isMarked[neighbor.id] = true;

                    var cluster = new Vertex(v.label + ":" + neighbor.label);
                    cluster.isCluster = true;

                    var targets = [];
                    targets.push({
                        node: cloner.clone(v)
                        //neighbors: cloner.clone(graph.adjacency[v.id])
                    });
                    targets.push({
                        node: cloner.clone(neighbor)
                        //neighbors: cloner.clone(graph.adjacency[neighbor.id])
                    });

                    cluster.clusterData = {
                        level: level,
                        targets: targets
                    };

                    graph.addVertex(cluster);

                    cluster.setWeight(v.getWeight() + neighbor.getWeight());
                    cluster.pos = v.pos.center(neighbor.pos);

                    this.isMarked[cluster.id] = true;

                    for (var k = graph.vertices.length-1; k >= 0; k--) {
                        var u = graph.getNode(k);
                        if (typeof u === 'undefined' || k === j || k === neighbor.id) continue;

                        // Добавляем ребра которых не хватает
                        if (graph.hasEdge(v.id, u.id) || graph.hasEdge(neighbor.id, u.id)) {
                            graph.addEdge(cluster, u);
                        }
                    }

                    graph.removeVertex(v.id);
                    graph.removeVertex(neighbor.id);
                }
            }

            // Добавляем полученный граф в коллекцию
            this.addGraph(graph);
            level++;

            vertexCount = graph.getVerticesCount();
            if (count === vertexCount) {
                break;
            }
        }

        var v1, v2;
        for (var key in graph.vertices) if (graph.vertices.hasOwnProperty(key)) {
            graph.vertices[key].pos = Point.random();

            if (!v1) {
                v1 = graph.vertices[key].pos;
            } else {
                v2 = graph.vertices[key].pos;
            }
        }

        this.k = v1.subtract(v2).magnitude();
        console.log(this.k);
    },

    extending: function () {
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

        var graph = this.graph;
        var length = this.graphCollection.length - 1;
        var minLevel = 0;

        for (var l = length; l >= minLevel; l--) {
            var graphForVertices = this.graphCollection[l];

            if (l > minLevel) {
                for (var i = graphForVertices.vertices.length-1; i >= 0; i--) {
                    var cluster = graphForVertices.vertices[i];
                    if (typeof cluster === 'undefined') continue;

                    if (cluster.isCluster && cluster.clusterData.level === l &&
                        typeof graph.getNode(cluster.clusterData.targets[0].node.id) === 'undefined' &&
                        typeof graph.getNode(cluster.clusterData.targets[1].node.id) === 'undefined'
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

                        /*var adjacencies1 = cloner.clone(cluster.clusterData.targets[0].neighbors);
                         var adjacencies2 = cloner.clone(cluster.clusterData.targets[1].neighbors);*/

                        graph.removeVertex(cluster.id);

                        /*addClusterNeighbors(graph, v, adjacencies1);
                         addClusterNeighbors(graph, u, adjacencies2);*/
                    }
                }

            } else {
                var graphForEdges = this.graphCollection[l];

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
            }

            this.k = this.k * Math.sqrt(0.85);
            delete this.graphCollection[l];
        }

        delete this.graphCollection;
    },

    /*extending: function () {
        function addClusterNeighbors(g, v, adjacencies) {
            console.log(adjacencies);

            for (var i = 0; i < g.vertices.length; i++) {
                var u = g.getNode(i);
                if (typeof u === 'undefined' || v.id === u.id) continue;

                var e = adjacencies[u.id];

                if (typeof e !== 'undefined' && !g.hasEdge(v.id, u.id)) {
                    //console.log('add edge:', v.label, ' - ', u.label);
                    g.addEdge(v, u, e.options);

                } else if (g.hasEdge(v.id, u.id) && typeof e === 'undefined') {
                    //console.log('remove edge:', v.label, ' - ', u.label);
                    g.removeEdge(v.id, u.id);
                }
            }
        }

        var graph = this.graph;
        var length = this.graphCollection.length - 1;

        for (var l = length; l >= 0; l--) {
            var graphForVertices = this.graphCollection[l];

            for (var i = graphForVertices.vertices.length-1; i >= 0; i--) {
                var cluster = graphForVertices.vertices[i];
                if (typeof cluster === 'undefined') continue;

                if (cluster.isCluster && cluster.clusterData.level === l &&
                    typeof graph.getNode(cluster.clusterData.targets[0].node.id) === 'undefined' &&
                    typeof graph.getNode(cluster.clusterData.targets[1].node.id) === 'undefined'
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

                    var adjacencies1 = cloner.clone(cluster.clusterData.targets[0].neighbors);
                    var adjacencies2 = cloner.clone(cluster.clusterData.targets[1].neighbors);

                    graph.removeVertex(cluster.id);

                    addClusterNeighbors(graph, v, adjacencies1);
                    addClusterNeighbors(graph, u, adjacencies2);
                }
            }

            this.k = this.k * Math.sqrt(4 / 5);
            delete this.graphCollection[l];
        }

        delete this.graphCollection;
    },*/

    step: function (t) {
        var graph = this.graph;
        var verticesNb = graph.vertices.length;
        var v, u, delta;

        var converged = false;

        while (!converged) {
            converged = true;

            var oldPos = [];
            for (var m = 0; m < verticesNb; m++) {
                v = graph.getNode(m);
                if (typeof v === 'undefined') continue;

                oldPos[v.id] = new Point(v.pos.x, v.pos.y);
            }

            for (var i = 0; i < verticesNb; i++) {
                v = graph.getNode(i);
                if (typeof v === 'undefined') continue;

                var disp = new Point(0, 0);

                for (var j = 0; j < verticesNb; j++) {
                    u = graph.getNode(j);
                    if (typeof u === 'undefined' || i === j) continue;

                    delta = u.pos.subtract(v.pos);
                    if (delta.magnitude() < 0.1) {
                        delta = new Point((0.1 + Math.random() * 0.1), (0.1 + Math.random() * 0.1));
                    }

                    var fr = this.fr(delta.magnitude(), u.getWeight());
                    disp = disp.add(delta.normalize().multiply(fr));
                }

                for (var l = 0; l < verticesNb; l++) {
                    u = graph.getNode(l);
                    if (typeof u === 'undefined' || !graph.hasEdge(v.id, u.id)) continue;

                    delta = u.pos.subtract(v.pos);
                    if (delta.magnitude() < 0.1) {
                        delta = new Point((0.1 + Math.random() * 0.1), (0.1 + Math.random() * 0.1));
                    }

                    var fa = this.fa(delta.magnitude());
                    disp = disp.add(delta.normalize().multiply(fa));
                }

                if (disp.magnitude() > 0) {
                    var newPos = v.pos.add(disp.normalize().multiply(Math.min(t, disp.magnitude())));
                    v.updatePosition(newPos);
                }

                if (v.pos.subtract(oldPos[v.id]).magnitude() > (this.k * 0.01)) {
                    converged = false;
                }
            }

            t = this.cool(t);
        }
    },

    run: function () {
        console.time('Start algorithm execution');

        this.coarsening();

        this.extending();

        var iter = 0;
        while (iter <= this.maxIterations) {
            this.step(0.9);
            iter++;
        }

        this.redraw();

        console.timeEnd('Start algorithm execution');


        /*var self = this;
        var iter = 0;
        var animate = function () {
            self.reqAnimId = requestAnimationFrame(animate);

            self.step(0.9);
            self.redraw();

            iter++;
            console.log(iter);

            if (iter > self.maxIterations) {
                self.stop();
            }
        };

        animate();*/
    }
};

inherit(WalshawLayout, Layout);
