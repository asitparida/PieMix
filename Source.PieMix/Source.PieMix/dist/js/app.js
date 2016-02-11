angular.module('pieMixSample', ['piemix.modules'])
.controller('piemixCController', ["$scope", "$timeout", function ($scope, $timeout) {
    var self = this;
    self.pieData = [
        {
            'id': '101', 'value': 60, 'color': '#34495e', 'child': [
                {
                    'id': '201', 'value': 40, 'color': '#3498db', 'child': [
                    { 'id': '301', 'value': 67, 'color': '#f39c12' },
                    { 'id': '302', 'value': 33, 'color': '#e74c3c' }
                    ]
                },
                { 'id': '202', 'value': 60, 'color': '#9b59b6' }
            ]
        },
        { 'id': '102', 'value': 20, 'color': '#2ecc71' },
        { 'id': '103', 'value': 20, 'color': '#16a085' }
    ];

    self.click = function (id) {
        console.log(id);
    }

}]);