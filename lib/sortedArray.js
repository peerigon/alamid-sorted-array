"use strict";

var binarySearch = require("binary-search");

function sortedArray(arr, compare) {
    arr = arr || [];

    arr._compare = compare || defaultCompare;
    arr._reversed = false;

    arr._push = arr.push;
    arr.push = push;
    arr._unshift = arr.unshift;
    arr.unshift = push;
    arr._indexOf = arr.indexOf;
    arr.indexOf = indexOf;
    arr._sort = arr.sort;
    arr.sort = sort;
    arr._reverse = arr.reverse;
    arr.reverse = reverse;
    arr.findIndexFor = findIndexFor;

    if (arr.length > 0 && !compare) {
        arr.sort();
    }

    return arr;
}

function push(element) {
    var i;

    if (arguments.length === 1) {
        pushSingle(this, element);
    } else {
        for (i = 0; i < arguments.length; i++) {
            pushSingle(this, arguments[i]);
        }
    }

    return this.length;
}

function indexOf(element) {
    var index = binarySearch(this, element, this._compare);

    if (index < 0) {
        return -1;
    } else {
        return index;
    }
}

function sort(compare) {
    if (compare) {
        this._compare = compare;
        this._reversed = false;
    } else {
        compare = this._compare;
    }

    this._sort(compare);
}

function reverse() {
    var reversed = this._reversed;

    if (reversed) {
        this._compare = this._compare.original;
    } else {
        this._compare = getInversionOf(this._compare);
    }
    this._reversed = !reversed;

    this._reverse();
}

function findIndexFor(element) {
    var index = binarySearch(toArray(this), element, this._compare);

    if (index < 0) {
        // binarySearch adds +1 to the negative index because otherwise the index 0 would stand for two results
        // @see https://github.com/darkskyapp/binary-search/issues/1
        return Math.abs(index) - 1;
    } else {
        return index;
    }
}

function pushSingle(arr, element) {
    var index = arr.findIndexFor(element);

    // original push and unshift are faster than splice
    if (index === 0) {
        arr._unshift(element);
    } else if (index === arr.length) {
        arr._push(element);
    } else {
        arr.splice(index, 0, element);
    }
}

function getInversionOf(compare) {
    function inversion(a, b) {
        return -compare(a, b);
    }

    inversion.original = compare;

    return inversion;
}

function toArray(self) {
    if (self instanceof Array) {
        return self;
    } else if (typeof self.toArray === "function") {
        return self.toArray();
    } else if (self.elements) {
        if (self.elements instanceof Array) {
            return self.elements;
        } else if (typeof self.elements === "function") {
            return self.elements();
        }
    } else if (self.items) {
        if (self.items instanceof Array) {
            return self.items;
        } else if (typeof self.items === "function") {
            return self.items();
        }
    }
    throw new Error("(sortedArray) Could not transform instance to array. It should provide either .toArray(), .elements or .items");
}

/**
 * @see https://github.com/substack/node-sorted/blob/master/index.js
 *
 * @param a
 * @param b
 * @returns {number}
 */
function defaultCompare(a, b) {
    if (a == b) {
        return 0;
    } else if (a > b) {
        return 1;
    } else if (a < b) {
        return -1;
    } else {
        throw new Error("Unstable comparison: " + a + " compared to " + b);
    }
}

module.exports = sortedArray;