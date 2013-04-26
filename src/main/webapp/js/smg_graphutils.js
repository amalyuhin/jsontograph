//Returns a deep copy of the array
Array.prototype.clone = function(){ 
    var newClone = new Array(); 
    for(item in this){
	newClone[item] = this[item];
    }
    return newClone;
}

Array.prototype.contains = function(val){
    for (var i = 0; i < this.length; i++){
	if (this[i] == val){
	    return true;
	}
    }
    return false;
}

Array.prototype.setdiff = function(b){
    var newArr = []
    for (var i = 0; i < this.length; i++){
	if (!b.contains(this[i])){
	    newArr.push(this[i]);
	}
    }
    return newArr;
}

var SMG_Point = function(iX,iY) {
    var x = iX;
    var y = iY;
    this.getX = function(){return x;}
    this.getY = function(){return y;}
    this.setX = function(iX){x = Math.floor(iX);}
    this.setY = function(iY){y = Math.floor(iY);}
}

var SMG_GraphUtils = function(){
    this.calculateDistances = function(oFocusNode) {
	var vDistHash = new Array();
	vDistHash[oFocusNode.getId()] = 0;
	var nodeQ = new Array();
	nodeQ.unshift(oFocusNode);
	while (nodeQ.length > 0) {
	    var n = nodeQ.shift();
	    var currDist = vDistHash[n.getId()];
	    for (i = 0; i < n.getAdjList().length; i++) {
		var adjNode=n.nodeAt(i);
		if(!(adjNode.getId() in vDistHash)) {
		    nodeQ.unshift(adjNode);
		    vDistHash[adjNode.getId()] = currDist + 1;
		}
	    }
	}
	return vDistHash;
    }
    
    this.getRandomPoint = function(oOrigin, vRadius){
	var oRandomPoint = new SMG_Point(0,0);
	var phi = Math.floor(Math.random() * 360);
	oRandomPoint.setX(Math.cos(phi)*(vRadius) + oOrigin.getX());
	oRandomPoint.setY(Math.sin(phi)*(vRadius) + oOrigin.getY());
	return oRandomPoint;
    }
    
    this.createPoint = function(vRadius,vAngle,oNode){
	var x = Math.cos(vAngle)*(vRadius);
	var y = Math.sin(vAngle)*(vRadius);
	oNode.setPosition(Math.floor(x), Math.floor(y));
	//console.log(Math.floor(x) + "," + Math.floor(y));
    }
    
    this.getMinMaxRadius = function(vNodes){
	var iTempMax;
	var iTempMin = iTempMax = Math.sqrt(Math.pow(vNodes[0].getX(),2) +  Math.pow(vNodes[0].getY(),2));
	for (var i = 1; i < vNodes.length; i++){
	    var iTempValue = Math.sqrt(Math.pow(vNodes[i].getX(),2) +  Math.pow(vNodes[i].getY(),2));
	    if (iTempMax < iTempValue) iTempMax = iTempValue;
	    if (iTempMin > iTempValue) iTempMin = iTempValue;
	}
	var results = {0:iTempMax, 1:iTempMin};
	return results;
    }
    
    this.getMinMaxAngle = function(nodes){
	var iTempMax;
	var iTempMin = iTempMax = Math.atan2(nodes[0].getY(), nodes[0].getX());
	for (var i = 1; i < nodes.length; i++){
	    var iTempValue = Math.atan2(nodes[i].getY(),nodes[i].getX());
	    if (iTempMax < iTempValue) iTempMax = iTempValue;
	    if (iTempMin > iTempValue) iTempMin = iTempValue;
	}
	var results = {0:iTempMax, 1:iTempMin};
	return results;
    }
    
    this.posDistance = function(pointU, pointV){
	return Math.sqrt(Math.pow(pointU.x - pointV.x,2) +
			 Math.pow(pointU.y - pointV.y,2));
    }
    
    this.avgDeg = function(nodes) {
	var gradesSum = 0;
	for (var i = 0; i < nodes.length; i++){
	    gradesSum += nodes[i].degree;
	}
	return (gradesSum / nodes.length);
    }

    this.posDifference = function(point1, point2){
	return new Point((point1.x - point2.x),
			     (point1.y - point2.y));
    }

    this.posAddition = function(point1, point2){
	return new Point((point1.x + point2.x),
			     (point1.y + point2.y));
    }

    this.posScalarProduct = function(scalar, point){
	return new Point(Math.floor((scalar * point.x)),
			     Math.floor((scalar * point.x)));
    }
    
    this.posScalarDivision = function(point, scalar){
	if (scalar != 0) {
	    return new Point(Math.floor((point.x / scalar)),
				 Math.floor((point.y / scalar)));
	}
	else {
	    return point;
	}
    }
    this.posProduct = function(point1, point2){
	return new Point(point1.x + point2.x,
			     point1.y + point2.y);
    }

    this.calculateNorm = function(vector){
	return Math.sqrt(Math.pow(vector.getX(), 2) + 
			 Math.pow(vector.getY(), 2));
    }

}
