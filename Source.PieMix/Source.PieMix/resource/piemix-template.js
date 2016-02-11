
(function () {
    "use strict";

    var peiMixTemplates = {"pieMixMasterTmpl":"        <div class=\"pie-mix-holder\">            <svg height=\"{{piemixctrl.svgHeight}}\" width=\"{{piemixctrl.svgWidth}}\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">                <path tabindex=\"0\" ng-attr-fill=\"{{path.activecolor}}\" ng-attr-d=\"{{path.d}}\" ng-attr-priority=\"{{path.priority}}\" style=\"fill: {{path.activecolor}}\" ng-repeat=\"path in piemixctrl.generatedPies  | orderBy:'priority':'false'\" ng-click=\"sample.click(path.id)\" ng-mouseenter=\"path.activecolor = '#000'\" ng-mouseleave=\"path.activecolor = path.color\"/>            </svg>        </div>    "};

    angular.module('piemix.modules')
     .run(["$templateCache", function ($templateCache) {
         $templateCache.put("template/piemix/template.html", peiMixTemplates.pieMixMasterTmpl);
     }])
})();
