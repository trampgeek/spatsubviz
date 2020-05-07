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

// The module defines the Quadtree function, which builds a quadtree to a given
// maximum depth from a given set of points. It returns an object with a
// lines function attribute that provides all the divider lines for the
// quadtree.
/*jshint esnext:true */

define(["geom"], function (geom) {
    const MAX_POINTS_PER_LEAF = 2;
    const SIZE = 100;

    /*********************************************************
     *
     * Define the class QuadTree.
     *
     * Constructor takes a list of points represented as a 2-element array [x, y]
     * a maximum depth to recurse to, the current depth, the centre point
     * for the node and its size, and returns a QuadTree.
     * In this context, the only relevant method of the QuadTree is lines.
     *
     *********************************************************/
    function QuadTree(points, maxdepth, depth, centre, size) {
        var filtered_points = [], i, ix, iy, p, quarter_size, new_centre, child;
        if (depth === undefined) {
            depth = 0;
            centre = [SIZE / 2, SIZE / 2];
            size = SIZE;
        }
        this.depth = depth;
        this.size = size;
        this.centre = centre;
        for (i = 0; i < points.length; i++) {
            p = points[i];
            if ((p[0] >= centre[0] - size / 2) &&
                    (p[0] <  centre[0] + size / 2) &&
                    (p[1] >= centre[1] - size / 2) &&
                    (p[1] <  centre[1] + size / 2)) {
                filtered_points.push(p);
            }
        }
        if (filtered_points.length <= MAX_POINTS_PER_LEAF || depth >= maxdepth) {
            this.is_leaf = true;
            this.points = filtered_points;
        } else {
            this.is_leaf = false;
            this.children = [];
            quarter_size = size / 4;
            for (ix = -1; ix < 2; ix += 2) {
                for (iy = -1; iy < 2; iy += 2) {
                    new_centre = [centre[0] + ix * quarter_size, centre[1] + iy * quarter_size];
                    child = new QuadTree(filtered_points, maxdepth, depth + 1, new_centre, size / 2);
                    this.children.push(child);
                }
            }
        }
    }

    // Return a list of the divider lines
    QuadTree.prototype.lines = function() {
        var lines, halfsize, top, left, bottom, right, midx, midy, i;

        if (this.is_leaf) {
            lines = [];
        } else {
            halfsize = this.size / 2;
            midx = this.centre[0];
            midy = this.centre[1];
            top = midy + halfsize;
            left = midx - halfsize;
            bottom = midy - halfsize;
            right = midx + halfsize;
            lines = [
                {points: [[left, midy], [right, midy]]},
                {points: [[midx, bottom], [midx, top]]}
            ];
            for (i = 0; i < 4; i++) {
                lines = lines.concat(this.children[i].lines());
            }
        }
        return lines;
    };

    QuadTree.prototype.numLeaves = function () {
        var count = 0, i;
        if (this.is_leaf) {
            return 1;
        } else {
            for (i = 0; i < 4; i++) {
                count += this.children[i].numLeaves();
            }
            return count;
        }
    };

    QuadTree.prototype.maxLeafDepth = function () {
        var i, d;
        if (this.is_leaf) {
            return 0;
        } else {
            d = 0;
            for (i = 0; i < 4; i++) {
                d = Math.max(d, this.children[i].maxLeafDepth());
            }
            return 1 + d;
        }
    };

    // Return the constructor for a KdTree

    return QuadTree;
});

