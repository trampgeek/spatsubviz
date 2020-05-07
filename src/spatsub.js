/*
    Copyright (C) 2019  Richard Lobb

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version. See <https://www.gnu.org/licenses/>

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
 */

// The main javascript module for the Spatial subdivision visualiser.
// Uses the Vue framework.
/* jshint esnext:true */

require(["geom", "plotter", "kdtree", "quadtree"], function (geom, plotter, kdtree, quadtree) {

    const DIVIDER_LINE_STYLE   = {color: 'red', width: 2};
    const FRAME_LINE_STYLE = {color: 'black', width: 1};
    const FRAME_TOP_RIGHT = [[0, 100], [100, 100], [100, 0]];
    const POINT_SET_STYLE   = {color: 'blue', size: 9};
    const POINT_PLOT_MODE = 'markers';
    const FUNCS = {kdtree: kdtree, quadtree: quadtree };
    const DEFAULT_NUM_POINTS = 40;

    var app = new Vue({
        el: '#app',

        data: {
            points: [],
            numPoints: 0,
            numLeaves: 0,
            maxLeafDepth: 0,
            countString: '' + DEFAULT_NUM_POINTS,
            depthString: '0',
            depth: 0,
            algorithm: 'kdtree',
            togglefileuploadhelp: false,
        },

        mounted: function() {
            this.addPoints();
        },


        computed: {
            decrementDisabled: function() { return Boolean(this.depth === 0); }
        },

        watch: {
            depthString: function() {
                this.depth = parseInt(this.depthString);
                this.start();
            }
        },

        methods: {
            // Upload the selected text file of (x, y) data. x, y values should
            // all be integers in the range [0, 100]. Data is extracted with
            // the pattern /[0-9]+/ so any separators can be used but white space
            // or commas are recommended.
            upload: function(event) {
                var rdr = new FileReader(),
                    file = event.target.files[0],
                    that = this;
                rdr.onload = function(evt) {
                    that.clear();
                    var data = evt.target.result,
                        pointStrings = data.match(/[0-9]+/g);
                    for (var i = 0; i < pointStrings.length; i += 2) {
                        that.points.push([parseInt(pointStrings[i]), parseInt(pointStrings[i + 1])]);
                    }
                    that.start();
                };
                rdr.readAsText(file);
            },

            resetfile: function(event) {
                this.$refs.file.value = '';
            },

            clear: function() {
                this.points = [];
                this.depthString = '0';
            },

            start: function() {
                var tree;
                this.tree_constructor = FUNCS[this.algorithm];
                tree = new this.tree_constructor(this.points, this.depth);
                this.numLeaves = tree.numLeaves();
                this.maxLeafDepth = tree.maxLeafDepth();
                this.plot(tree);
            },

            addPoints: function() {
                // Add however many points is set by the slider
                var x, y, that=this, n = 0;
                function isInPoints(x, y) {
                    // True if (x, y) is in the array points
                    return that.points.find(function (q) {
                        return q[0] == x && q[1] == y;
                    });

                }

                while (n < parseInt(this.countString)) {
                    x = Math.floor(100 * Math.random());
                    y = Math.floor(100 * Math.random());
                    if (!isInPoints(x, y)) {
                        this.points.push([x, y]);
                        n += 1;
                    }
                }
                this.numPoints = this.points.length;
                this.start();
            },

            plot: function (tree) {
                var lines, line, points, mode;
                mode = POINT_PLOT_MODE;
                plotter.plot(this.points, mode, {marker: POINT_SET_STYLE}, true);
                plotter.plot(FRAME_TOP_RIGHT, 'lines', {line: FRAME_LINE_STYLE});

                if (this.depth > 0) {
                    // Horribly fiddling to convert list of lines to a list
                    // of points which plotter must then convert back to a list
                    // of traces. Yuck.
                    lines = tree.lines();
                    points = [];
                    for (var i = 0; i < lines.length; i++) {
                        line = lines[i];
                        points = points.concat(line.points);
                    }
                    plotter.plot(points, 'multiline', {line: DIVIDER_LINE_STYLE});
                }
            }
        },
    });
});
