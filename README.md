# Source.PieMix (v1.0)

A nested pie chart control with angular bound data composed as a single SVG

##Demo

Sample Preview @ <a href="http://piemixsample.azurewebsites.net/">http://piemixsample.azurewebsites.net</a>

##Sample Code Blocks

####Intializing Events - No Nesting
    [
        { 'id': '101', 'title': '# 34495e', 'value': 60, 'color': '#34495e' },
        { 'id': '102', 'title': '# 2ecc71', 'value': 20, 'color': '#2ecc71' },
        { 'id': '103', 'title': '# 16a085', 'value': 20, 'color': '#16a085' }
    ]

####Intializing Events - With Nesting
    [
        {
            'id': '101', 'title': '# 34495e', 'value': 60, 'color': '#34495e', 'child': [
                {
                    'id': '201', 'title': '# 3498db', 'value': 40, 'color': '#3498db', 'child': [
                        { 'id': '301', 'title': '# f39c12', 'value': 67, 'color': '#f39c12' },
                        { 'id': '302', 'title': '# e74c3c', 'value': 33, 'color': '#e74c3c' }
                    ]
                },
                { 'id': '202', 'title': '# 9b59b6', 'value': 60, 'color': '#9b59b6' }
            ]
        },
        { 'id': '102', 'title': '# 2ecc71', 'value': 20, 'color': '#2ecc71' },
        { 'id': '103', 'title': '# 16a085', 'value': 20, 'color': '#16a085' }
    ]

####Adding Tags
    <pie-mix slices="sample.pieDataSample" config="sample.config"></pie-mix>

####Adding Callback On Slice Click - add 'data' always
    <pie-mix slices="sample.pieDataSample" config="sample.config" callback-on-click="sample.sliceClick(data)" ></pie-mix>

####Change Config 
#####'baseRadius' - default : 100
#####'radiusIncrementFactor' - default : 0.66
#####'gapToLabel' - default : 60
#####'strokeWidth' - default : 0
#####'strokeColor' - default : '#fff'
#####'showLabels' - default : true
#####'showStrokeCircleAtCenter' - default : false
    
	HTML
	<pie-mix slices="sample.pieDataSample" config="sample.config"></pie-mix>

	JS - Angular
	self.radiusIncrementFactorChange = function () {
        if (condition)
            self.config['radiusIncrementFactor'] = 0.66;
        else
            self.config['radiusIncrementFactor'] = 0.33;
    }

##Capabilities

1.  Add Events - No Nesting

    <img src="Source.PieMix\Source.PieMix\images\4.png " />

2.  Add Events - With Nesting 

    <img src="Source.PieMix\Source.PieMix\images\1.PNG " />

3.  Change radius increment factor

    <img src="Source.PieMix\Source.PieMix\images\5.png " />

4.  Individual elements actionable & hoverable

    <img src="Source.PieMix\Source.PieMix\images\2.png " />

4.  Individual elements actionable & hoverable from the labels/legends provided

    <img src="Source.PieMix\Source.PieMix\images\3.png " />

##Adding dependency to your project
    angular.module('myModule', ['piemix.modules']);
    
##Note
Inline documentation + README last updated 15/03/2016. Please refer sample app in the repo for updated capabilities.</h6>



