(function () {
    "use strict";

    /* CAPITALIZE FIRST LETTER - STRING PROTOTYPE*/
    String.prototype.capitalizeFirstLetter = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    String.prototype.replaceAll = function (find, replaceWith) {
        var regex = new RegExp(find, 'g');
        return this.replace(regex, replaceWith);
    }

    function _GUID() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                  .toString(16)
                  .substring(1);
        }
        return s4() + s4() + "_" + s4();
    }

    angular.module('piemix.modules', ['ngSanitize', 'ui.bootstrap'])
    .directive("pieMix", function () {
        return {
            restrict: 'AEC',
            scope: {
                slices: '='
            },
            templateUrl: 'resource/piemix.html',
            controller: ["$scope", "$timeout", function ($scope, $timeout) {
                var self = this;
                this.baseRadius = 100;
                this.radiusIncrementFactor = 0.66;
                self.coordinates = {};

                self._generateCoordinates = function (deg, rad, centerXY) {
                    var id = deg + 'deg_' + rad + '_rad' + centerXY.toString();
                    if (typeof self.coordinates[id] !== 'undefined' && self.coordinates[id] != null)
                        return self.coordinates[id];
                    var x = 0, y = 0;
                    var rSin0 = Math.abs(rad * Math.sin(deg * 0.0174533));
                    var rCos0 = Math.abs(rad * Math.cos(deg * 0.0174533));
                    if (deg >= 0 && deg <= 90) {
                        x = centerXY.x + rSin0; y = centerXY.y - rCos0;
                    }
                    else if (deg >= 90 && deg <= 180) {
                        x = centerXY.x + rSin0; y = centerXY.y + rCos0;
                    }
                    else if (deg >= 180 && deg <= 270) {
                        x = centerXY.x - rSin0; y = centerXY.y + rCos0;
                    }
                    else {
                        x = centerXY.x - rSin0; y = centerXY.y - rCos0;
                    }
                    self.coordinates[id] = { 'x': Math.ceil(x), 'y': Math.ceil(y) };
                    return self.coordinates[id];
                }

                self.generatedPies = [];

                self._generatePies = function (_origPie, itr, _parentPiece) {
                    var _totalPieValue = _.reduce(_origPie, function (memo, item) { return memo + item.value }, 0);
                    var _degStart = 0;
                    _.each(_origPie, function (_slice, peiceIter) {
                        //radius for this iteration
                        var _ctr = 0;
                        var _rad = self.baseRadius;
                        var _tempRad = self.baseRadius;
                        while (_ctr < itr - 1) {
                            _tempRad = _tempRad * self.radiusIncrementFactor;
                            _rad = _rad + _tempRad;
                            _ctr = _ctr + 1;
                        }
                        //calculate degree for arc
                        var _netMulFactor = 360;
                        if (typeof _parentPiece !== 'undefined' && _parentPiece != null && typeof _parentPiece.deg !== 'undefined' && _parentPiece.deg != null)
                            _netMulFactor = _parentPiece.deg;
                        var _deg = Math.ceil((_slice.value / _totalPieValue) * _netMulFactor);
                        var _degEnd = _degStart + _deg;
                        //calculate start point and end point for arc
                        var _effectiveDeg = _degStart + _deg + (typeof _slice.degStart !== 'undefined' && _slice.degStart != null && _slice.degStart != {} ? _slice.degStart : 0);
                        var startXY = self._generateCoordinates(_degStart, _rad, self.centerXY);
                        var endXY = self._generateCoordinates(_effectiveDeg, _rad, self.centerXY);
                        //Assigningg path coeff
                        var _pathCoeff = 0;
                        if (_deg > 180)
                            _pathCoeff = 1;
                        // Assigning vals
                        _slice._uid = _GUID();
                        _slice.rad = _rad;
                        _slice.deg = _deg;
                        _slice.degStart = _degEnd - _deg;
                        _slice.degEnd = _degEnd;
                        _slice.startXY = startXY;
                        _slice.endXY = endXY;
                        _slice.pathCoeff = _pathCoeff;
                        _slice.activecolor = _slice.color;
                        _slice.priority = itr;
                        var _path = 'M' + _slice.startXY.x + ' ' + _slice.startXY.y
                        + ' A ' + _slice.rad + ' ' + _slice.rad
                        + ', 0, '
                        + _slice.pathCoeff
                        + ', 1, '
                        + _slice.endXY.x + ' ' + _slice.endXY.y + ' L '
                        + self.centerXY.x + ' ' + self.centerXY.y + ' Z';
                        _slice.d = _path;
                        var _copy = _.clone(_slice);
                        delete _copy.child;
                        self.generatedPies.push(_copy);
                        if (typeof _slice.child !== 'undefined' && _slice.child != {} && _slice.child.length > 0)
                            self._generatePies(_slice.child, itr + 1, _slice);
                        //Assign fo rnext loop
                        _degStart = _degEnd;
                    });
                }

                self._calDeepLength = function (slices) {
                    var len = 0;
                    if (slices.length > 0)
                        len = len + 1;
                    _.each(slices, function (_slice) {
                        if (typeof _slice.child !== 'undefined' && _slice.child != {} && _slice.child.length > 0)
                            len = len + self._calDeepLength(_slice.child);
                    });
                    return len;
                }

                self._calMaxRadius = function (slices) {
                    var maxIncrements = self._calDeepLength(slices);
                    var maxRadius = self.baseRadius;
                    var ctr = 0;
                    while (ctr < maxIncrements - 1) {
                        maxRadius = maxRadius + (self.baseRadius * self.radiusIncrementFactor);
                        ctr = ctr + 1;
                    }
                    return maxRadius;
                }

                self._getCenterXY = function (slices, pad) {
                    self._maxRad = self._calMaxRadius(slices);
                    pad = pad !== 'undefined' && pad != {} && pad != null ? pad : 0;
                    return { 'x': self._maxRad + (pad * 2), 'y': self._maxRad + (pad * 2) };
                }

                self._startGenerating = function (slices) {
                    self.generatedPies = [];
                    self.centerXY = self._getCenterXY(slices, 5);
                    self._generatePies(slices, 1, null);
                    self.svgHeight = self.svgWidth = (2 * self._maxRad);
                    console.log(self.generatedPies);
                }

                self.click = function (data) {
                    console.log(data);
                }

            }],
            controllerAs: 'piemixctrl',
            bindToController: true,
            replace:true,
            link: function (scope, element, attrs, ctrl) {
                scope.$watch(function (scope) {
                    return scope.slices;
                }, function (value) {
                    console.log(ctrl);
                    ctrl._startGenerating(ctrl.slices);
                });
            }
        };
    })
})();