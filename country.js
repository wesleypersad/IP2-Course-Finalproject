function Country() {
    // constructor for country entity
    this.colour = '';
    this.name = '';
    this.show = true;
    this.trail = false;

    //add arraws to hold all required data
    this.popData = [];
    this.yValData = [];
    this.xValData = [];

    // distance of mouse pinter from country object
    var far;

    this.draw = function (callobj, year) {
        var xpos;
        var ypos;
        var diam;
        var yearIndex;
        var population;
        var yVal;
        var xVal;

        // only draw if show flag is true
        if (this.show == false) return;
        
        // calculate the year index to get corresponding data from arrays
        // get the data
        yearIndex = callobj.yearToIndex(year);
        
        // if the trail flag is set draw the trail
        if (this.trail == true) {
            for (var i=0; i <= yearIndex; i++) {
                population = this.popData[i];
                yVal = this.yValData[i];
                xVal = this.xValData[i];

                // calculate the ellipse position and size
                if (!callobj.xL10) {
                    xpos = callobj.mapxValToWidth(xVal);                   
                } else {
                    xpos = callobj.mapxValL10ToWidth(Math.log10(xVal));
                }
                ypos = callobj.mapyValToHeight(yVal);
                diam = callobj.mapPopToWidth(population);

                // draw the ellipse
                fill(this.colour);
                stroke(0);
                strokeWeight(1);
                ellipse(xpos, ypos, diam);
            };
        } else {
            // just draw the current year
            population = this.popData[yearIndex];
            yVal = this.yValData[yearIndex];
            xVal = this.xValData[yearIndex];

            // calculate the ellipse position and size
            if (!callobj.xL10) {
                xpos = callobj.mapxValToWidth(xVal);                   
            } else {
                xpos = callobj.mapxValL10ToWidth(Math.log10(xVal));
            }

            ypos = callobj.mapyValToHeight(yVal);
            diam = callobj.mapPopToWidth(population);
            
            // draw the ellipse
            fill(this.colour);
            stroke(0);
            strokeWeight(1);
            ellipse(xpos, ypos, diam);
        }
        
        // calculate the distance of the mouse from the center of the circle 
        far = int(dist(xpos, ypos, mouseX, mouseY));

        // if the mouse is within the circle write it's data to screen
        if (far <= (max((diam / 2), 4))) {       
            stroke(this.colour);
            textAlign(LEFT);

            // put in bottom panel
            text(this.name, 850, 150 - 20 + 100*callobj.numTips);
            text('Population (M): ' + population/1000000, 850, 150 + 100*callobj.numTips);
            text(callobj.yttDesc + yVal.toFixed(1), 850, 150 + 20 + 100*callobj.numTips);
            text(callobj.xttDesc + xVal, 850, 150 + 40 + 100*callobj.numTips);
            callobj.numTips++;
        }
    };
}