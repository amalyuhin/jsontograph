/**
 * Created with JetBrains WebStorm.
 * User: amalyuhin
 * Date: 25.04.13
 * Time: 12:49
 * To change this template use File | Settings | File Templates.
 */

function GripLayout(canvas, graph) {
    console.time('Algorithm execution');

    Layout.call(this, [canvas, graph]);

    this.graph = graph;

    this.vSubsets  = [];
    /**Used for the calulation of the initial node positions*/
    this.vRefNodes = [];
    /**Standard length of an edge. USed for the calculation of the Kawai-Kamada vector*/
    this.cEdgeLength = 10;

    this.cRounds = 2;

    this.dist = [];
    this.next = [];
    this.oGUtils = new SMG_GraphUtils();
}

GripLayout.prototype = {
    run: function () {
        console.time('Start algorithm execution');

        var vSubsets = this.buildMisFiltration();      //MIS filtration
        var currentSet = vSubsets[vSubsets.length - 1];    //Las MIS set

        for (var i = 0; i < currentSet.length; i++) {
            var tmpNode = currentSet[i];
            this.findNodeNeighbours(tmpNode);
            this.findInitialNodePosition(tmpNode);
        }

        for (var j = vSubsets.length - 2; j >= 0; j--) {
            currentSet = vSubsets[j].setdiff(currentSet);

            for (var k = 0; k < currentSet.length; k++) {
                var tempNode = currentSet[k];
                this.findNodeNeighbours(tempNode);
                this.findInitialNodePosition(tempNode);
            }

            for (var l = this.cRounds; l > 0; l--) {
                for (var m = 0; m < currentSet.length; m++) {
                    tempNode = currentSet[m];
                    var disp;
                    if (l > 1) {
                        disp = this.computeKKVector(tempNode, j - 1);
                        //console.log('KKDisp:', disp);
                    } else {
                        disp = this.computeFRVector(tempNode, j - 1);
                        //console.log('FRDisp:', disp);
                        //disp = disp.divide(30);
                    }



                    this.updateLocalTemp(tempNode, disp);
                    //console.log("disp before ", disp.x, disp.y);
                    //disp = oGUtils.posScalarProduct(tempNode.getHeat(),
                    //				    oGUtils.posScalarDivision(disp,
                    //						      oGUtils.calculateNorm(disp)));
                    //console.log("disp after ", disp.getX(), disp.getY());

                    tempNode.changePosition(tempNode.pos.x + disp.x, tempNode.pos.y + disp.y);
                }
            }

            currentSet = vSubsets[j];
        }

        //this.context.save();
        //this.context.translate(this.canvasWidth/2, this.canvasHeight/2);
        //this.redraw();
        //this.context.restore();

        //this.stop();
        console.timeEnd('Start algorithm execution');
    },

    buildMisFiltration: function () {
        var vSubsets = [];

        vSubsets.push(this.graph.vertices);

        for (var t = 0; t < this.graph.vertices.length; t++) {
            this.graph.getNode(t).pos = new Point(0, 0);
        }

        var tempNodes = this.graph.vertices.clone();
        var nextSet = [];

        for (var i = 0; i < tempNodes.length; i++) {

            while (tempNodes.length > 0) {
                var tempNode = tempNodes.shift();

                nextSet.push(tempNode);
                tempNode.depth++;

                if (tempNode.distTable === null) {
                    tempNode.distTable = this.calculateDistances(tempNode);
                }

                for (var j = 0; j < tempNodes.length; j++) {
                    var node = tempNodes[j];
                    if (node.id in tempNode.distTable &&
                        tempNode.distTable[node.id] <= Math.pow(2, i)) {
                        tempNodes.splice(j, 1);
                    }
                }
            }

            vSubsets.push(nextSet.clone());
            tempNodes = nextSet;
            nextSet = [];
        }

        return vSubsets;
    },

    findNodeNeighbours: function (node) {
        var visited = [];
        var nodesQ = [];
        var neighbours = [];

        node.setNeighbours([]);
        visited.push(node);
        nodesQ.unshift(node);

        while (nodesQ.length > 0) {
            var n = nodesQ.shift();

            for (var i = 0; i < n.getAdjList().length; i++) {
                n = n.nodeAt(i);

                if (!visited.contains(n)) {
                    for (var j = 0; j < node.depth; j++) {
                        if (neighbours.length < node.depth) {
                            neighbours.push([]);
                        }

                        if (j < n.depth && neighbours[j].length < this.nbrs(j + 1)) {
                            neighbours[j].push(n);
                        }
                    }

                    nodesQ.push(n);
                    visited.push(n);
                }
            }
        }
    },

    findInitialNodePosition: function(node){
        var vRefNodes = this.vRefNodes;

        if (vRefNodes.length == 0){
            node.pos.x = 0;
            node.pos.y = 0;
            vRefNodes.push(node);

        } else if (vRefNodes.length < 3){
            var referenceNodePosition = new Point(
                vRefNodes[vRefNodes.length-1].pos.x,
                vRefNodes[vRefNodes.length-1].pos.y
            );
            var distance = Math.floor(Math.random() * 100);
            if (vRefNodes[vRefNodes.length-1].distTable != null &&
                vRefNodes[vRefNodes.length-1].distTable.contains(node)) {
                distance = vRefNodes[vRefNodes.length-1].distTable[node];
            }
            var tempNodePosition = this.getRandomPoint(referenceNodePosition, distance);

            node.pos.x = tempNodePosition.x;
            node.pos.y = tempNodePosition.y;
            vRefNodes.push(node);

        } else {
            this.find3NodesPos(vRefNodes, node);
            vRefNodes.shift();
            vRefNodes.push(node);
        }
    },

    nbrs: function(size){
        var nodes = this.graph.getNodes();

        return Math.ceil((this.avgDeg(nodes) * nodes.length) / size);
    },

    avgDeg: function(nodes) {
        var gradesSum = 0;
        for (var i = 0; i < nodes.length; i++){
            gradesSum += nodes[i].degree;
        }
        return (gradesSum / nodes.length);
    },

    calculateDistances: function(node) {
        var vDistHash = [];
        var nodeQ = [];

        vDistHash[node.id] = 0;
        nodeQ.unshift(node);

        while (nodeQ.length > 0) {
            var n = nodeQ.shift();
            var currDist = vDistHash[n.id];

            for (var i = 0; i < n.getAdjList().length; i++) {
                var adjNode = n.nodeAt(i);

                if (!(adjNode.id in vDistHash)) {
                    nodeQ.unshift(adjNode);
                    vDistHash[adjNode.id] = currDist + 1;
                }
            }
        }

        return vDistHash;
    },

    getRandomPoint: function(oOrigin, vRadius){
        var phi = Math.floor(Math.random() * 360);

        return new Point(Math.cos(phi)*(vRadius) + oOrigin.x, Math.sin(phi)*(vRadius) + oOrigin.y);
    },

    find3NodesPos: function(vRefNodes, oNewNode) {
        var radia =  this.getMinMaxRadius(vRefNodes);
        var angles = this.getMinMaxAngle(vRefNodes);
        var radius = radia[0] + (radia[0] - radia[1])/3;
        var angle = angles[0] + (angles[0] - angles[1])/2;

        this.createPoint(radius, angle, oNewNode);
    },

    getMinMaxRadius: function (vNodes) {
        var iTempMax;
        var iTempMin = iTempMax = vNodes[0].pos.magnitude();

        for (var i = 1; i < vNodes.length; i++) {
            var iTempValue = vNodes[i].pos.magnitude();
            if (iTempMax < iTempValue) iTempMax = iTempValue;
            if (iTempMin > iTempValue) iTempMin = iTempValue;
        }

        return {0: iTempMax, 1: iTempMin};
    },

    getMinMaxAngle: function (nodes) {
        var iTempMax;
        var iTempMin = iTempMax = Math.atan2(nodes[0].pos.y, nodes[0].pos.x);

        for (var i = 1; i < nodes.length; i++) {
            var iTempValue = Math.atan2(nodes[i].pos.y, nodes[i].pos.x);
            if (iTempMax < iTempValue) iTempMax = iTempValue;
            if (iTempMin > iTempValue) iTempMin = iTempValue;
        }

        return {0: iTempMax, 1: iTempMin};
    },

    createPoint: function (vRadius, vAngle, oNode) {
        var x = Math.cos(vAngle) * (vRadius);
        var y = Math.sin(vAngle) * (vRadius);

        oNode.pos = new Point(Math.floor(x), Math.floor(y));
    },

    computeKKVector: function (oNode, i) {
        var vNeighbours = oNode.getNeighbours();
        var iKKVector = new Point(0, 0);
        var oNodePos = oNode.pos;
        var tempPos = new Point(0, 0);

        console.log('Neighbours:', vNeighbours);

        //iterVal = vNeighbours.length;
        //for (var i = 0; i < vNeighbours.length; i++){
        //console.log("neighbours ", vNeighbours.length, i);
        if (i > 0 && vNeighbours.length > i) {
            for (var h = 0; h < vNeighbours[i].length; h++) {
                //console.log("length ", vNeighbours[i][h].length);
                if (vNeighbours[i][h].id in oNode.distTable) {
                    var oTempNodePos = vNeighbours[i][h].pos;

                    tempPos = this.oGUtils.posAddition(tempPos,
                        this.oGUtils.posScalarProduct(Math.floor(0.005 *
                            ((this.oGUtils.posDistance(oNodePos, oTempNodePos) /
                                (oNode.distTable[vNeighbours[i][h].id] * this.cEdgeLength)) - 1)),
                            this.oGUtils.posDifference(oNodePos, oTempNodePos)));

/*
                    tempPos = tempPos.add(
                        oNodePos.subtract(oTempNodePos).multiply(
                            Math.floor(0.005 *
                                ((oNodePos.distance(oTempNodePos) / (oNode.distTable[vNeighbours[i][h].id] * this.cEdgeLength)) - 1)
                            )
                        )
                    );*/


                    /*tempPos = tempPos.add(
                        oNodePos.subtract(oTempNodePos).multiply(
                            Math.floor(0.005 * ((oNodePos.distance(oTempNodePos) / oNode.distTable[vNeighbours[i][h].id] * Math.pow(this.cEdgeLength, 2)) - 1))
                        )
                    );*/
                }
            }

            iKKVector = iKKVector.add(tempPos);
        }
        //}
        //console.log(iKKVector.getX(), iKKVector.getY());

        return iKKVector;
    },

    computeFRVector: function (oNode, index) {
        var vNeighbours = oNode.getNeighbours();
        var vAdjNodes = oNode.getAdjList();
        var iFRVector = new Point(0, 0);
        var oNodePos = oNode.pos;
        var tempPos = new Point(0, 0);

        for (var i = 0; i < vAdjNodes.length; i++) {
            var oTempNodePos = vAdjNodes[i].pos;

            /*tempPos = this.oGUtils.posAddition(tempPos,
                this.oGUtils.posScalarProduct(Math.floor(0.0005 *
                    Math.pow(this.oGUtils.posDistance(oNodePos, oTempNodePos), 2) /
                    Math.pow(this.cEdgeLength, 2)),
                    this.oGUtils.posDifference(oTempNodePos, oNodePos)));*/

            var tempPos1 = oNodePos.subtract(oTempNodePos).multiply(
                Math.floor(0.0005 * Math.pow(oNodePos.distance(oTempNodePos), 2) / Math.pow(this.cEdgeLength, 2))
            );

            tempPos = tempPos.add(tempPos1);

            console.log('temp pos 1:', tempPos1);
        }

        //iFRVector = iFRVector.add(tempPos);

        //for (var i = 0; i < vNeighbours.length; i++){
        if (index > 0 && vNeighbours.length > index) {
            var iterVal = vNeighbours[index].length;

            for (var h = 0; h < iterVal; h++) {
                var oTempNodePos = vNeighbours[index][h].pos;

               /* tempPos = this.oGUtils.posAddition(tempPos,
                    this.oGUtils.posScalarProduct(Math.floor(0.0008 *
                        (Math.pow(this.cEdgeLength, 2) /
                            Math.pow(this.oGUtils.posDistance(oNodePos, oTempNodePos), 2))),
                        this.oGUtils.posDifference(oNodePos, oTempNodePos)));*/

                var tempPos2 = oTempNodePos.subtract(oNodePos).multiply(
                    Math.floor(0.0005 * 0.05 * Math.pow(oNodePos.distance(oTempNodePos), 2) / Math.pow(this.cEdgeLength, 2))
                );

                tempPos.add(tempPos2);
                console.log('temp pos 2:', tempPos2);

                /*tempPos = tempPos.add(
                    oNodePos.subtract(oTempNodePos).multiply(
                        Math.floor(0.0008 *
                            Math.pow(this.cEdgeLength, 2) /
                            Math.pow(oNodePos.distance(oTempNodePos), 2)
                        )
                    )
                );*/
            }

        }
        //console.log(iFRVector.getX(), iFRVector.getY());
        iFRVector = iFRVector.add(tempPos);

        return iFRVector;
    },

    updateLocalTemp: function(node, disp){
        var cos = 0;
        var r = 0.3;
        var s = 3;
        var normDisp = disp.magnitude();
        var normOldDisp = node.disp.magnitude();

        if (normDisp != 0 && normOldDisp != 0){
            cos = disp.add(node.disp).divide(normDisp * normOldDisp);

            if ((node.cos * cos) > 0) {
                node.heat = node.heat + (1 + cos * r * s);
            } else {
                node.heat = node.heat + (1 + cos * r);
            }

            node.cos = cos;
        }
    }
};

inherit(GripLayout, Layout);
