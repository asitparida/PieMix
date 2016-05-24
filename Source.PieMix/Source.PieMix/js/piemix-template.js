
(function () {
    "use strict";

    var peiMixTemplates = {"pieMixMasterTmpl":"        <div class=\"pie-mix-holder\" ng-style=\"{'height': piemixctrl.svgHolderHeight + 'px'}\">            <svg height=\"{{piemixctrl.svgHeight}}\" width=\"{{piemixctrl.svgWidth}}\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">                <path tabindex=\"0\" ng-attr-fill=\"{{path.activecolor}}\" ng-attr-d=\"{{path.d}}\" ng-attr-priority=\"{{path.priority}}\" style=\"fill: {{path.activecolor}}\" ng-repeat=\"path in piemixctrl.generatedPies  | orderBy:'priority':'false'\" ng-click=\"sample.click(path.id)\" ng-mouseenter=\"path.activecolor = '#000'\" ng-mouseleave=\"path.activecolor = path.color\"/>                <rect ng-attr-x=\"{{path.helpBoxX}}\" ng-attr-y=\"{{path.helpBoxY}}\" width=\"15\" height=\"15\" style=\"fill-opacity:0;\" ng-style=\"{'fill': path.color, 'fill-opacity': path.fillOpacity}\" ng-repeat=\"path in piemixctrl.generatedPies  | orderBy:'priority':'false'\"/>                <text ng-attr-x=\"{{path.textBoxX}}\" ng-attr-y=\"{{path.textBoxY}}\" ng-repeat=\"path in piemixctrl.generatedPies  | orderBy:'priority':'false'\">{{path.title}}</text>            </svg>        </div>    "};

    angular.module('piemix.modules')
     .run(["$templateCache", function ($templateCache) {
         $templateCache.put("template/piemix/template.html", peiMixTemplates.pieMixMasterTmpl);
     }])
})();
