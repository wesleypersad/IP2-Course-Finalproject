function Country2() {
    // constructor for country entity
    this.colour = '';
    this.name = '';
    this.show = true;

    //add arrays to hold all required data
    this.popData = [];
    this.yValData = [];
    this.xValData = [];

    //create arrays to hold distribution curve data for x and y
    this.x0 = [];
    this.x1 = [];
    this.x2 = [];
    this.x3 = [];
    this.x4 = [];
    this.x5 = [];
    this.x6 = [];

    this.y0 = [];
    this.y1 = [];
    this.y2 = [];
    this.y3 = [];
    this.y4 = [];
    this.y5 = [];
    this.y6 = [];

    //create arrays to hold the polynomial curve parameters
    this.loth = [];
    this.hith = [];
    this.a0 = [];
    this.a1 = [];
    this.a2 = [];
    this.a3 = [];
    this.a4 = [];

    // distance of mouse pointer from country object
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

        // just draw the current year
        population = this.yValData[yearIndex] * 1000000;
        yVal = this.yValData[yearIndex];
        xVal = this.xValData[yearIndex];

        // determine if bubble or curve is to be displayed  
        if (callobj.dispType) {

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

        } else {
            // calculate the x axis values to draw the distribution curve assuming 
            // one  standard deviation is 33% of mean income
            // Set x variables from calc values
            var x0 = this.x0[yearIndex];
            var x1 = this.x1[yearIndex];
            var x2 = this.x2[yearIndex];
            var x3 = this.x3[yearIndex];
            var x4 = this.x4[yearIndex];
            var x5 = this.x5[yearIndex];
            var x6 = this.x6[yearIndex];

            // calculate the y axis values from the z table values with a 
            // spread of +/- 3 standard deviations 
            // Set y variables from calc values
            var y0 = this.y0[yearIndex];
            var y1 = this.y1[yearIndex];
            var y2 = this.y2[yearIndex];
            var y3 = this.y3[yearIndex];
            var y4 = this.y4[yearIndex];
            var y5 = this.y5[yearIndex];
            var y6 = this.y6[yearIndex];

            // convert x and y values to scree position
            if (!callobj.xL10) {
                var x0pos = callobj.mapxValToWidth(x0);
                var x1pos = callobj.mapxValToWidth(x1);
                var x2pos = callobj.mapxValToWidth(x2);
                var x3pos = callobj.mapxValToWidth(x3);
                var x4pos = callobj.mapxValToWidth(x4);
                var x5pos = callobj.mapxValToWidth(x5);
                var x6pos = callobj.mapxValToWidth(x6);
            } else {
                var x0pos = callobj.mapxValL10ToWidth(Math.log10(x0));
                var x1pos = callobj.mapxValL10ToWidth(Math.log10(x1));
                var x2pos = callobj.mapxValL10ToWidth(Math.log10(x2));
                var x3pos = callobj.mapxValL10ToWidth(Math.log10(x3));
                var x4pos = callobj.mapxValL10ToWidth(Math.log10(x4));
                var x5pos = callobj.mapxValL10ToWidth(Math.log10(x5));
                var x6pos = callobj.mapxValL10ToWidth(Math.log10(x6));
            }

            var y0pos = callobj.mapyValToHeight(y0);
            var y1pos = callobj.mapyValToHeight(y1);
            var y2pos = callobj.mapyValToHeight(y2);
            var y3pos = callobj.mapyValToHeight(y3);
            var y4pos = callobj.mapyValToHeight(y4);
            var y5pos = callobj.mapyValToHeight(y5);
            var y6pos = callobj.mapyValToHeight(y6);

            // draw the distribution curve
            stroke(this.colour);
            fill(this.colour)
            beginShape();
            curveVertex(x0pos, y0pos);
            curveVertex(x1pos, y1pos);
            curveVertex(x2pos, y2pos);
            curveVertex(x3pos, y3pos);
            curveVertex(x4pos, y4pos);
            curveVertex(x5pos, y5pos);
            curveVertex(x6pos, y6pos);
            endShape();

            // find the equivalent xpos, ypos, diam and dist for the curve
            xpos = x3pos;
            ypos = (y0pos + y3pos) / 2;
            diam = (y0pos - y3pos);
        }

        // calculate the distance of the mouse from the center of the circle/curve 
        far = int(dist(xpos, ypos, mouseX, mouseY));

        // if the mouse is within the circle write it's data to screen
        if (far <= (max((diam / 2), 4))) {
            stroke(this.colour);
            textAlign(LEFT);

            // put in bottom panel
            text(this.name, 850, 150 - 20 + 100 * callobj.numTips);
            //text('Population (M): ' + population/1000000, 850, 150 + 100*callobj.numTips);
            text(callobj.yttDesc + yVal, 850, 150 + 100 * callobj.numTips);
            text(callobj.xttDesc + xVal.toFixed(1), 850, 150 + 20 + 100 * callobj.numTips);
            callobj.numTips++;
        }

    };

    this.predictY = function (income, yearIndex) {
        // predict the value of y given the value of x, calculated from 
        // the polynomial function fitted from the z table data 
        if ((income <= this.loth[yearIndex]) || (income >= this.hith[yearIndex])) {
            return 0.0;
        }
        var eqn = this.a0[yearIndex] + (this.a1[yearIndex] * income) +
            (this.a2[yearIndex] * Math.pow(income, 2)) +
            (this.a3[yearIndex] * Math.pow(income, 3)) +
            (this.a4[yearIndex] * Math.pow(income, 4));

        // ensure value returned is >= 0 to correct for errors in polnnomial edge effects
        return max(eqn, 0.0);
    }

    this.calcCurve = function (xVal, yVal) {
        // calculate the x axis values to draw the distribution curve assuming 
        // one  standard deviation is 33% of mean income
        this.x0.push(0.00 * xVal);
        this.x1.push(0.33 * xVal);
        this.x2.push(0.67 * xVal);
        this.x3.push(1.00 * xVal);
        this.x4.push(1.33 * xVal);
        this.x5.push(1.67 * xVal);
        this.x6.push(2.00 * xVal);

        // calculate the y axis values from the z table values with a 
        // spread of +/- 3 standard deviations, data from this wikipedia article :
        // https://en.wikipedia.org/wiki/Standard_normal_table
        this.y0.push(0.00);
        this.y1.push(0.0228 * yVal);
        this.y2.push((0.1587 - 0.0228) * yVal);
        this.y3.push((0.5 - 0.1587) * yVal);
        this.y4.push((0.1587 - 0.0228) * yVal);
        this.y5.push(0.0228 * yVal);
        this.y6.push(0.00);

        // write the above x, y data pairs for fitting and set the 
        // hi & lo threshold when the function is zero in value 
        this.loth.push(0.00);
        this.hith.push(2.00 * xVal);
    }

    this.calcPoly = function () {
        // calculate polynomial parameters a0 to a4 from discrete x,y 
        // data points on distribution curve
        var topIndex = this.x0.length - 1;
        //console.log(topIndex);
        // Set x variables from calc values
        var x0 = this.x0[topIndex];
        var x1 = this.x1[topIndex];
        var x2 = this.x2[topIndex];
        var x3 = this.x3[topIndex];
        var x4 = this.x4[topIndex];
        var x5 = this.x5[topIndex];
        var x6 = this.x6[topIndex];

        // Set y variables from calc values
        var y0 = this.y0[topIndex];
        var y1 = this.y1[topIndex];
        var y2 = this.y2[topIndex];
        var y3 = this.y3[topIndex];
        var y4 = this.y4[topIndex];
        var y5 = this.y5[topIndex];
        var y6 = this.y6[topIndex];

        // use the regression routine to calculates the polynomial terms
        // this uses CDN created by Tom Alexander at the follwing site :
        // https://devhub.io/repos/Tom-Alexander-regression-js
        var fitData = [[x0, y0], [x1, y1], [x2, y2], [x3, y3],
                        [x4, y4], [x5, y5], [x6, y6]];

        var result = regression('polynomial', fitData, 4);

        // the calculated parameters are a0 to a4 that are used to calculate 
        // y from the polynomial y = a0 + a1.x + a2.x^2 + a3.x^3 + a4.x^4
        this.a0.push(result.equation[0]);
        this.a1.push(result.equation[1]);
        this.a2.push(result.equation[2]);
        this.a3.push(result.equation[3]);
        this.a4.push(result.equation[4]);
    }
}
