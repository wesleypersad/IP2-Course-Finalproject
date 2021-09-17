function WorldPopulationVsIncome() {

    // Name for the visualisation to appear in the menu bar.
    this.name = 'World Population vs Income';

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'world-population-income';

    // Title to display above the plot.
    this.title = 'World Population vs Income (Past & Predicted)';

    // Names for each axis.
    this.xAxisLabel = 'Mean income per capita ($/day)';
    this.yAxisLabel = 'Population (Millions)';

    // Description on tool tip
    this.xttDesc = 'Income ($/day) : ';
    this.yttDesc = 'Population  (M) : ';

    // Create a variable to hold the data filenames
    this.filenames = ['t3040_population_total.csv',
                        't3040_income_per_person.csv'];
    this.rerange = false;

    // Default x and y axis not to be in log scale
    this.xL10 = true;
    this.yL10 = false;

    // Display type bubble or curve
    this.dispType = true;

    // Display country or world distribution curve
    this.curveType = true;

    // Create an array to hold all the country objects which will be bubbles
    // also an array to hols the country names
    this.countries = [];
    this.countNames = [];
    this.cbDisps = [];
    this.yearDiv;
    this.dispcbDiv;
    this.maxYInput;
    this.minYInput;

    // number of tooltips on screen at once
    this.numTips;

    // set margin size
    var marginSize = 20;

    // Define some local variables
    var minYear;
    var maxYear;
    var maxPopulation = 1300000000;
    var tempVal;

    // create an array to hold all the x values for the country curves 
    // to plot the composite curve 
    var compXVals = [];

    // define variable to hold current year to detect when it changes
    var lastYear = 1800;

    // Layout object to store all common plot layout parameters 
    // and methods.
    this.layout = {
        marginSize: marginSize,

        // Locations of margin positions. Left and bottom have double margin
        // size due to axis and tick labels.
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize,
        bottomMargin: height - marginSize * 2,
        pad: 5,

        plotWidth: function () {
            return this.rightMargin - this.leftMargin;
        },

        plotHeight: function () {
            return this.bottomMargin - this.topMargin;
        },

        // Boolean to enable/disable background grid.
        grid: true,

        // Number of axis tick labels to draw so that they are not drawn on
        // top of one another.
        numXTickLabels: 10,
        numYTickLabels: 5,
    };

    // Property to represent whether data has been loaded.
    this.loaded1 = false;
    this.loaded2 = false;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        var self = this;
        this.data1 = [];
        this.data2 = [];

        this.data1 = loadTable(
            //'./data/pop-vs-income/t3040_population_total.csv', 'csv', 'header',
            './data/pop-vs-income/' + this.filenames[0], 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                self.loaded1 = true;
            });

        this.data2 = loadTable(
            //'./data/pop-vs-income/t3040_income_per_person.csv', 'csv', 'header',
            './data/pop-vs-income/' + this.filenames[1], 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                self.loaded2 = true;
            });

    };

    this.setup = function () {
        // set up frame rate to 5 times a second
        frameRate(5);

        // Font defaults.
        textSize(16);

        // Find the start and end year 
        this.recalcAxis();

        // Set min and max fertility i.e. 0 and 8 &log scale values
        this.minIncome = 1;
        this.maxIncome = 200;

        // same for life expectancy & log scale values
        this.minPop = 0;
        this.maxPop = 1500;
        this.minPopL10;
        this.maxPopL10;

        //
        // Create the country objects and load their data
        //

        // create a country object and set name, colour only if already empty
        this.createCountries();

        // load the data arrays in each country with the table data
        this.loadData();

        // calculate the upper and lower bounds of x in log scale
        this.minIncomeL10 = Math.floor(Math.log10(this.minIncome));
        this.maxIncomeL10 = Math.ceil(Math.log10(this.maxIncome));

        //recalculated upper limit of x scale to match log value
        this.maxIncome = Math.pow(10, this.maxIncomeL10);

        //
        // Create all the DOM elements from here ...
        //

        // create a div for choose file & position etc
        this.fileDiv = createDiv('Current Data File : ');
        this.fileDiv.position(50, 550);
        this.fileDiv.style('width', '240px');
        this.fileDiv.style('height', '100px');
        this.fileDiv.style('border', 'thin solid blue');
        this.fileDiv.style('padding', '10px');
        this.fileDiv.style('background-color', 'gold');
        this.fileDiv.mouseOver(function () {
            if(!localStorage["wpalertdisplayed"]) {
                alert("NAVIGATE TO FOLDER: data/pop-vs-income !!!")
                localStorage["wpalertdisplayed"] = true
            }
        });


        // write the data file name
        this.fileDiv.html('Current Data File : ' + this.filenames[0]);

        // Create a select file DOM element.
        self = this;
        this.input = createFileInput(function (file) {
            print(file.name);
            var filename = file.name;
            var shortname = filename.substring(0, 4);
            // set up the correct set of filenames to load
            console.log(shortname);
            if (shortname == 'test') {
                self.filenames = ['test_population_total.csv',
                                        'test_income_per_person.csv'];
            } else {
                self.filenames = ['t3040_population_total.csv',
                                        't3040_income_per_person.csv'];
            }
            self.loaded1 = false;
            self.loaded2 = false;
            self.preload();
            self.rerange = true;
        }, true);
        this.input.parent(this.fileDiv);
        this.input.position(10, 80);

        // creat a div for year slider and play button
        this.yearDiv = createDiv('Year Slider and Play/Pause');
        this.yearDiv.position(350, 620);
        this.yearDiv.style('width', '950px');
        this.yearDiv.style('border', 'thin solid blue');
        this.yearDiv.style('padding', '10px');
        this.yearDiv.style('background-color', 'gold');

        // Create sliders to control year to display
        this.yearSlider = createSlider(minYear, maxYear, 1);
        this.yearSlider.position(300, 10);
        this.yearSlider.parent(this.yearDiv);
        this.yearSlider.style('width', '350px');

        //create a button to toggle play parameter
        var self = this;
        this.playButt = createButton('Play');
        this.playButt.position(800, 10);
        this.playButt.parent(this.yearDiv);
        this.playButt.mousePressed(function () {
            if (!self.play) {
                self.play = true;
                this.html('Pause');
            } else {
                self.play = false;
                this.html('Play');
            };
        });

        // create a div for display and trail checkboxes
        this.yearcbDiv = createDiv('Display');
        this.yearcbDiv.position(1335, 0);
        this.yearcbDiv.style('width', '170px');
        this.yearcbDiv.style('height', '640px');
        this.yearcbDiv.style('border', 'thin solid blue');
        this.yearcbDiv.style('padding', '10px');
        this.yearcbDiv.style('background-color', 'gold');

        // Create checkboxes for display and trails
        this.createCBs();

        //create a button to toggle linear/log scale on x axis
        var self = this;
        this.scalexButt = createButton('Select Lin x Scale');
        this.scalexButt.position(1190, 565);
        //this.playButt.parent(this.yearDiv);
        this.scalexButt.mousePressed(function () {
            if (!self.xL10) {
                self.xL10 = true;
                this.html('Select Lin x Scale');
            } else {
                self.xL10 = false;
                this.html('Select Log x Scale');
            };
        });

        //create a button to show country/world display type
        var self = this;
        this.showButt = createButton('World Total');
        this.showButt.position(1190, 495);
        //this.playButt.parent(this.yearDiv);
        this.showButt.mousePressed(function () {
            if (!self.curveType) {
                self.curveType = true;
                this.html('World Total');
            } else {
                self.curveType = false;
                this.html('Each Country');
            };
        });

        //create a button to toggle curve/bubble display type
        var self = this;
        this.typeButt = createButton('Melt Data');
        this.typeButt.position(1190, 465);
        //this.playButt.parent(this.yearDiv);
        this.typeButt.mousePressed(function () {
            if (!self.dispType) {
                self.dispType = true;
                this.html('Melt Data');
                self.showButt.hide();
            } else {
                self.dispType = false;
                this.html('Lump Data');
                self.showButt.show();
            };
        });

/*
        //create a button to show country/world display type
        var self = this;
        this.showButt = createButton('World Total');
        this.showButt.position(1190, 515);
        //this.playButt.parent(this.yearDiv);
        this.showButt.mousePressed(function () {
            if (!self.curveType) {
                self.curveType = true;
                this.html('World Total');
            } else {
                self.curveType = false;
                this.html('Each Country');
            };
        });
*/

        // create input for maximum Y
        var self = this;
        this.maxYInput = createInput(this.maxPop.toString());
        this.maxYInput.style('background-color', 'gold');
        this.maxYInput.style('text-align', 'right');
        this.maxYInput.position(315, 20);
        this.maxYInput.size(30);
        this.maxYInput.changed(function () {
            var temp = parseFloat(self.maxYInput.value());
            if (!isNaN(temp)) {
                self.maxPop = temp;
            }
        });

        // create input for minimum Y
        var self = this;
        this.minYInput = createInput(this.minPop.toString());
        this.minYInput.style('background-color', 'gold');
        this.minYInput.style('text-align', 'right');
        this.minYInput.position(315, 530);
        this.minYInput.size(30);
        this.minYInput.changed(function () {
            var temp = parseFloat(self.minYInput.value());
            if (!isNaN(temp)) {
                self.minPop = temp;
            }
        });

    };

    this.destroy = function () {
        this.yearSlider.remove();
        this.playButt.remove();
        this.scalexButt.remove();
        this.typeButt.remove();
        this.showButt.remove();
        this.cbDisps.length = 0;
        this.yearDiv.remove();
        this.yearcbDiv.remove();
        this.maxYInput.remove();
        this.minYInput.remove();
        this.fileDiv.remove();
        this.input.remove();
    };

    this.draw = function () {
        if (!this.loaded1 || !this.loaded2) {
            console.log('Data not yet loaded');
            return;
        }

        if (this.rerange == true) {
            this.recalcAxis();
            this.createCountries();
            this.loadData();
            this.createCBs();
            this.rerange = false;
        }

        // set the values of the checkboxes to the display flags of the countries
        for (var i = 0; i < this.countNames.length; i++) {
            this.countries[i].show = this.cbDisps[i].checked();
        };

        // Draw the title above the plot.
        this.drawTitle();

        // Draw all y-axis labels.
        drawYAxisTickLabels(this.minPop,
            this.maxPop,
            this.layout,
            this.mapyValToHeight.bind(this),
            0);

        // Draw all x-axis labels.
        if (!this.xL10) {
            // The number of x-axis labels to skip so that only
            // numXTickLabels are drawn.
            var xLabelSkip = ceil(this.maxIncome / this.layout.numXTickLabels);

            for (var i = this.minIncome; i <= this.maxIncome; i++) {
                if (i % xLabelSkip == 0) {
                    drawXAxisTickLabel(i, this.layout,
                        this.mapxValToWidth.bind(this));
                }
            }
        } else {
            for (var i = this.minIncomeL10; i <= this.maxIncomeL10; i++) {
                drawXAxisTickLabelL10(i, this.layout,
                    this.mapxValL10ToWidth.bind(this));
            }
        }

        // Draw x and y axis.
        drawAxis(this.layout);

        // Draw x and y axis labels.
        drawAxisLabels(this.xAxisLabel,
            this.yAxisLabel,
            this.layout);

        // if the play button is true increment year value ...  
        if (this.play) {
            this.year = this.year + 1;
            if (this.year >= maxYear) {
                this.year = minYear;
                this.yearSlider.value(this.year);
            }
        } else {
            this.year = this.yearSlider.value();
        };

        numYear = this.year;

        // compare this and last year and empty plot x array
        if (this.year != lastYear) {
            compXVals = [];
        }

        // Write the year value from the slide to screen plot
        textSize(300);
        //noFill();
        fill(255, 0, 0);
        stroke(255, 0, 0);
        text(this.year, width / 2, height / 2);
        textSize(16);

        // Find out if a country or world distribution curve is to be displayed
        if (this.curveType == true) {
            // draw country ellipse/distribution curve
            this.numTips = 0;
            for (var i = 0; i < this.countries.length; i++) {
                // draw the ellipse for country objects
                // pass in this object to access scaling routines
                this.countries[i].draw(this, numYear);
            };
        } else {
            // calculate the year index to get corresponding data from arrays
            // get the data
            yearIndex = this.yearToIndex(numYear);
            //console.log(yearIndex);

            // loop through each country and add the x values to an array
            if (compXVals.length == 0) {
                for (var i = 0; i < this.countries.length; i++) {
                    // load up the x values into the array defalut 200th item
                    // but only if the country is to be displayed 
                    if (this.countries[i].show == true) {
                        compXVals.push(this.countries[i].x0[yearIndex]);
                        compXVals.push(this.countries[i].x1[yearIndex]);
                        compXVals.push(this.countries[i].x2[yearIndex]);
                        compXVals.push(this.countries[i].x3[yearIndex]);
                        compXVals.push(this.countries[i].x4[yearIndex]);
                        compXVals.push(this.countries[i].x5[yearIndex]);
                        compXVals.push(this.countries[i].x6[yearIndex]);
                    }
                };
                // sort compXVals array as x coordinates may not be in order use snippet from
                // w3schools : https://www.w3schools.com/jsref/jsref_sort.asp
                compXVals.sort(function (a, b) {
                    return a - b;
                });

                // remove duplicates in x array as some x coordinates may occur more than once
                this.remDuplicates();
            }

            // loop through every value of x to draw a curve
            stroke(0, 255, 0);
            fill(0, 255, 0);
            beginShape();
            // loop through all values of x to calculate y from each country 
            // function then totalise all ys for each country
            for (var i = 0; i < compXVals.length; i++) {
                var sumX = compXVals[i];
                var sumY = 0.0;

                // loop through each country to finds it's y value to add to sumY
                for (var j = 0; j < this.countries.length; j++) {
                    // only add if country selected
                    if (this.countries[j].show == true) {
                        sumY = sumY + this.countries[j].predictY(sumX, yearIndex);
                    }
                }

                // now we have an x and y value, convert to screen coordinates for plotting
                if (this.xL10) {
                    xpos = this.mapxValL10ToWidth(Math.log10(sumX));
                } else {
                    xpos = this.mapxValToWidth(sumX);
                }
                ypos = this.mapyValToHeight(sumY);
                curveVertex(xpos, ypos);
            }
            endShape();
        }
        //set the lastYear variable
        lastYear = this.year;
    };

    this.drawTitle = function () {
        fill(0);
        noStroke();
        textAlign('center', 'center');

        text(this.title,
            (this.layout.plotWidth() / 2) + this.layout.leftMargin,
            this.layout.topMargin - (this.layout.marginSize / 2));
    };

    this.mapxValToWidth = function (value) {
        return map(value,
            this.minIncome,
            this.maxIncome,
            this.layout.leftMargin, // Draw left-to-right from margin.
            this.layout.rightMargin);
    };

    this.mapxValL10ToWidth = function (value) {
        return map(value,
            this.minIncomeL10,
            this.maxIncomeL10,
            this.layout.leftMargin, // Draw left-to-right from margin.
            this.layout.rightMargin);
    };

    this.mapyValToHeight = function (value) {
        return map(value,
            this.minPop,
            this.maxPop,
            this.layout.bottomMargin, // Smaller pay gap at bottom.
            this.layout.topMargin); // Bigger pay gap at top.
    };

    this.mapPopToWidth = function (value) {
        // ensure bubble diameter no bigger than 200 pixels
        return map(value, 0, maxPopulation, 0, 200);
    };

    this.yearToIndex = function (value) {
        return (value - minYear);
    };

    this.remDuplicates = function () {
        // removes duplicates from the compXVals array using set command described at :
        // https://medium.com/dailyjs/how-to-remove-array-duplicates-in-es6-5daa8789641c
        var xarray = [...new Set(compXVals)];

        // empty original array of x values and fill with non duplicate values 
        compXVals = [];
        compXVals = xarray;
        //console.log(compXVals);
    };

    // Project Modification by W V Persad
    // function created to group commands to rescale x and y axis within a function 
    // so it can be called if a different data file selected 
    this.recalcAxis = function () {
        // Set min and max years: assumes data is sorted by date.
        // get from the table the min and max years
        minYear = int(this.data1.columns[1]);
        maxYear = int(this.data1.columns[this.data1.getColumnCount() - 1]);
    };

    this.createCountries = function () {
        this.countries = [];
        this.countNames = [];
        for (var i = 0; i < this.data1.getRowCount(); i++) {
            //this.countries.push(new Country(0.75*width, 0.5*height + i*100, 20));
            this.countries.push(new Country2());
            this.countries[i].name = this.data1.get(i, 0);
            //this.countries[i].colour = color(random(0, 255), random(0, 255), random(0, 255));
            // generate standard but different colours for each country from article :
            // https://krazydad.com/tutorials/makecolors.php
            this.countries[i].colour = color(
                Math.sin(0.3 * i + 0) * 127 + 128,
                Math.sin(0.3 * i + 2) * 127 + 128,
                Math.sin(0.3 * i + 4) * 127 + 128
            );
            this.countNames.push(this.countries[i].name);
        }
    };

    this.loadData = function () {
        // load the data arrays in each country with the table data
        if (this.countries[0].popData.length == 0) {
            for (var i = 0; i < this.countries.length; i++) {
                for (j = 1; j < this.data1.columns.length; j++) {
                    tempVal = parseInt(this.data1.get(i, j)) / 1000000;
                    this.countries[i].popData.push(tempVal);

                    //tempVal = this.data2.get(i, j);
                    this.countries[i].yValData.push(tempVal);
                    var yVal = tempVal;

                    //convert yearly income in $/year to $/day
                    this.countries[i].xValData.push(parseFloat(this.data2.get(i, j) / 365.0));
                    var xVal = parseFloat(this.data2.get(i, j) / 365.0);

                    //calculate the curve values
                    this.countries[i].calcCurve(xVal, yVal);

                    //calculate polynomial parameters from curve x,y data
                    this.countries[i].calcPoly();
                };
                if (this.minIncome > min(this.countries[i].xValData)) {
                    this.minIncome = floor(min(this.countries[i].xValData));
                };
                if (this.maxIncome < max(this.countries[i].xValData)) {
                    this.maxIncome = ceil(max(this.countries[i].xValData));
                };
                if (this.minPop > min(this.countries[i].yValData)) {
                    this.minPop = floor(min(this.countries[i].yValData));
                };
                if (this.maxPop < max(this.countries[i].yValData)) {
                    this.maxPop = ceil(max(this.countries[i].yValData));
                };
                if (maxPopulation < max(this.countries[i].popData)) {
                    maxPopulation = max(this.countries[i].popData);
                };
            }
        }
    };

    this.createCBs = function () {
        this.cbDisps.length = 0;
        // create some cbDisps one for each country 
        for (var i = 0; i < this.countNames.length; i++) {
            this.cbDisps.push(createCheckbox(this.countNames[i].slice(0, 15), true));
            this.cbDisps[i].position(0, 50 + i * 20);
            this.cbDisps[i].style('color', this.countries[i].colour);
            this.cbDisps[i].parent(this.yearcbDiv);
        };
    };

}
