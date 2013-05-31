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
    this.t = 0.9;

    this.graphCollection = [];
    this.isMarked = [];
    this.converged = false;
}

WalshawLayout.prototype = {
    fr: function (x, w) {
        if (x === 0) return 0;
        return -0.2 * (w * Math.pow(this.k, 2) / x);
    },

    fa: function (x) {
        if (this.k === 0) return 0;
        return Math.pow(x, 2) / this.k;
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

        this.step();

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
                    v.pos = new Point(node.pos.x, node.pos.y);
                    v.setWeight(node.targets[0].weight);
                    graph.vertices[v.id] = v;
                    graph.verticesCount++;

                    var u = new Vertex(node.targets[1].label);
                    u.id = node.targets[1].id;
                    u.pos = new Point(node.pos.x, node.pos.y);
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
            this.t = this.k;

            this.step();
        }

        delete this.graphCollection;
    },

    step: function () {
        var graph = this.graph;
        var verticesNb = graph.vertices.length;
        var v, u, delta;

        while (!this.converged) {
            this.converged = true;

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
                    console.log('fr:', fr);
                    disp = disp.add(delta.normalize().multiply(fr));
                    console.log('fr disp:', disp.magnitude());
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

                var oldPos = new Point(v.pos.x, v.pos.y);

                if (disp.magnitude() > 0) {
                    var newPos = v.pos.add(disp.normalize().multiply(Math.min(this.t, disp.magnitude())));
                    v.updatePosition(newPos);
                }

                if (v.pos.subtract(oldPos).magnitude() > (this.k * 0.01)) {
                    this.converged = false;
                }
            }

            this.t = this.t * 0.9;
        }
    },

    run: function () {
        console.time('Start algorithm execution');

        this.coarsening();
        console.log(this.graph.getVerticesCount());

        this.extending();
        console.log(this.graph.getVerticesCount());

        //this.redraw();


        var self = this;
        var animate = function () {
            self.reqAnimId = requestAnimationFrame(animate);
            self.redraw();
            //self.t = 0.9;
            self.step();

            console.log(self.t);
        };

        animate();

        /* var t = 900;
         while (t > 0) {
         this.step();
         this.redraw();
         t--;
         }*/

        //console.timeEnd('Start algorithm execution');


        /*var self = this;
        var animate = function () {
            self.reqAnimId = requestAnimationFrame(animate);

            self.clear();
            //self.step();
            self.draw();
        };

        animate();*/
    }
};

inherit(WalshawLayout, Layout);
