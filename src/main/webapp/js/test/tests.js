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

    equals(layout.graph.getVerticesCount(), 2);
});

test("coarsening2", function(){
    getFirstNeighbor1 = function (graph, id) {
        var verticesNb = graph.vertices.length;

        for (var i = 0; i < verticesNb; i++) {
            var node = graph.getNode(i);
            if (typeof node === 'undefined') continue;

            if (graph.hasEdge(id, i)) {
                return node;
            }
        }

        return null;
    };

    getMinWeightNeighbor1 = function (graph, id) {
        var neighbor = getFirstNeighbor1(graph, id);
        var verticesNb = graph.vertices.length;

        if (neighbor === null) return neighbor;

        // Ищем соседа с минимальным весом
        for (var i = 0; i < verticesNb; i++) {
            if (graph.hasEdge(id, i)) {
                var v = graph.getNode(i);

                if (neighbor.getWeight() > v.getWeight()) {
                    neighbor = v;
                }
            }
        }

        return neighbor;
    };

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

    var vertexCount = g.getVerticesCount();
    var vertexNb = g.vertices.length;
    var isMarked = [];

    // Добавляем исходный граф в коллекцию
    //this.addGraph(graph);

    // Повторяем, пока количество вершин больше 2
    while (vertexCount > 2) {
        var count = vertexCount;

        // Сбрасываем отмеченные вершины
        for (var i = 0; i < g.vertices.length; i++) {
            isMarked[i] = false;
        }

        for (var j = 0; j < g.vertices.length; j++) {
            var v = g.getNode(j);
            if (typeof v === 'undefined' || isMarked[v.id] === true) continue;

            isMarked[v.id] = true;

            var neighbor = getMinWeightNeighbor1(g, j);
            if (neighbor !== null) {
                // Помечаем вершины
                isMarked[neighbor.id] = true;

                var cluster = new Vertex(v.label + "_" + neighbor.label);
                cluster.isCluster = true;
                cluster.targets.push(cloner.clone(v));
                cluster.targets.push(cloner.clone(neighbor));

                g.addVertex(cluster);

                cluster.setWeight(v.getWeight() + neighbor.getWeight());
                cluster.pos.x = v.pos.x;
                cluster.pos.y = v.pos.y;

                isMarked[cluster.id] = true;

                for (var k = 0; k < g.vertices.length; k++) {
                    var u = g.getNode(k);
                    if (typeof u === 'undefined' || k === v.id || k === neighbor.id) continue;

                    // Добавляем ребра которых не хватает
                    if (g.hasEdge(v.id, u.id) || g.hasEdge(neighbor.id, u.id)) {
                        g.addEdge(cluster, u);
                    }
                }

                g.removeVertex(v.id);
                g.removeVertex(neighbor.id);
            }
        }

        vertexCount = g.getVerticesCount();
        if (count == vertexCount) {
           break;
        }
    }
});

test("create cluster", function(){
    var g = new Graph();

    var v1 = new Vertex(1);
    var v2 = new Vertex(2);

    g.addVertex(v1);
    g.addVertex(v2);

    g.addEdge(v1, v2);

    var cluster = new Vertex(v1.label + '_' + v2.label);
    cluster.isCluster = true;
    cluster.targets.push(ut.clone(v1));
    cluster.targets.push(ut.clone(v2));

    g.addVertex(cluster);

    cluster.setWeight(v1.getWeight() + v2.getWeight());

    //console.log(cluster.isCluster);

    g.removeVertex(v1.id);
    g.removeVertex(v2.id);

    for (var i = g.vertices.length-1; i >= 0; i--) {
        console.log(i);
        console.log(typeof g.getNode(i));
    }
});
