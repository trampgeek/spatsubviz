/*
    Copyright (C) 2020  Richard Lobb

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version. See <https://www.gnu.org/licenses/>

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
 */

// The module defines the KdTree function, which builds a kdtree to a given
// maximum depth from a given set of points. It returns an object with a
// lines function attribute that provides all the divider lines for the
// kdtree.
/*jshint esnext:true */

define(["geom"], function (geom) {

    const MAX_POINTS_PER_LEAF = 2;

    /*********************************************************
     *
     * Define the class KdTree.
     *
     * Constructor takes a list of points represented as a 2-element array [x, y]
     * a maximum depth to recurse to and the current depth and returns a KdTree.
     * In this context, the only relevant method of the KdTree is lines.
     *
     *********************************************************/
    function KdTree(points, maxdepth, depth) {
        var halfway, axis;
        if (depth === undefined) {
            depth = 0;
        }
        if (points.length <= MAX_POINTS_PER_LEAF || depth >= maxdepth) {
            this.is_leaf = true;
            this.points = points;
        } else {
            this.is_leaf = false;
            this.axis = axis = depth % 2; // 0 for vertical divider, 1 for horizontal.
            points.sort(function (p1, p2) { return p1[axis] - p2[axis]; });
            halfway = Math.floor(points.length / 2);
            this.coord = points[halfway - 1][this.axis];
            this.leftorbottom = new KdTree(points.slice(0, halfway), maxdepth, depth + 1);
            this.rightortop = new KdTree(points.slice(halfway), maxdepth, depth + 1);
        }
    }

    // Return a list of the divider lines
    KdTree.prototype.lines = function(top, right, bottom, left) {
        var lines;
        if (top === undefined) {
            bottom = 0;
            top = 100;
            left = 0;
            right = 100;
        }
        if (this.is_leaf) {
            return [];
        } else {
            if (this.axis === 0) {
                lines = [{points: [[this.coord, bottom], [this.coord, top]]}];
                lines = lines.concat(this.leftorbottom.lines(top, this.coord, bottom, left));
                lines = lines.concat(this.rightortop.lines(top, right, bottom, this.coord));
            } else {
                lines = [{points: [[left, this.coord], [right, this.coord]]}];
                lines = lines.concat(this.leftorbottom.lines(this.coord, right, bottom, left));
                lines = lines.concat(this.rightortop.lines(top, right, this.coord, left));
            }
        }
        return lines;
    };

    // Return the total number of leaves in this tree.
    KdTree.prototype.numLeaves = function () {
        if (this.is_leaf) {
            return 1;
        } else {
            return this.leftorbottom.numLeaves() + this.rightortop.numLeaves();
        }
    };

    // Return the maximum depth of any leaves in this tree.
    KdTree.prototype.maxLeafDepth = function () {
        if (this.is_leaf) {
            return 0;
        } else {
            return 1 + Math.max(this.leftorbottom.maxLeafDepth(), this.rightortop.maxLeafDepth());
        }
    };
    // Return the constructor for a KdTree

    return KdTree;
});
