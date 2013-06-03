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
    this.maxIterations = 80;

    this.graphCollection = [];
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

        for (var i = 0, len = graph.vertices.length; i < len; i++) {
            var node = graph.getNode(i);
            if (node === undefined) continue;

            if (graph.hasEdge(id, node.id)) {
                return node;
            }
        }

        return null;
    },

    getMinWeightNeighbor: function (id) {
        var graph = this.graph;
        var neighbor = this.getFirstNeighbor(id);

        if (neighbor === null) return null;

        // Ищем соседа с минимальным весом
        for (var i = 0, len = graph.vertices.length; i < len; i++) {
            var v = graph.getNode(i);
            if (v === undefined) continue;

            if (graph.hasEdge(id, v.id)) {
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
        var isMarked = [];

        // Добавляем исходный граф в коллекцию
        this.addGraph(graph);

        // Повторяем, пока количество вершин больше 2
        var level = 1;
        while (vertexCount > 2) {
            var count = vertexCount;
            var i;

            // Сбрасываем отмеченные вершины
            graph.vertices.forEach(function(v){
                isMarked[v.id] = false;
            });

            for (i = graph.vertices.length-1; i >= 0; i--) {
                var v = graph.getNode(i);
                if (typeof v === 'undefined' || isMarked[v.id] === true) continue;

                isMarked[v.id] = true;

                var neighbor = this.getMinWeightNeighbor(i);
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
                        if (typeof u === 'undefined') continue;

                        // Добавляем ребра которых не хватает
                        if (graph.hasEdge(v.id, u.id) || graph.hasEdge(neighbor.id, u.id)) {
                            graph.addEdge(cluster, u);
                        }
                    }

                    graph.removeVertex(neighbor.id);
                    graph.removeVertex(v.id);
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

        console.log(vertexCount);
        if (vertexCount > 2) {
            throw "Граф не является связным. Процесс будет завершен.";
        }

        var initPos = [];
        graph.vertices.forEach(function(v){
            v.updatePosition(Point.random());
            initPos.push(v.pos);
        });

        this.k = initPos[0].subtract(initPos[1]).magnitude();
    },

    extending: function () {
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

        var graph = this.graph;
        var minLevel = 0;
        var g;

        for (var l = this.graphCollection.length - 1; l >= minLevel; l--) {
            g = this.graphCollection[l];

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

                        /*var adjacencies1 = cloner.clone(cluster.clusterData.targets[0].neighbors);
                         var adjacencies2 = cloner.clone(cluster.clusterData.targets[1].neighbors);*/

                        graph.removeVertex(cluster.id);

                        /*addClusterNeighbors(graph, v, adjacencies1);
                         addClusterNeighbors(graph, u, adjacencies2);*/
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

            this.k *= Math.sqrt(4/5);
            delete this.graphCollection[l];
        }

        delete this.graphCollection;
    },

    step: function (t) {
        var graph = this.graph;
        var verticesNb = graph.vertices.length;
        var v, u, delta, i, j;

        var converged = false;

        while (!converged) {
            converged = true;

            for (i = 0; i < verticesNb; i++) {
                v = graph.getNode(i);
                if (typeof v === 'undefined') continue;

                var disp = new Point(0, 0);

                for (j = 0; j < verticesNb; j++) {
                    u = graph.getNode(j);
                    if (i === j || typeof u === 'undefined') continue;

                    delta = u.pos.subtract(v.pos);
                    if (delta.magnitude() < 0.1) {
                        delta = new Point((0.1 + Math.random() * 0.1), (0.1 + Math.random() * 0.1));
                    }

                    disp = disp.add(delta.normalize().multiply(this.fr(delta.magnitude(), u.getWeight())));

                    if (graph.hasEdge(v.id, u.id)) {
                        disp = disp.add(delta.normalize().multiply(this.fa(delta.magnitude())));
                    }
                }

                /*for (j = 0; j < verticesNb; j++) {
                    u = graph.getNode(j);
                    if (typeof u === 'undefined' || !graph.hasEdge(v.id, u.id)) continue;

                    delta = u.pos.subtract(v.pos);
                    if (delta.magnitude() < 0.1) {
                        delta = new Point((0.1 + Math.random() * 0.1), (0.1 + Math.random() * 0.1));
                    }

                    disp = disp.add(delta.normalize().multiply(this.fa(delta.magnitude())));
                }*/

                var oldPos = new Point(v.pos.x, v.pos.y);

                if (disp.magnitude() > 0) {
                    var newPos = v.pos.add(disp.normalize().multiply(Math.min(t, disp.magnitude())));
                    v.updatePosition(newPos);
                }

                if (v.pos.subtract(oldPos).magnitude() > (this.k * 0.01)) {
                    converged = false;
                }
            }

            t = this.cool(t);
        }
    },

    run: function () {
        console.time('Start algorithm execution');

        try {
            this.coarsening();
            this.extending();

            var iter = 0;
            while (iter <= this.maxIterations) {
                this.step(0.9);
                iter++;
            }

            this.redraw();

        } catch (e) {
            alert(e);

        } finally {
            console.timeEnd('Start algorithm execution');
        }


        /*var self = this;
        var iter = 0;
        var animate = function () {
            self.reqAnimId = requestAnimationFrame(animate);

            self.step(0.9);
            self.redraw();

            iter++;

            if (iter > self.maxIterations) {
                self.stop();
            }
        };

        animate();*/
    }
};

inherit(WalshawLayout, Layout);
