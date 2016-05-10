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
    .directive("pieMix", ['$parse', function ($parse) {
        return {
            restrict: 'AEC',
            scope: {
                slices: '=',
                config: "=",
                callbackOnClick: "&"
            },
            templateUrl: 'template/piemix/template.html',
            //templateUrl: 'resource/piemix.html',
            controller: ["$scope", "$timeout", "$element", "$attrs", "$parse", function ($scope, $timeout, $element, attrs, $parse) {
                var self = this;
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
                        var _deg = Math.floor((_slice.value / _totalPieValue) * _netMulFactor);
                        var _degEnd = _degStart + _deg;
                        //calculate start point and end point for arc
                        var _effectiveDeg = _degStart + _deg + (typeof _slice.degStart !== 'undefined' && _slice.degStart != null && _slice.degStart != {} ? _slice.degStart : 0);
                        var _midDeg = _degStart + ((_effectiveDeg - _degStart) / 2);
                        var startXY = self._generateCoordinates(_degStart, _rad, self.centerXY);
                        var midXY = self._generateCoordinates(_midDeg, _rad, self.centerXY);
                        var offsetMidXY = self._generateCoordinates(_midDeg, _rad + 15, self.centerXY);
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
                        _slice.effectiveDeg = _effectiveDeg;
                        _slice.midDeg = _midDeg;
                        _slice.degEnd = _degEnd;
                        _slice.startXY = startXY;
                        _slice.midXY = midXY;
                        _slice.offsetMidXY = offsetMidXY;
                        _slice.endXY = endXY;
                        _slice.pathCoeff = _pathCoeff;
                        _slice.activecolor = _slice.color;
                        _slice.priority = itr;
                        var _path = '';
                        if (_slice.effectiveDeg != 360)
                            _path = 'M' + _slice.startXY.x + ' ' + _slice.startXY.y
                                + ' A ' + _slice.rad + ' ' + _slice.rad
                                + ', 0, '
                                + _slice.pathCoeff
                                + ', 1, '
                                + _slice.endXY.x + ' ' + _slice.endXY.y + ' L '
                                + self.centerXY.x + ' ' + self.centerXY.y + ' Z';
                        else
                            _path = 'M ' + self.centerXY.x + ' ' + self.centerXY.y
                                + ' m ' + (-_slice.rad) + ' ' + 0
                                + ' a ' + _slice.rad + ' ' + _slice.rad + ' 0 1 1 ' + (_slice.rad * 2) + ' 0'
                                + ' a ' + _slice.rad + ' ' + _slice.rad + ' 0 1 1 ' + (-(_slice.rad * 2)) + ' 0';
                        _slice.d = _path;
                        var _copy = _.clone(_slice);
                        delete _copy.child;
                        self.generatedPies.push(_copy);
                        if (typeof _slice.child !== 'undefined' && _slice.child != {} && _slice.child.length > 0)
                            self._generatePies(_slice.child, itr + 1, _slice);
                        //Assign for next loop
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

                self.getContainerWidth = function () {
                    if (typeof $element !== 'undefined' && $element != null)
                        return $element.width();
                    else
                        return (2 * self._maxRad);
                }

                self.getContainerHeight = function () {
                    if (typeof $element !== 'undefined' && $element != null)
                        return $element.height();
                    else
                        return (2 * self._maxRad);
                }

                self._getCenterXY = function (slices, pad) {
                    self._maxRad = self._calMaxRadius(slices);
                    var _widthBuffer = self.getContainerWidth() / 2;
                    pad = pad !== 'undefined' && pad != {} && pad != null ? pad : 0;
                    return { 'x': _widthBuffer, 'y': self._maxRad + (pad * 2) };
                }

                self._calcQuadrants = function () {
                    var _quadrant = {};
                    var _width = self.getContainerWidth();
                    var _height = self.getContainerHeight();
                    var _whalf = _width / 2;
                    var _hhalf = _height / 2;
                    var centerXY = self.centerXY;
                    var _gap = self.gapToLabel;
                    var _rad = self._maxRad;
                    if (_rad + _gap <= (_width - 30)) {
                        _quadrant['NE'] = _quadrant['SE'] = {
                            'x': centerXY.x + _rad + _gap,
                            'y': 10
                        };
                        _quadrant['NW'] = _quadrant['SW'] = {
                                'x': centerXY.x - _rad - _gap,
                            'y': 10
                        };
                        return _quadrant;
                    }
                    else
                        return undefined;
                }

                self._getQuadrantKey = function (deg) {
                    var ret = '';
                    if (0 <= deg && deg <= 90) ret = 'NE';
                    else if (90 < deg && deg <= 180) ret = 'SE';
                    else if (180 < deg && deg <= 270) ret = 'SW';
                    else if (270 < deg && deg <= 360) ret = 'NW';
                    return ret;
                }

                self._drawHelpBoxes = function () {
                    var ctr = { 'NE': 0, 'SE': 0, 'NW': 0, 'SW': 0 };
                    var _minBoxHeight = 50;

                    var _pieCopiesForLabel = _.map(angular.copy(self.generatedPies), function (_pieSlice, key) {
                        return {
                            'midXY': _pieSlice.midXY,
                            'midDeg': _pieSlice.midDeg,
                            'offsetMidXY': _pieSlice.offsetMidXY,
                            'priority': _pieSlice.priority,
                            'rad':_pieSlice.rad,
                            'id': _pieSlice.id,
                            'title':_pieSlice.title,
                            'side': _pieSlice.midXY.x == self.centerXY.x ? 0 : (_pieSlice.midXY.x > self.centerXY.x ? 1 : -1)
                        }
                    });

                    /* GET MID POINTS IN RIGHT HEMISPHERE OR side == 1*/
                    var _pieCopiesRight = _.sortBy(_.filter(_pieCopiesForLabel, function (_pie) { return _pie.side == 1 }), function (pie) { return pie.midDeg });
                    var _pieCopiesLeft = _.sortBy(_.filter(_pieCopiesForLabel, function (_pie) { return _pie.side == 0 || _pie.side == -1 }), function (pie) { return -pie.midDeg });
                    var _quadrant = self._calcQuadrants();
                    var _lastPieOffset = null;
                    _.each(_pieCopiesRight, function (_pie, _iter) {
                        var _quadKey = self._getQuadrantKey(_pie.midDeg);
                        var _baseXY = _.clone(_quadrant[_quadKey]);
                        var _offsetXY = _pie.offsetMidXY;
                        if (_lastPieOffset != null) {
                            if (_offsetXY.y - _lastPieOffset.y < _minBoxHeight) {
                                var _radFix = _minBoxHeight - (_offsetXY.y - _lastPieOffset.y);
                                var calculatedOffset = {};
                                if (_quadKey == 'NE') {
                                    _offsetXY.y = _offsetXY.y + _radFix;
                                    _offsetXY.x = _offsetXY.x + _radFix;
                                }
                                else if (_quadKey == 'SE') {
                                    calculatedOffset = self._generateCoordinates(_pie.midDeg, _pie.rad + 30 + _radFix, self.centerXY);
                                    _offsetXY = calculatedOffset;
                                }                                
                            }
                        }
                        var _midpoint = { 'x': _baseXY.x, 'y': _offsetXY.y };
                        var _stpoint = { 'x': _baseXY.x + 100, 'y': _offsetXY.y };
                        var _endPoint = _pie.midXY;
                        _pie._ptr = _endPoint.x + ',' + _endPoint.y + ' ' + _offsetXY.x + ',' + _offsetXY.y + ' ' + _midpoint.x + ',' + _midpoint.y + ' ' + _stpoint.x + ',' + _stpoint.y;
                        _pie.colorBox = { 'x': _midpoint.x, 'y': _midpoint.y + 4 };
                        _pie.textBox = { 'x': _midpoint.x + 24, 'y': _midpoint.y + 16 };
                        _lastPieOffset = _offsetXY;
                    });
                    _lastPieOffset = null;
                    _.each(_pieCopiesLeft, function (_pie, _iter) {
                        var _quadKey = self._getQuadrantKey(_pie.midDeg);
                        var _baseXY = _.clone(_quadrant[_quadKey]);
                        var _offsetXY = _pie.offsetMidXY;
                        if (_lastPieOffset != null) {
                            if (_offsetXY.y - _lastPieOffset.y < _minBoxHeight) {
                                var _radFix = _minBoxHeight - (_offsetXY.y - _lastPieOffset.y);
                                var calculatedOffset = {};
                                if (_quadKey == 'NW') {
                                    _offsetXY.y = _offsetXY.y + _radFix;
                                    _offsetXY.x = _offsetXY.x - _radFix;
                                }
                                else if (_quadKey == 'SW') {
                                    calculatedOffset = self._generateCoordinates(_pie.midDeg, _pie.rad + 30 + _radFix, self.centerXY);
                                    _offsetXY = calculatedOffset;
                                }
                            }
                        }
                        var _midpoint = { 'x': _baseXY.x, 'y': _offsetXY.y };
                        var _stpoint = { 'x': _baseXY.x - 100, 'y': _offsetXY.y };
                        var _endPoint = _pie.midXY;
                        _pie.colorBox = { 'x': _midpoint.x - 100, 'y': _midpoint.y + 4 };
                        _pie.textBox = { 'x': _midpoint.x - 100 + 24, 'y': _midpoint.y + 16 };
                        _pie._ptr = _stpoint.x + ',' + _stpoint.y + ' ' + _midpoint.x + ',' + _midpoint.y + ' ' + _offsetXY.x + ',' + _offsetXY.y + ' ' + _endPoint.x + ',' + _endPoint.y;
                        _lastPieOffset = _offsetXY;
                    });

                    _.each(self.generatedPies, function (pie) {
                        var _side = pie.midXY.x == self.centerXY.x ? 0 : (pie.midXY.x > self.centerXY.x ? 1 : -1);
                        if (_side == 1) {
                            var _approPie = _.find(_pieCopiesRight, function (_pieRight) { return _pieRight.id == pie.id });
                            if (typeof _approPie !== 'undefined') {
                                pie.ptr = _approPie._ptr;
                                pie.colorBox = _approPie.colorBox;
                                pie.textBox = _approPie.textBox;
                                pie.fillOpacity = 1;
                            }
                        }
                        else if (_side == -1) {
                            var _approPie = _.find(_pieCopiesLeft, function (_pieRight) { return _pieRight.id == pie.id });
                            if (typeof _approPie !== 'undefined') {
                                pie.ptr = _approPie._ptr;
                                pie.colorBox = _approPie.colorBox;
                                pie.textBox = _approPie.textBox;
                                pie.fillOpacity = 1;
                            }
                        }
                    });

                }

                self._startGenerating = function (slices) {
                    self.generatedPies = [];
                    self.centerXY = self._getCenterXY(slices, 5);
                    self.svgWidth = self.getContainerWidth();
                    self.svgHeight = Math.max(self.getContainerHeight(), 2 * self._maxRad + 100);
                    self._generatePies(slices, 1, null);
                    //insert center white stroke filled circle
                    if (self.showStrokeCircleAtCenter == true) {
                        self.strokeCircle = { 'cx': self.centerXY.x, 'cy': self.centerXY.y, 'r': self.baseRadius * 0.5, 'fill': self.strokeColor };
                    }
                    var _pieSlic = { '_uid': _GUID(), 'activecolor': self.strokeColor, 'color': self.strokeColor };
                    $timeout(self._drawHelpBoxes, 500);
                }

                self._init = function (values) {
                    this.baseRadius = angular.copy(self.config.baseRadius) || 100;
                    this.radiusIncrementFactor = angular.copy(self.config.radiusIncrementFactor) || 0.66;
                    this.gapToLabel = angular.copy(self.config.gapToLabel) || 60;
                    this.strokeColor = angular.copy(self.config.strokeColor) || '#fff';
                    this.strokeWidth = angular.copy(self.config.strokeWidth) || 0;
                    this.showLabels = angular.copy(self.config.showLabels);
                    this.showStrokeCircleAtCenter = angular.copy(self.config.showStrokeCircleAtCenter);
                    self.coordinates = {};
                    self.generatedPies = [];
                    self.centerXY = {};
                    self._maxRad = {};
                    self._startGenerating(values);
                }

                self.pieSliceClicked = function (pie) {
                    self.callbackOnClick({ data: pie });
                    if (typeof self.config.pieSliceClicked === 'function')
                        self.config.pieSliceClicked({ data: pie });
                }

                self.config.highlightPie = function (id) {
                    _.each(self.generatedPies, function (_pie) {
                        if (_pie.id == id) {
                            _pie.activecolor = '#000';
                        }
                    });
                }

                self.config.dehighlightPie = function (id) {
                    _.each(self.generatedPies, function (_pie) {
                        if (_pie.id == id) {
                            _pie.activecolor = _pie.color;
                        }
                    });
                }

            }],
            controllerAs: 'piemixctrl',
            bindToController: true,
            replace: true,
            link: function (scope, element, attrs, ctrl) {
                var watchListeners = [];
                angular.forEach(['slices', 'config'], function (key) {
                    if (attrs[key]) {
                        var getAttribute = $parse(attrs[key]);
                        watchListeners.push(scope.$parent.$watch(angular.bind(ctrl, function () { return this[key] }), function (value) {
                            ctrl._init(angular.copy(ctrl.slices));
                        }, true));
                    }
                });
            }
        };
    }])
})();