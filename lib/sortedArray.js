"use strict";

var binarySearch = require("binary-search");

var slice = Array.prototype.slice;

/**
 * Turns an array or every object with an array-like interface into a sorted array that maintains the sort order.
 * This is basically achieved by replacing the original mutator methods with versions that respect the order.
 *
 * If the supplied array has a comparator-function, this function will be used for comparison.
 *
 * You may also provide multiple comparators. If comparator1 returns 0, comparator2 is applied, etc.
 *
 * @param {Array|Object} arr
 * @param {Function=} comparator1
 * @param {Function=} comparator2
 * @param {Function=} comparator3
 * @returns {Array|Object}
 */
function sortedArray(arr, comparator1, comparator2, comparator3) {
    var _ = {};

    arr = arr || [];

    if (typeof arr._sortedArray === "object") {
        throw new Error("(sortedArray) Cannot extend array: Special key _sortedArray is already defined. Did you apply it twice?");
    }
    arr._sortedArray = _;

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
    arr.sortedIndex = sortedIndex;

    if (arguments.length === 1) {
        arr.comparator = arr.comparator || defaultComparator;
    } else if (arguments.length === 2) {
        arr.comparator = comparator1;
    } else {
        arr.comparator = multipleComparators(slice.call(arguments, 1));
    }

    if (arr.length > 0) {
        arr.sort();
    }

    return arr;
}

/**
 * Adds the given element(s) at their sortedIndex.
 *
 * Same signature as Array.prototype.push
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
 */
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

/**
 * Removes howMany element(s) at the supplied index. All elements that are inserted are inserted at their sortedIndex.
 *
 * Same signature as Array.prototype.splice
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
 */
function splice(index, howMany, element1) {
    /* jshint validthis:true */
    var result,
        i;

    result = this._sortedArray.splice.call(this, index, howMany);

    for (i = 2; i < arguments.length; i++) {
        pushSingle(this, arguments[i]);
    }

    return result;
}

/**
 * Works like Array.prototype.indexOf but uses a faster binary search.
 *
 * Same signature as Array.prototype.indexOf
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
 */
function indexOf(element, fromIndex) {
    /* jshint validthis:true */
    var arr = toArray(this),
        index;

    if (fromIndex) {
        arr = arr.slice(fromIndex);
    }

    index = binarySearch(arr, element, this.comparator);

    if (index < 0) {
        return -1;
    } else {
        return index;
    }
}

/**
 * Works basically like Array.prototype.sort except these enhancements:
 *
 * - Calling without parameters sorts the array using arr.comparator
 *
 * - Passing a comparator sets it additionally as arr.comparator which means that all subsequent
 *   sorts will be done using this comparator.
 *
 * - You may also provide multiple comparators. If comparator1 returns 0, comparator2 is applied, etc.
 *
 * @param {Function=} comparator1
 * @param {Function=} comparator2
 * @param {Function=} comparator3
 */
function sort(comparator1, comparator2, comparator3) {
    /* jshint validthis:true */
    var _ = this._sortedArray;

    if (arguments.length > 0) {
        if (arguments.length > 1) {
            this.comparator = multipleComparators(slice.call(arguments, 0));
        } else {
            this.comparator = comparator1;
        }
        _.reversed = false;
    }


    _.sort.call(this, this.comparator || defaultComparator);
}

/**
 * Works like Array.prototype.reverse.
 *
 * Please note that this function wraps the current arr.comparator in order to invert the result. Reverting it back
 * removes the wrapper.
 *
 * Same signature as Array.prototype.reverse
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse
 */
function reverse() {
    /* jshint validthis:true */
    var _ = this._sortedArray,
        reversed = _.reversed;

    if (reversed) {
        this.comparator = this.comparator.original;
    } else {
        this.comparator = getInversionOf(this.comparator);
    }
    _.reversed = !reversed;

    _.reverse.call(this);
}

/**
 * Returns the index where the given element would be inserted.
 *
 * @param {*} element
 * @returns {Number}
 */
function sortedIndex(element) {
    /* jshint validthis:true */
    var index = binarySearch(toArray(this), element, this.comparator);

    if (index < 0) {
        // binarySearch decreases the negative index by one because otherwise the index 0 would stand for two results
        // @see https://github.com/darkskyapp/binary-search/issues/1
        return Math.abs(index) - 1;
    } else {
        return index;
    }
}

/**
 * Performs a push of a single element. Used by push, unshift, splice.
 *
 * @private
 * @param {Array} arr
 * @param {*} element
 */
function pushSingle(arr, element) {
    var index = arr.sortedIndex(element),
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

/**
 * Inverts the given comparator so the array will be sorted reversed.
 * The original comparator is saved so it can be restored.
 *
 * @private
 * @param {Function} comparator
 * @returns {Function}
 */
function getInversionOf(comparator) {
    function inversion(a, b) {
        return -comparator(a, b);
    }

    inversion.original = comparator;

    return inversion;
}

/**
 * Tries to turn the given object into an array by trying common toArray()-method names.
 * This function is necessary so alamid-sorted-array can be applied to all kind of array-like collections.
 *
 * @private
 * @param {*} self
 * @returns {Array}
 */
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
 * @private
 * @param {*} a
 * @param {*} b
 * @returns {Number}
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

/**
 * Returns a single comparator which tries all given comparators one after another
 * and stops if one of them returned another value than 0.
 *
 * If the end is reached the defaultComparator is applied.
 *
 * @private
 * @param {Array} comparators
 * @returns {Function}
 */
function multipleComparators(comparators) {
    return function applyComparators(a, b) {
        var i,
            result;

        for (i = 0; i < comparators.length; i++) {
            result = comparators[i](a, b);
            if (result !== 0) {
                return result;
            }
        }

        return defaultComparator(a, b);
    };
}

module.exports = sortedArray;