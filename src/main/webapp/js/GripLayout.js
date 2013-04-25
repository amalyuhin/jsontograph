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
    this.cEdgeLength = 15;

    this.cRounds = 2;
}

GripLayout.prototype = {
    run: function () {
        this.draw();

        var vRefNodes = this.vRefNodes;
        var vNodes = [];
        var vSubsets = this.vSubsets;

        vSubsets = this.calculateNodeFiltering();

        console.log('subset: ', vSubsets);

        var currentSet = vSubsets[vSubsets.length - 1];
        for (var i = 0; i < currentSet.length; i++) {
            var tempNode = currentSet[i];
            this.findNodeNeighbours(tempNode);
            this.findInitialNodePosition(tempNode);
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
                    } else {
                        disp = this.computeFRVector(tempNode, j);
                    }

                    this.updateLocalTemp(tempNode, disp);
                    console.log("disp before ", disp.x, disp.y);
                    //disp = oGUtils.posScalarProduct(tempNode.getHeat(),
                    //				    oGUtils.posScalarDivision(disp,
                    //						      oGUtils.calculateNorm(disp)));
                    //console.log("disp after ", disp.getX(), disp.getY());
                    disp = disp.divide(1000);
                    tempNode.changePosition(disp.x, disp.y);
                }
            }



            currentSet = vSubsets[j];
        }

        this.redraw();
    },

    calculateNodeFiltering: function () {
        var vSubsets = [];
        vSubsets.push(this.graph.vertices);

        var tempNodes = this.graph.vertices.clone();
        var futureSet = [];
        for (var i = 0; i < tempNodes.length; i++) {

            while (tempNodes.length > 0) {
                var tempNode = tempNodes.shift();

                futureSet.push(tempNode);
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

            vSubsets.push(futureSet.clone());
            tempNodes = futureSet;
            futureSet = [];
        }
        // 	for (var i = 0; i < vSubsets.length; i++){
        // 	    for (var k = 0; k < vSubsets[i].length; k++){
        // 		console.log("Node " +
        // 			    vSubsets[i][k].getId()
        // 			    + " has depth " + vSubsets[i][k].depth
        // 			    + " in subset " + i);
        // 	    }
        // 	}
        return vSubsets;
    },

    findNodeNeighbours: function (focusNode) {
        var visitedNodes = [];
        var nodeQ = [];
        var nodesLength = this.graph.getNodes().length;

        focusNode.setNeighbours([]);
        visitedNodes.push(focusNode);
        nodeQ.unshift(focusNode);

        while (nodeQ.length > 0) {
            var n = nodeQ.shift();

            for (var i = 0; i < nodesLength; i++) {
                if (this.graph.hasEdge(n.id, i)) {

                    n = this.graph.getNode(i);

                    if (!visitedNodes.contains(n)) {
                        //j ist die Anzahl der Nachbarschaftsmengen
                        for (var j = 0; j < focusNode.depth; j++) {
                            if (focusNode.getNeighbours().length < focusNode.depth) {
                                var nJ = [];//Die j-te Nachbarschaftsmenge
                                focusNode.getNeighbours().push(nJ);
                            }
                            if (j < n.depth && focusNode.getNeighbours()[j].length < this.nbrs(j + 1)) {
                                focusNode.getNeighbours()[j].push(n);
                            }
                        }
                        nodeQ.push(n);
                        visitedNodes.push(n);
                    }

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
        //console.log(node.getId() + "-" + node.getX() + "," + node.getY());
    },

    nbrs: function(size){
        var nodes = this.graph.getNodes();

        return Math.ceil((this.avgDeg(nodes) * nodes) / size);
    },

    avgDeg: function(nodes) {
        var gradesSum = 0;
        for (var i = 0; i < nodes.length; i++){
            gradesSum += nodes[i].degree;
        }
        return (gradesSum / nodes.length);
    },

    calculateDistances: function(oFocusNode) {
        var vDistHash = [];
        var nodeQ = [];

        vDistHash[oFocusNode.id] = 0;
        nodeQ.unshift(oFocusNode);

        while (nodeQ.length > 0) {
            var n = nodeQ.shift();
            var currDist = vDistHash[n.id];

            for (var i = 0; i < this.graph.vertices.length; i++) {
                if (this.graph.hasEdge(n.id, i)) {
                    var adjNode = this.graph.vertices[i];

                    if (!(adjNode.id in vDistHash)) {
                        nodeQ.unshift(adjNode);
                        vDistHash[adjNode.id] = currDist + 1;
                    }
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
        var iTempMin = iTempMax = Math.sqrt(Math.pow(vNodes[0].pos.x, 2) + Math.pow(vNodes[0].pos.y, 2));

        for (var i = 1; i < vNodes.length; i++) {
            var iTempValue = Math.sqrt(Math.pow(vNodes[i].pos.x, 2) + Math.pow(vNodes[i].pos.y, 2));
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

        oNode.pos.x = Math.floor(x);
        oNode.pos.y = Math.floor(y);
    },

    computeKKVector: function (oNode, i) {
        var vNeighbours = oNode.getNeighbours();
        var iKKVector = new Point(0, 0);
        var oNodePos = oNode.pos;
        var tempPos = new Point(0, 0);

        //iterVal = vNeighbours.length;
        //for (var i = 0; i < vNeighbours.length; i++){
        //console.log("neighbours ", vNeighbours.length, i);
        if (i > 0 && vNeighbours.length > i) {
            for (var h = 0; h < vNeighbours[i].length; h++) {
                //console.log("length ", vNeighbours[i][h].length);
                if (vNeighbours[i][h].id in oNode.distTable) {
                    var oTempNodePos = vNeighbours[i][h].pos;
                    /*tempPos = oGUtils.posAddition(tempPos,
                        oGUtils.posScalarProduct(Math.floor(0.005 *
                            ((oGUtils.posDistance(oNodePos, oTempNodePos) /
                                (oNode.distTable[vNeighbours[i][h].id] * this.cEdgeLength)) - 1)),
                            oGUtils.posDifference(oNodePos, oTempNodePos)));*/

                    tempPos = tempPos.add(
                        oNodePos.subtract(oTempNodePos).multiply(
                            Math.floor(0.005 *
                                ((oNodePos.distance(oTempNodePos) / (oNode.distTable[vNeighbours[i][h].id] * this.cEdgeLength)) - 1)
                            )
                        )
                    );
                    //console.log("temp Pos ", tempPos.getX(), tempPos.getY());
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
        var iFRVector = new Point(0, 0);
        var oNodePos = oNode.pos;
        var tempPos = new Point(0, 0);

        for (var i = 0; i < this.graph.getNodes().length; i++) {
            if (i !== oNode.id && this.graph.hasEdge(oNode.id, i)) {

                var oTempNodePos = this.graph.getNode(i).pos;

                /*tempPos = oGUtils.posAddition(tempPos,
                    oGUtils.posScalarProduct(Math.floor(0.0005 *
                        Math.pow(oGUtils.posDistance(oNodePos, oTempNodePos), 2) /
                        Math.pow(cEdgeLength, 2)),
                        oGUtils.posDifference(oTempNodePos, oNodePos)));*/

                tempPos = tempPos.add(
                    oTempNodePos.subtract(oNodePos).multiply(
                        Math.floor(
                            0.005 *
                            Math.pow(oNodePos.distance(oTempNodePos), 2) /
                            Math.pow(this.cEdgeLength, 2)
                        )
                    )
                );
            }
        }

        iFRVector = iFRVector.add(tempPos);

        //for (var i = 0; i < vNeighbours.length; i++){
        if (index > 0 && vNeighbours.length > index) {
            var iterVal = vNeighbours[index].length;

            for (var h = 0; h < iterVal; h++) {
                var oTempNodePos = vNeighbours[index][h].pos;

                /*tempPos = oGUtils.posAddition(tempPos,
                    oGUtils.posScalarProduct(Math.floor(0.0008 *
                        (Math.pow(cEdgeLength, 2) /
                            Math.pow(oGUtils.posDistance(oNodePos, oTempNodePos), 2))),
                        oGUtils.posDifference(oNodePos, oTempNodePos)));*/

                tempPos = tempPos.add(
                    oNodePos.subtract(oTempNodePos).multiply(
                        Math.floor(0.0008 * (Math.pow(this.cEdgeLength, 2) / Math.pow(oNodePos.distance(oTempNodePos), 2)))
                    )
                );
            }

        }
        //console.log(iFRVector.getX(), iFRVector.getY());
        iFRVector = iFRVector.add(tempPos);

        return iFRVector;
    },

    updateLocalTemp: function(node, disp){
        var cos = 0;
        var r = 0.15;
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
