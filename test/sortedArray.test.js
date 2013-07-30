"use strict";

var chai = require("chai"),
    sortedArray = require("../lib/sortedArray.js"),
    expect = chai.expect;

describe("sortedArray()", function () {
    var arr;

    function descending(a, b) {
        return b - a;
    }

    function ascending(a, b) {
        return a - b;
    }

    beforeEach(function () {
        arr = sortedArray([1, 2, 4]);
    });

    describe("when passing no arguments", function () {

        it("should return a new array", function () {
            // we need to use .slice() for comparison because the arr is extended (and thus can't be compared via .eql())
            expect(sortedArray().slice()).to.eql([]);
        });

    });

    describe("when passing an array", function () {

        it("should return the passed array", function () {
            arr = [];
            expect(sortedArray(arr)).to.equal(arr);
        });
        
        describe("with length > 0 and a comparator", function () {

            it("should sort the array by the given comparator", function () {
                arr = [5, 1, 2];
                arr.comparator = descending;
                arr = sortedArray(arr);
                expect(arr.slice()).to.eql([5, 2, 1]);
            });

        });

        describe("with length > 0 and no comparator", function () {

            it("should sort the array by the default comparator", function () {
                arr = sortedArray([5, 2, 1]);
                expect(arr.slice()).to.eql([1, 2, 5]);
            });

        });

    });

    describe("when passing an array and a comparator", function () {

        it("should sort the array by default", function () {
            arr = sortedArray([5, 4, 1, 2], ascending);
            expect(arr.slice()).to.eql([1, 2, 4, 5]);
        });

    });

    describe(".push()", function () {

        it("should insert the new value respecting the given order", function () {
            arr.push(3);
            expect(arr.slice()).to.eql([1, 2, 3, 4]);
        });

        describe("when passing several arguments", function () {

            it("should insert all new values at their specific index", function () {
                arr.push(3, 0, 5);
                expect(arr.slice()).to.eql([0, 1, 2, 3, 4, 5]);
            });

        });

    });

    describe(".unshift()", function () {

        it("should be an alias for .push()", function () {
            expect(arr.unshift).to.equal(arr.push);
        });

    });

    describe(".splice()", function () {

        it("should remove the elements at the given index", function () {
            arr.push(3, 5, 6);
            arr.splice(1, 3);
            expect(arr.slice()).to.eql([1, 5, 6]);
        });

        it("should add the additional elements at the index specified by the current order", function () {
            arr.splice(0, 0, 3, 5, 6);
            expect(arr.slice()).to.eql([1, 2, 3, 4, 5, 6]);
        });

    });

    describe(".indexOf()", function () {

        it("should work like Array.prototype.indexOf", function () {
            expect(arr.indexOf(2)).to.equal(1);
            expect(arr.indexOf(100)).to.equal(-1);
        });

    });

    describe(".sort()", function () {

        it("should sort the array by the default comparator", function () {
            arr[3] = 2;
            arr.sort();
            expect(arr.slice()).to.eql([1, 2, 2, 4]);
        });

        describe("when passing a comparator", function () {

            it("should sort the array by the passed comparator", function () {
                arr.sort(descending);
                expect(arr.slice()).to.eql([4, 2, 1]);
            });

            it("should order all subsequent new elements by the passed comparator", function () {
                arr.sort(descending);
                arr.push(3);
                expect(arr.slice()).to.eql([4, 3, 2, 1]);
            });

        });

        describe("when a comparator has been set", function () {

            beforeEach(function () {
                arr.sort(descending);
                arr[arr.length] = 5;
            });

            it("should sort the array by the previously set comparator", function () {
                arr.sort();
                expect(arr.slice()).to.eql([5, 4, 2, 1]);
            });

        });

    });

    describe(".reverse()", function () {

        function evenOdd(a, b) {
            var compared = a % 2 - b % 2;

            if (compared === 0) { // both are even or odd
                return a - b;
            } else {
                return compared;
            }
        }

        it("should work like Array.prototype.reverse()", function () {
            arr.reverse();
            expect(arr.slice()).to.eql([4, 2, 1]);
        });

        it("should invert the comparator so the original order is preserved", function () {
            arr.reverse();
            arr.push(3);
            expect(arr.slice()).to.eql([4, 3, 2, 1]);
            arr.reverse();
            arr.push(0);
            expect(arr.slice()).to.eql([0, 1, 2, 3, 4]);
        });

        it("should reset if a different comparator is used", function () {
            arr.reverse();
            arr.sort(evenOdd);
            arr.push(3, 5, 6, 7);
            expect(arr.slice()).to.eql([2, 4, 6, 1, 3, 5, 7]);
            arr.reverse();
            expect(arr.slice()).to.eql([7, 5, 3, 1, 6, 4, 2]);
            arr.push(0);
            expect(arr.slice()).to.eql([7, 5, 3, 1, 6, 4, 2, 0]);
        });

    });

    describe(".findIndexFor()", function () {

        it("should return the insertion index for the given element", function () {
            // arr = [1, 2, 4]
            expect(arr.findIndexFor(-1)).to.equal(0);
            expect(arr.findIndexFor(0)).to.equal(0);
            expect(arr.findIndexFor(1)).to.equal(0);
            expect(arr.findIndexFor(3)).to.equal(2);
            expect(arr.findIndexFor(4)).to.equal(2);
            expect(arr.findIndexFor(5)).to.equal(3);
            expect(arr.findIndexFor(6)).to.equal(3);
        });

    });

    describe(".toString()", function () {

        it("should return the same result as the original array", function () {
            expect(arr.toString()).to.equal([1, 2, 4].toString());
        });

    });

});