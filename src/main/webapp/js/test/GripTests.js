/**
 * Created with JetBrains WebStorm.
 * User: amalyuhin
 * Date: 29.05.13
 * Time: 9:37
 * To change this template use File | Settings | File Templates.
 */

module("Grip", {
    setup: function(){
        var g = new Graph();

        var v1 = new Vertex(1);
        var v2 = new Vertex(2);
        var v3 = new Vertex(3);
        var v4 = new Vertex(4);
        var v5 = new Vertex(5);

        var v6 = new Vertex(6);
        var v7 = new Vertex(7);
        var v8 = new Vertex(8);

        g.addVertex(v1);
        g.addVertex(v2);
        g.addVertex(v3);
        g.addVertex(v4);
        g.addVertex(v5);
        g.addVertex(v6);

        g.addEdge(v1, v2);
        g.addEdge(v2, v3);
        g.addEdge(v2, v5);
        g.addEdge(v3, v4);
        g.addEdge(v3, v5);
        g.addEdge(v4, v5);
        g.addEdge(v1, v4);

        g.addEdge(v5, v6);
        g.addEdge(v6, v7);
        g.addEdge(v7, v8);

        this.layout = new GripLayout(document.createElement('canvas'), g);
    }
});

test("buildMisFiltration", function(){
    var subsets = this.layout.calculateNodeFiltering();

    for (var i = 0; i < subsets.length; i++) {
        console.log('subset:', i);
        for (var j = 0; j < subsets[i].length; j++) {
            var subsetNode = subsets[i][j];
            console.log('   ', 'label: ' + subsetNode.label);
        }
    }
});

test("myNodeNeighbours", function(){
    var layout = this.layout;
    var subsets = layout.calculateNodeFiltering();
    var currentSet = subsets[subsets.length - 1];

    for (var l = 0; l < subsets.length; l++) {
        console.log('l:', l);

        for (var t = 0; t < subsets[l].length; t++) {
            var currNode = subsets[l][t];
            console.log('   ', 'node:', currNode.label, 'depth:', currNode.depth);
        }
    }

    console.log('----------------------');

    function findNeighbours(node) {
        var visited = [];
        var nodesQ = [];
        var neighbours = [];

        node.setNeighbours([]);
        visited.push(node);
        nodesQ.unshift(node);

        while (nodesQ.length > 0) {

            var n = nodesQ.shift();
            //console.log('node:', node.label, 'depth:', node.depth);

            for (var i = 0; i < n.getAdjList().length; i++) {
                n = n.nodeAt(i);

                if (!visited.contains(n)) {
                    console.log('   ', 'n:', n.label, 'depth:', n.depth);

                    for (var j = 0; j < node.depth; j++) {
                        console.log('       ', 'j:', j);

                        console.log('           ', neighbours.length, '<', node.depth, (neighbours.length < node.depth));
                        if (neighbours.length < node.depth) {
                            neighbours.push([]);
                        }

                        console.log('           ', j, '<', n.depth, '&&', neighbours[j].length, '<', layout.nbrs(j + 1), (j < n.depth && neighbours[j].length < layout.nbrs(j + 1)));
                        if (j < n.depth && neighbours[j].length < layout.nbrs(j + 1)) {
                            neighbours[j].push(n);
                        }
                    }

                    nodesQ.push(n);
                    visited.push(n);
                }
            }

            node.setNeighbours(neighbours);

            console.log('-------------------');
        }
    }

    for (var i = 0; i < currentSet.length; i++) {
        var node = currentSet[i];
        findNeighbours(node);
        //this.findInitialNodePosition(tmpNode);

        var neighbours = node.getNeighbours();
        console.log('node:', node.label);
        for (var j = 0; j < neighbours.length; j++) {
            console.log('   ', j, neighbours[j].length);

            for (var k = 0; k < neighbours[j].length; k++) {
                console.log('       ', 'n:', neighbours[j][k].label);
            }
        }
    }
});

test("findNodeNeighbours", function(){
    var layout = this.layout;
    var subsets = layout.buildMisFiltration();
    var currentSet = subsets[subsets.length - 1];

    function findNodeNeighbours(node) {
        var visitedNodes = [];
        var nodeQ = [];

        node.setNeighbours([]);
        visitedNodes.push(node);
        nodeQ.unshift(node);

        while (nodeQ.length > 0) {
            var n = nodeQ.shift();

            for (var i = 0; i < n.getAdjList().length; i++) {
                n = n.nodeAt(i);

                console.log('i:', i);
                console.log('n:', n.label);

                if (!visitedNodes.contains(n)) {

                    for (var j = 0; j < node.depth; j++) {
                        console.log('   ', 'j:', j);

                        console.log('       ', 'if (', node.getNeighbours().length, '<', node.depth, ') ', (node.getNeighbours().length < node.depth));
                        if (node.getNeighbours().length < node.depth) {
                            node.getNeighbours().push([]);
                        }

                        console.log('       ', 'if (', j, '<', n.depth, '&&', node.getNeighbours()[j].length, '<', layout.nbrs(j + 1), ') ', (j < n.depth && node.getNeighbours()[j].length < layout.nbrs(j + 1)));
                        if (j < n.depth && node.getNeighbours()[j].length < layout.nbrs(j + 1)) {
                            node.getNeighbours()[j].push(n);
                        }
                    }
                    nodeQ.push(n);
                    visitedNodes.push(n);

                } else {
                    console.log('visited');
                }

                console.log('-------------------------')
            }

            console.log('');
            console.log('=========================');
            console.log('');
        }
    }

    for (var i = 0; i < currentSet.length; i++) {
        var node = currentSet[i];
        findNodeNeighbours(node);
        //this.findInitialNodePosition(tmpNode);

        var neighbours = node.getNeighbours();
        console.log('node:', node.label);
        for (var j = 0; j < neighbours.length; j++) {
            console.log('   ', j, neighbours[j].length);

            for (var k = 0; k < neighbours[j].length; k++) {
                console.log('       ', 'n:', neighbours[j][k].label);
            }
        }
    }
});

test("setDiff", function(){
    var layout = this.layout;
    var copy = layout.graph.vertices.clone();

    copy.shift();

    console.log(layout.graph.vertices);
    console.log(copy);

    console.log(layout.graph.vertices.setdiff(copy));
});

test("process", function(){
    var layout = this.layout;

    function debugNodes(graph) {
        for (var i = 0; i < graph.vertices.length; i++) {
            var node = graph.vertices[i];
           //if (typeof node === 'undefined') continue;

           console.log('node:', node.label, 'x:', node.pos.x, 'y:', node.pos.y);
        }
    }

    debugNodes(layout.graph);
    console.log('--------------------');

    layout.run();

    debugNodes(layout.graph);
});

