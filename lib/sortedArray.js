"use strict";

var binarySearch = require("binary-search");

function sortedArray(arr, comparator) {
    var _ = {};

    arr = arr || [];

    if (typeof arr._sortedArray === "object") {
        throw new Error("(sortedArray) Cannot extend array: Special key _sortedArray is already occupied. Did you apply it twice?");
    }
    arr._sortedArray = _;

    _.compare = comparator || defaultComparator;
    _.reversed = false;

    _.push = arr.push;
    arr.push = push;
    _.unshift = arr.unshift;
    _.splice = arr.splice;
    arr.splice = splice;
    arr.unshift = push;
    _.indexOf = arr.indexOf;
    arr.indexOf = indexOf;
    _.sort = arr.sort;
    arr.sort = sort;
    _.reverse = arr.reverse;
    arr.reverse = reverse;
    arr.findIndexFor = findIndexFor;

    if (arr.length > 0 && !comparator) {
        arr.sort();
    }

    return arr;
}

function push(element) {
    /* jshint validthis:true */
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

function splice(index, howMany, element1) {
    /* jshint validthis:true */
    var i;

    if (howMany > 0) {
        this._sortedArray.splice.call(this, index, howMany);
    }
    for (i = 2; i < arguments.length; i++) {
        pushSingle(this, arguments[i]);
    }
}

function indexOf(element) {
    /* jshint validthis:true */
    var index = binarySearch(this, element, this._sortedArray.compare);

    if (index < 0) {
        return -1;
    } else {
        return index;
    }
}

function sort(compare) {
    /* jshint validthis:true */
    var _ = this._sortedArray;

    if (compare) {
        _.compare = compare;
        _.reversed = false;
    } else {
        compare = _.compare;
    }

    _.sort.call(this, compare);
}

function reverse() {
    /* jshint validthis:true */
    var _ = this._sortedArray,
        reversed = _.reversed;

    if (reversed) {
        _.compare = _.compare.original;
    } else {
        _.compare = getInversionOf(_.compare);
    }
    _.reversed = !reversed;

    _.reverse.call(this);
}

function findIndexFor(element) {
    /* jshint validthis:true */
    var index = binarySearch(toArray(this), element, this._sortedArray.compare);

    if (index < 0) {
        // binarySearch adds +1 to the negative index because otherwise the index 0 would stand for two results
        // @see https://github.com/darkskyapp/binary-search/issues/1
        return Math.abs(index) - 1;
    } else {
        return index;
    }
}

function pushSingle(arr, element) {
    var index = arr.findIndexFor(element),
        _ = arr._sortedArray;

    // original push and unshift are faster than splice
    if (index === 0) {
        _.unshift.call(arr, element);
    } else if (index === arr.length) {
        _.push.call(arr, element);
    } else {
        _.splice.call(arr, index, 0, element);
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
function defaultComparator(a, b) {
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