/**
 * Created with JetBrains PhpStorm.
 * User: Andrey
 * Date: 03.10.12
 * Time: 23:13
 * To change this template use File | Settings | File Templates.
 */

function WalshawLayout(canvas, graph){
    console.time('Algorithm execution');

    Layout.call(this, [canvas, graph]);

    this.graph = graph;

    this.area = this.canvasWidth*this.canvasHeight;
    this.k = Math.sqrt(this.area/graph.vertices.length);
    this.t = 0.9;

    this.graphCollection = [];
    this.isMarked = [];
    this.converged = 0;
    this.oldPos = [];

    this.anim = 0;
}

WalshawLayout.prototype = {
    addGraph: function(graph, tar){
        var tmp = clone(graph);
        this.graphCollection[this.graphCollection.length] = {
            graph: tmp,
            targets: tar || []
        };
    },

    getFirstNeighbor: function(id){
        var graph = this.graph;
        var verticesNb = graph.getVerticesCount();
        var edgesNb = graph.getEdgesCount();

        for(var i=0; i<verticesNb; i++) {
            if(graph.vertices[i] == null ||  id === i || this.isMarked[i] === true) continue;

            for(var j=0; j<edgesNb; j++) {
                if(graph.edges[j].v.id === id) {
                    return graph.edges[j].u;
                }

                if(graph.edges[j].u.id === id) {
                    return graph.edges[j].v;
                }
            }
        }

        return null;
    },

    getMinWeightNeighbor: function(id){
        var graph = this.graph;
        var neighbor = this.getFirstNeighbor(id);
        var verticesNb = graph.getVerticesCount();
        var edgesNb = graph.getEdgesCount();

        if(neighbor === null) return neighbor;

        // Ищем соседа с минимальным весом
        for(var i=0; i<verticesNb; i++) {
            if(graph.vertices[i] == null ||  id === i || this.isMarked[i] === true) continue;

            for(var j=0; j<edgesNb; j++) {
                if(graph.edges[j].v.id === id && (neighbor.getWeight() > graph.edges[j].u.getWeight())) {
                    neighbor = graph.edges[j].u;
                }

                if(graph.edges[j].u.id === id && (neighbor.getWeight() > graph.edges[j].v.getWeight())) {
                    neighbor = graph.edges[j].v;
                }
            }
        }

        return neighbor;
    },

    coarsening: function(){
        var graph = this.graph;
        var vertexCount = graph.vertices.length;
        var targets = [];

        // Добавляем исходный граф в коллекцию
        this.addGraph(graph);

        // Повторяем, пока количество вершин больше 2
        while (vertexCount > 2) {
            var count = vertexCount;
            var verticesNb = graph.vertices.length;

            // Сбрасываем отмеченные вершины
            for(var i=0; i<verticesNb; i++) {
                this.isMarked[i] = false;
            }

            for(var j=0; j<verticesNb; j++) {
                if(graph.vertices[j] == null || this.isMarked[j] === true) continue;

                this.isMarked[j] = true;

                var neighbor = this.getMinWeightNeighbor(j);

                if(neighbor !== null) {
                    // Помечаем вершины
                    this.isMarked[neighbor.id] = true;

                    targets[neighbor.id] = graph.vertices[j];

                    graph.vertices[j].label = graph.vertices[j].label+"_"+graph.vertices[neighbor.id].label;
                    graph.vertices[j].setWeight(graph.vertices[j].getWeight()+graph.vertices[neighbor.id].getWeight());

                    for(var k=0; k<verticesNb; k++) {
                        if(k === j || k === neighbor.id) continue;

                        // Добавляем ребра которых не хватает
                        if(!graph.hasEdge(j, k) && graph.hasEdge(neighbor.id, k)) {
                            graph.addEdge(graph.vertices[j], graph.vertices[k]);
                        }
                    }

                    graph.removeVertex(neighbor.id);

                }
            }

            // Добавляем полученный граф в коллекцию
            this.addGraph(graph, targets);

            // Считаем количество вершин в получившемся графе
            //vertexCount = this.count(graph.vertices);
            vertexCount = graph.getVerticesCount();


            if(count == vertexCount) {
                break;
            }
        }

        var v1, v2;
        for (var i in graph.vertices) {
            graph.vertices[i].pos = Vector.random();

            if (!v1) {
                v1 = graph.vertices[i].pos;
            } else {
                v2 = graph.vertices[i].pos;
            }
        }

        this.k = v1.subtract(v2).magnitude();
        //console.log(this.k);
    },

    extending: function(){
        var length = this.graphCollection.length-1;
        var graph = this.graph;
        var count = 0;

        //console.log(this.graphCollection);

        // Идем по массиву графов и расширяем кажый до родителя
        for (var l=length; --l>=0;) {

            var g = this.graphCollection[l].graph;
            var targets = this.graphCollection[l+1].targets;
            //var verticesNb = this.count(g.vertices);
            var verticesNb = g.getVerticesCount();

            for (var i in targets) {
                var target = targets[i];

                if(!graph.vertices[i] && g.vertices[i] != undefined) {
                    //console.log(target);
                    graph.vertices[i] = g.vertices[i];

                    /*graph.vertices[i].pos.x = target.pos.x+(Math.random()-0.005);
                    graph.vertices[i].pos.y = target.pos.y+(Math.random()-0.005);*/

                    var newPos = {
                        x: target.pos.x+(Math.random()-0.005),
                        y: target.pos.y+(Math.random()-0.005)
                    };

                    graph.vertices[i].changePosition(newPos.x, newPos.y);

                    // TODO: сделать с этим что-нибудь
                    graph.verticesCount++;
                }
            }
                       //this.count(g.vertices)
            for(i=0; i<g.getVerticesCount(); i++) {
                if(!graph.vertices[i] || !g.vertices[i]) continue;

                // Добавляем ребра
                               //this.count(g.vertices)
                for(var j=0; j<g.getVerticesCount(); j++) {
                    if(i == j || !graph.vertices[j] || !g.vertices[j]) continue;

                    if(g.hasEdge(i, j) === true && graph.hasEdge(i, j) === false) {
                        graph.addEdge(graph.vertices[i], graph.vertices[j]);
                    }

                    if (graph.hasEdge(i, j) === true && g.hasEdge(i, j) === false) {
                        graph.removeEdge(i, j);
                    }

                    // Восстанавливаем вес вершин и выводим дочерние вершины в координатах родителя
                    graph.vertices[i].setWeight(g.vertices[i].getWeight());
                    graph.vertices[i].label = g.vertices[i].label;

                    graph.vertices[j].setWeight(g.vertices[j].getWeight());
                    graph.vertices[j].label = g.vertices[j].label;
                }
            }

            this.k = this.k * Math.sqrt(4/7);
        }


    },

    fr: function(x, w){
        return (-0.2*w*(this.k*this.k)/x);
    },

    fa: function(x){
        return (x*x)/this.k;
    },

    iteration: function(){
        var self = this;

        self.anim = setInterval(function(){
            self.clear();
            self.step();
            self.draw();
        }, 10);
    },


    step: function(){
        this.super.step();

        //while (this.converged != 1) {
        if (this.converged != 1) {

            var graph = this.graph;
            var diff;
            var w = this.canvasWidth;
            var h = this.canvasHeight;

            var verticesNb = graph.vertices.length;
            var edgesNb = graph.edges.length;

            this.converged = 1;

            for(var i=0; i<verticesNb; i++) {
                var v = graph.vertices[i];

                if(v == null) continue;

                this.oldPos[v.id] = v.pos;

                v.disp.x=0;
                v.disp.y=0;

                for(var j=0; j<verticesNb; j++) {
                    var u = graph.vertices[j];

                    if(u == null) continue;
                    if(i !== j) {
                        diff = v.pos.subtract(u.pos);
                        v.disp = v.disp.add(diff.normalise().multiply(this.fr(diff.magnitude(), v.getWeight())));
                    }
                }
            }

            for(var l=0; l<edgesNb; l++) {
                var e = graph.edges[l];
                diff = e.v.pos.subtract(e.u.pos);

                e.v.disp = e.v.disp.subtract(diff.normalise().multiply(this.fa(diff.magnitude())));
                e.u.disp = e.u.disp.add(diff.normalise().multiply(this.fa(diff.magnitude())));
            }

            for(var k=0; k<verticesNb; k++) {
                var v = graph.vertices[k];

                if(v == null) continue;

                var damping = Math.min(v.disp.magnitude(), this.t);

                v.pos = v.pos.add(v.disp.normalise().multiply(damping));
               /* v.pos.x = Math.min((w-10), Math.max(10, v.pos.x));
                v.pos.y = Math.min((h-10), Math.max(10, v.pos.y));*/

                var newPos = {
                    x: Math.min((w-10), Math.max(10, v.pos.x)),
                    y: Math.min((h-10), Math.max(10, v.pos.y))
                };
                v.changePosition(newPos.x, newPos.y);

                var posDiff = v.pos.subtract(this.oldPos[v.id]);

                if (posDiff.magnitude() > this.k*0.01) this.converged = 0;
            }

            this.t = this.t*0.9;
        }

    },

    run: function(){
        console.time('Algorithm execution');

        this.coarsening();
        this.extending();
        this.iteration();

        console.timeEnd('Algorithm execution');
    }
};

inherit(WalshawLayout, Layout);