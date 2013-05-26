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
    this.k = Math.sqrt(this.area / graph.vertices.length);
    this.t = 0.9;

    this.graphCollection = [];
    this.isMarked = [];
    this.converged = 0;
    this.oldPos = [];
}

WalshawLayout.prototype = {
    addGraph: function (graph) {
        this.graphCollection[this.graphCollection.length] = cloner.clone(graph);
    },

    getFirstNeighbor: function (id) {
        var graph = this.graph;
        var verticesNb = graph.vertices.length;

        for (var i = 0; i < verticesNb; i++) {
            var node = graph.getNode(i);
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

                    var cluster = new Vertex(v.label + "_" + neighbor.label);
                    cluster.isCluster = true;
                    cluster.targets.push(cloner.clone(v));
                    cluster.targets.push(cloner.clone(neighbor));

                    graph.addVertex(cluster);

                    cluster.setWeight(v.getWeight() + neighbor.getWeight());
                    cluster.pos.x = v.pos.x;
                    cluster.pos.y = v.pos.y;

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
    },

//    extending: function () {
//        var length = this.graphCollection.length - 1;
//        var graph = this.graph;
//        var count = 0;
//
//        //console.log(this.graphCollection);
//
//        // Идем по массиву графов и расширяем кажый до родителя
//        for (var l = length; --l >= 0;) {
//
//            var g = this.graphCollection[l].graph;
//            var targets = this.graphCollection[l + 1].targets;
//            //var verticesNb = this.count(g.vertices);
//            var verticesNb = g.getVerticesCount();
//
//            for (var key in targets) if (targets.hasOwnProperty(key)) {
//
//                var target = targets[key];
//
//                if (!graph.vertices[key] && g.vertices[key] != undefined) {
//                    //graph.vertices[key] = g.vertices[key];
//
//                    var tmp = g.vertices[key];
//
//                    var vertex = new Vertex(tmp.label);
//                    vertex.id = tmp.id;
//                    vertex.pos.x = tmp.pos.x;
//                    vertex.pos.y = tmp.pos.y;
//
//                    graph.vertices[key] = vertex;
//
//                    /*var newPos = {
//                        x: target.pos.x + (Math.random() - 0.005),
//                        y: target.pos.y + (Math.random() - 0.005)
//                    };
//
//                    graph.vertices[key].changePosition(newPos.x, newPos.y);*/
//
//                    // TODO: сделать с этим что-нибудь
//                    graph.verticesCount++;
//                }
//            }
//            //this.count(g.vertices)
//            for (var i = 0; i < verticesNb; i++) {
//                if (typeof graph.vertices[i] === 'undefined' || typeof g.vertices[i] === 'undefined') continue;
//
//                // Добавляем ребра
//                //this.count(g.vertices)
//                for (var j = 0; j < verticesNb; j++) {
//                    if (i === j || typeof graph.vertices[j] === 'undefined' || typeof g.vertices[j] === 'undefined') continue;
//
//                    if (g.hasEdge(i, j) === true && graph.hasEdge(i, j) === false) {
//                        var e = g.getEdge(i, j);
//
//                        if (e) {
//                            graph.addEdge(graph.vertices[i], graph.vertices[j], e.options);
//                        } else {
//                            graph.addEdge(graph.vertices[i], graph.vertices[j]);
//                        }
//                    }
//
//                    if (graph.hasEdge(i, j) === true && g.hasEdge(i, j) === false) {
//                        graph.removeEdge(i, j);
//                    }
//
//                    // Восстанавливаем вес вершин и выводим дочерние вершины в координатах родителя
//                    graph.vertices[i].setWeight(g.vertices[i].getWeight());
//                    graph.vertices[i].label = g.vertices[i].label;
//
//                    graph.vertices[j].setWeight(g.vertices[j].getWeight());
//                    graph.vertices[j].label = g.vertices[j].label;
//                }
//            }
//
//            delete this.graphCollection[l].graph;
//            delete this.graphCollection[l + 1].targets;
//
//            this.k = this.k * Math.sqrt(4 / 7);
//        }
//
//        delete this.graphCollection;
//    },

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

        for (var l = length; --l >= 0;) {
            var graphForVertices = this.graphCollection[l+1];

            for (var i = graphForVertices.vertices.length-1; i >= 0; i--) {
                var node = graphForVertices.vertices[i];
                if (typeof node === 'undefined') continue;

                if (node.isCluster &&
                    typeof graph.getNode(node.targets[0].id) === 'undefined' &&
                    typeof graph.getNode(node.targets[1].id) === 'undefined'
                ) {
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

            this.k = this.k * Math.sqrt(4 / 7);
        }

        delete this.graphCollection;
    },

    fr: function (x, w) {
        return (-0.2 * w * (this.k * this.k) / x);
    },

    fa: function (x) {
        return (x * x) / this.k;
    },

    step: function () {
        var graph = this.graph;
        var diff;
        var w = this.canvasWidth;
        var h = this.canvasHeight;

        var verticesNb = graph.vertices.length;
        var edgesNb = graph.edges.length;

        this.converged = 1;

        for (var i = 0; i < verticesNb; i++) {
            var v = graph.getNode(i);
            if (typeof v === 'undefined') continue;

            this.oldPos[v.id] = v.pos;

            v.disp.x = 0;
            v.disp.y = 0;

            for (var j = 0; j < verticesNb; j++) {
                var u = graph.getNode(j);
                if (typeof u === 'undefined') continue;

                if (i !== j) {
                    diff = v.pos.subtract(u.pos);
                    v.disp = v.disp.add(diff.normalize().multiply(this.fr(diff.magnitude(), v.getWeight())));
                }
            }
        }

        for (var l = 0; l < edgesNb; l++) {
            var e = graph.edges[l];
            diff = e.v.pos.subtract(e.u.pos);

            e.v.disp = e.v.disp.subtract(diff.normalize().multiply(this.fa(diff.magnitude())));
            e.u.disp = e.u.disp.add(diff.normalize().multiply(this.fa(diff.magnitude())));
        }

        for (var k = 0; k < verticesNb; k++) {
            var node = graph.getNode(k);
            if (typeof node === 'undefined') continue;

            var damping = Math.min(node.disp.magnitude(), this.t);
            node.pos = node.pos.add(node.disp.normalize().multiply(damping));

            var newPos = {
                x: Math.min((w - 10), Math.max(10, node.pos.x)),
                y: Math.min((h - 10), Math.max(10, node.pos.y))
            };
            node.changePosition(newPos.x, newPos.y);

            var posDiff = node.pos.subtract(this.oldPos[node.id]);

            if (posDiff.magnitude() > this.k * 0.01) this.converged = 0;
        }

        this.t = this.t * 0.9;

        if (this.converged === 1) {
            this.stop();
            console.timeEnd('Start algorithm execution');
        }
    },

    run: function () {
        console.time('Start algorithm execution');

        this.coarsening();
        this.extending();

        var self = this;
        var animate = function () {
            self.reqAnimId = requestAnimationFrame(animate);

            self.clear();
            self.step();
            self.draw();
        };

        animate();
    }
};

inherit(WalshawLayout, Layout);
