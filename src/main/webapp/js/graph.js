/**
 * Created with JetBrains PhpStorm.
 * User: Andrey
 * Date: 20.09.12
 * Time: 23:56
 * To change this template use File | Settings | File Templates.
 */

function Graph() {
    this.vertices = [];
    this.edges = [];
    this.verticesCount = 0;
    this.edgesCount = 0;
    this.edgesMap = [];
    this.adjacency = [];
    this.adjList = [];
}

Graph.prototype = {
    getVerticesCount: function () {
        return this.verticesCount;
    },

    getEdgesCount: function () {
        return this.edgesCount;
    },

    addVertex: function (v) {
        var index = this.vertices.length;

        this.vertices[index] = v;

        if (!v.id) {
            v.id = index;
        }

        v.setWeight(1);

        this.verticesCount++;
    },

    getNodes: function () {
        return this.vertices;
    },

    getNode: function (id) {
        return this.vertices[id];
    },

    getAdjList: function (id) {
        var adjList = [];

        if (this.adjacency[id] !== undefined) {
            for (var i = 0; i < this.adjacency[id].length; i++) {
                var node = this.getNode(i);
                if (node === undefined) continue;

                adjList[node.id] = node;
            }
        }

        return adjList;
    },

    nodeAt: function (i) {
        return this.adjList[i];
    },

    addEdge: function (v, u, options) {
        if (v.id !== u.id && !this.hasEdge(v.id, u.id)) {
            var edge = new Edge(v, u, options);

            this.edges[this.edges.length] = edge;

            if (this.edgesMap[v.id] == undefined) {
                this.edgesMap[v.id] = [];
            }
            this.edgesMap[v.id][u.id] = true;

            if (this.edgesMap[u.id] == undefined) {
                this.edgesMap[u.id] = [];
            }
            this.edgesMap[u.id][v.id] = true;

            this.adjacency[v.id] = this.adjacency[v.id] || [];
            this.adjacency[v.id][u.id] = this.adjacency[v.id][u.id] || {};
            this.adjacency[u.id] = this.adjacency[u.id] || [];
            this.adjacency[u.id][v.id] = this.adjacency[u.id][v.id] || {};

            this.adjacency[v.id][u.id] = edge;
            this.adjacency[u.id][v.id] = edge;

            v.degree++;
            u.degree++;

            this.edgesCount++;
        }
    },

    removeEdge: function (v_id, u_id) {
        var edgesLength = this.getEdgesCount;

        for (var i = 0; i < edgesLength; i++) {
            if (this.edges[i] == undefined) continue;

            if ((this.edges[i].v.id === v_id && this.edges[i].u.id === u_id) ||
                (this.edges[i].v.id === u_id && this.edges[i].u.id === v_id)
            ) {
                this.edges.splice(i, 1);
                i--;
            }
        }

        if (this.edgesMap[v_id]) {
            this.edgesMap[v_id][u_id] = false;
        }
        if (this.edgesMap[u_id]) {
            this.edgesMap[u_id][v_id] = false;
        }

        if (this.adjacency[v_id]) {
            this.adjacency[v_id][u_id] = undefined;
        }
        if (this.adjacency[u_id]) {
            this.adjacency[u_id][v_id] = undefined;
        }

        this.edgesCount--;
    },

    removeVertex: function (id) {
        delete this.vertices[id];

        var edgesLength = this.getEdgesCount();

        for (var i = 0; i < edgesLength; i++) {
            if (this.edges[i] == undefined) continue;

            if (this.edges[i].v.id === id || this.edges[i].u.id === id) {
                this.edges.splice(i, 1);
                i--;
            }
        }

        var verticesLength = this.vertices.length;
        for (var j = 0; j < verticesLength; j++) {
            if (this.edgesMap[id]) {
                this.edgesMap[id][j] = false;
            }
            if (this.edgesMap[j]) {
                this.edgesMap[j][id] = false;
            }

            if (this.adjacency[id]) {
                this.adjacency[id][j] = undefined;
            }
            if (this.adjacency[j]) {
                this.adjacency[j][id] = undefined;
            }
        }

        this.verticesCount--;
    },

    hasEdge: function (v_id, u_id) {
        return ((this.edgesMap[v_id] != undefined && this.edgesMap[v_id][u_id] === true) ||
                (this.edgesMap[u_id] != undefined && this.edgesMap[u_id][v_id] === true));
    },

    getEdge: function (v_id, u_id) {
        var edgesLength = this.edges.length;

        for (var i = 0; i < edgesLength; i++) {
            var e = this.edges[i];
            if (e === undefined) continue;

            if ((e.v.id === v_id && e.u.id === u_id) || (e.v.id === u_id && e.u.id === v_id)) {
                return e;
            }
        }

        return null;
    },

    getVertexByLabel: function (label) {
        var verticesLength = this.verticesCount;
        for (var i = 0; i < verticesLength; i++) {
            if (this.vertices[i].label == label) {
                return this.vertices[i];
            }
        }

        return null;
    },

    selectVertex: function (vertex) {
        vertex.select();

        var edgesLength = this.getEdgesCount();
        for (var i = 0; i < edgesLength; i++) {
            if (!this.edges[i]) continue;

            if (this.edges[i].v.id === vertex.id || this.edges[i].u.id === vertex.id) {
                this.edges[i].select();
            }
        }
    },

    unselectVertex: function (vertex) {
        vertex.unselect();

        var edgesLength = this.getEdgesCount();
        for (var i = 0; i < edgesLength; i++) {
            if (!this.edges[i]) continue;

            var v = this.edges[i].v;
            var u = this.edges[i].u;
            if ((v.id === vertex.id || u.id === vertex.id) && !v.isSelected && !u.isSelected) {
                this.edges[i].unselect();
            }
        }
    }
};

