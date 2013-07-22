"use strict";

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
    return Math.abs(binarySearch(this, element, this._compare));
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

/**
 * @see https://github.com/darkskyapp/binary-search/blob/master/index.js
 *
 * @param haystack
 * @param needle
 * @param comparator
 * @returns {number}
 */
function binarySearch(haystack, needle, comparator) {
    var low = 0,
        high = haystack.length - 1,
        mid, cmp;

    while (low <= high) {
        mid = (low + high) >>> 1;
        cmp = comparator(haystack[mid], needle);

        if (cmp < 0) { /* Too low. */
            low = mid + 1;
        } else if (cmp > 0) { /* Too high. */
            high = mid - 1;
        } else { /* Key found. */
            return mid;
        }
    }

    /* Key not found. */
    return -low;
}

module.exports = sortedArray;