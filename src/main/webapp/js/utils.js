/**
 * Created with JetBrains WebStorm.
 * User: amalyuhin
 * Date: 25.04.13
 * Time: 12:44
 * To change this template use File | Settings | File Templates.
 */

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.random = function () {
    return new Point(100 + Math.random() * 800, 100 + Math.random() * 700);
};

Point.prototype = {
    add: function (p2) {
        return new Point(this.x + p2.x, this.y + p2.y);
    },

    subtract: function (p2) {
        return new Point(this.x - p2.x, this.y - p2.y);
    },

    multiply: function (n) {
        return new Point(this.x * n, this.y * n);
    },

    posScalarProduct: function (n) {
        return new Point(this.x * n, this.x * n);
    },

    divide: function (n) {
        if (n === 0) return new Point(0, 0);
        return new Point(this.x / n, this.y / n);
    },

    magnitude: function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    },

    normalize: function () {
        return this.divide(this.magnitude());
    },

    distance: function (p2) {
        return Math.sqrt(Math.pow((this.x - p2.x), 2) + Math.pow((this.y - p2.y), 2));
    }
};


Array.prototype.clone = function () {
    var newClone = [];
    for (var key in this) if (this.hasOwnProperty(key)) {
        newClone[key] = this[key];
    }

    return newClone;
};
Array.prototype.contains = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) {
            return true;
        }
    }

    return false;
};
Array.prototype.setdiff = function (b) {
    var newArr = [];
    for (var i = 0; i < this.length; i++) {
        if (!b.contains(this[i])) {
            newArr.push(this[i]);
        }
    }

    return newArr;
};

var ut = {
    clone: function(obj) {
        if (obj == null || typeof(obj) !== 'object') {
            return obj;
        }

        var temp = {};

        for (var key in obj) {
            temp[key] = this.clone(obj[key]);
        }

        return temp;
    }
};