Graph.random = function (nodesCount, edgesCount) {
    nodesCount = nodesCount || 100;
    edgesCount = edgesCount || nodesCount - 1;

    var g = new Graph();
    var i;

    function createEdge(vId, uId) {
        var v = g.getNode(vId);
        var u = g.getNode(uId);

        if (vId === uId || g.hasEdge(vId, uId) || v == undefined || u == undefined) {
            return null;
        }

        return new Edge(v, u);
    }

    for (i = 0; i < nodesCount; i++) {
        g.addVertex(new Vertex(i + 1));
    }

    for (i = 0; i < edgesCount; i++) {
        var e = undefined;

        while (e == undefined) {
            e = createEdge(Math.floor(Math.random() * (nodesCount + 1)), Math.floor(Math.random() * (nodesCount + 1)));
        }

        g.addEdge(e.v, e.u);
    }

    return g;
};


function Vertex(label, options) {
    var defaults = {
        radius: 10,
        fillStyle: 'orange',
        selectedFillStyle: 'red'
    };

    this.label = label;
    this.weight = 0;
    this.isSelected = false;
    this.degree = 0;
    this.isCluster = false;
    this.clusterData = {};

    if (typeof(options) === 'object') {
        this.options = $.extend(defaults, options);
    } else {
        this.options = defaults;
    }

    if (typeof(this.options.id) === 'number' && this.options.id % 1 === 0) {
        this.id = this.options.id;
    }

    this.radius = this.options.radius;

    this.pos = Point.random();
    this.disp = new Point(0, 0);

    this.depth = 0;
    this.cos = 0;
    this.heat = 0;
    this.neighbours = [];
    this.distTable = null;
    this.adjList = [];
    this.targets = [];

    this.events = [];
}

Vertex.prototype = {
    addNode: function (n) {
        this.adjList.push(n);
    },

    getAdjList: function () {
        return this.adjList;
    },

    nodeAt: function (i) {
        return this.adjList[i];
    },

    setNeighbours: function (arr) {
        this.neighbours = arr;
    },

    getNeighbours: function () {
        return this.neighbours;
    },

    setWeight: function (weight) {
        this.weight = weight;
    },

    getWeight: function () {
        return this.weight;
    },

    select: function () {
        this.isSelected = true;
    },

    unselect: function () {
        this.isSelected = false;
    },

    updatePosition: function (pos) {
        this.pos.x = pos.x;
        this.pos.y = pos.y;

        this.dispatch('changePosition');
    },

    changePosition: function (x, y) {
        this.pos.x = x;
        this.pos.y = y;

        this.dispatch('changePosition');
    },

    changeDisp: function (x, y) {
        this.disp.x = x;
        this.disp.y = y;

        this.dispatch('changeDisp');
    },

    addEventlistener: function (event, callback) {
        this.events[event] = this.events[event] || [];
        if (this.events[event]) {
            this.events[event].push(callback);
        }
    },

    removeEventlistener: function (event, callback) {
        if (this.events[event]) {
            var listeners = this.events[event];

            for (var i = listeners.length - 1; i >= 0; --i) {
                if (listeners[i] === callback) {
                    listeners.splice(i, 1);
                    return true;
                }
            }
        }

        return false;
    },

    removeAllEventlisteners: function () {
        this.events = [];
    },

    dispatch: function (event) {
        if (this.events[event]) {
            var listeners = this.events[event], len = listeners.length;

            while (len--) {
                listeners[len](this);
            }
        }
    }
};


function Edge(v, u, options) {
    var defaults = {
        lineColor: "rgba(0,0,0, .6)",
        lineWidth: 1,
        //selectedLineColor: 'red',
        selectedLineWidth: 3
    };

    this.v = v;
    this.u = u;
    this.isSelected = false;

    if (typeof(options) === 'object') {
        if (!options.hasOwnProperty('lineWidth') && options.hasOwnProperty('weight')) {
            options.lineWidth = options.weight;
        }

        this.options = $.extend(defaults, options);

    } else {
        this.options = defaults;
    }
}

Edge.prototype = {
    select: function () {
        this.isSelected = true;
    },

    unselect: function () {
        this.isSelected = false;
    }
};

var cloner = {
    _clone: function _clone(obj) {
        var out;
        var value;

        if (obj instanceof Array) {
            out = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                value = obj[i];
                out[i] = (value !== null && typeof value === "object") ? _clone(value) : value;
            }
        } else {
            out = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    value = obj[key];
                    out[key] = (value !== null && typeof value === "object") ? _clone(value) : value;
                }
            }
        }
        return out;
    },

    clone: function(it) {
       return this._clone({it: it}).it;
    },

    cloneObject: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
 };
