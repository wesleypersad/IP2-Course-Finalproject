function LifeExpectancyVsFertility() {

    // Name for the visualisation to appear in the menu bar.
    this.name = 'Life Expectancy vs Fertility';

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'life-expectancy-fertility';

    // Title to display above the plot.
    this.title = 'Life Expectancy vs Fertility';

    // Names for each axis.
    this.xAxisLabel = 'fertility (children per woman)';
    this.yAxisLabel = 'life expectancy (years)';

    // Description on tool tip
    this.xttDesc = 'Fertility (/wom) : ';
    this.yttDesc = 'Life Exp (years) : ';

    // Create a variable to hold the data filenames
    this.filenames =    ['t30_population_total.csv',
                        't30_life_expectancy_years.csv',
                        't30_children_per_woman_total_fertility.csv'];
    this.rerange = false;

    // Default x and y axis not to be in log scale
    this.xL10 = false;
    this.yL10 = false;
    
    // Create an array to hold all the country objects which will be bubbles
    // also an array to hols the country names
    this.countries = [];
    this.countNames = [];
    this.cbDisps = [];
    this.cbTrails = [];
    this.fileDiv;
    this.yearDiv;
    this.dispcbDiv;
    this.maxXInput;
    this.minXInput;
    this.maxYInput;
    this.minYInput;

    // number of tooltips on screen at once
    this.numTips;

    // set margin size
    var marginSize = 20;

    // Define some local variables
    var startYear;
    var endYear;
    var maxPopulation = 1300000000;

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
    this.loaded3 = false;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        var self = this;
        this.data1 = [];
        this.data2 = [];
        this.data3 = [];

        this.data1 = loadTable(
            //'./data/life-expectancy/t30_population_total.csv', 'csv', 'header',
            './data/life-expectancy/' + this.filenames[0], 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                self.loaded1 = true;
            });

        this.data2 = loadTable(
            //'./data/life-expectancy/t30_life_expectancy_years.csv', 'csv', 'header',
            './data/life-expectancy/' + this.filenames[1], 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                self.loaded2 = true;
            });

        this.data3 = loadTable(
            //'./data/life-expectancy/t30_children_per_woman_total_fertility.csv', 'csv', 'header',
            './data/life-expectancy/' + this.filenames[2], 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                self.loaded3 = true;
            });
    };

    this.setup = function () {
        // set up frame rate to 5 times a second
        frameRate(5);

        // Font defaults.
        textSize(16);

        // Find the start and end year 
        this.recalcAxis();

        // Set min and max fertility i.e. 2 and 8
        this.startFert = 0;
        this.endFert = 8;

        // same for life expectancy
        this.minLife = 20;
        this.maxLife = 80;
        
        //
        // Create the country objects and load their data
        //
        
        // create a country object and set name, colour only if already empty
        this.createCountries();

        // load the data arrays in each country with the table data
        this.loadData();

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
            if(!localStorage["lealertdisplayed"]) {
                alert("NAVIGATE TO FOLDER: data/life-expectancy !!!")
                localStorage["lealertdisplayed"] = true
            }
        });
        
        // write the data file name
        this.fileDiv.html('Current Data File : ' + this.filenames[0]);
        
        // Create a select file DOM element.
        self = this;
        this.input = createFileInput(function (file) {
            print(file.name);
            var filename = file.name;
            var shortname = filename.substring(0,4);
            // set up the correct set of filenames to load
            console.log(shortname);
            if (shortname == 'test') {
                self.filenames =    ['test_population_total.csv',
                                        'test_life_expectancy_years.csv',
                                        'test_children_per_woman_total_fertility.csv'];
            } else {
                self.filenames =    ['t30_population_total.csv',
                                        't30_life_expectancy_years.csv',
                                        't30_children_per_woman_total_fertility.csv'];
            }
            self.loaded1 = false;
            self.loaded2 = false;
            self.loaded3 = false;
            self.preload();
            self.rerange = true;
        }, true);
        this.input.parent(this.fileDiv);
        this.input.position(10, 80);
        
        // create a div for year slider and play button
        this.yearDiv = createDiv('Year Slider and Play/Pause');
        this.yearDiv.position(350, 620);
        this.yearDiv.style('width', '950px');
        this.yearDiv.style('border', 'thin solid blue');
        this.yearDiv.style('padding', '10px');
        this.yearDiv.style('background-color', 'gold');
       
        // Create sliders to control year to display
        this.yearSlider = createSlider(startYear, endYear, 1);
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
        this.yearcbDiv = createDiv('Display and Trail');
        this.yearcbDiv.position(1335, 0);
        this.yearcbDiv.style('width', '170px');
        this.yearcbDiv.style('height', '640px');
        this.yearcbDiv.style('border', 'thin solid blue');
        this.yearcbDiv.style('padding', '10px');
        this.yearcbDiv.style('background-color', 'gold');
        
        // Create checkboxes for display and trails
        this.createCBs();
        
        // create input for maximum X
        var self = this;
        this.maxXInput = createInput(this.endFert.toString());
        this.maxXInput.style('background-color', 'gold');
        //this.maxXInput.style('text-align', 'right');
        this.maxXInput.position(1300, 545);
        this.maxXInput.size(20);
        this.maxXInput.changed(function () {
            var temp = parseFloat(self.maxXInput.value());
            if (!isNaN(temp)) {
                self.endFert = temp;
                }
            }
        );

        // create input for minimum X
        var self = this;
        this.minXInput = createInput(this.startFert.toString());
        this.minXInput.style('background-color', 'gold');
        //this.minXInput.style('text-align', 'right');
        this.minXInput.position(350, 545);
        this.minXInput.size(20);
        this.minXInput.changed(function () {
            var temp = parseFloat(self.minXInput.value());
            if (!isNaN(temp)) {
                self.startFert = temp;
                }
            }
        );

        // create input for maximum Y
        var self = this;
        this.maxYInput = createInput(this.maxLife.toString());
        this.maxYInput.style('background-color', 'gold');
        this.maxYInput.style('text-align', 'right');
        this.maxYInput.position(325, 20);
        this.maxYInput.size(20);
        this.maxYInput.changed(function () {
            var temp = parseFloat(self.maxYInput.value());
            if (!isNaN(temp)) {
                self.maxLife = temp;
                }
            }
        );

        // create input for minimum Y
        var self = this;
        this.minYInput = createInput(this.minLife.toString());
        this.minYInput.style('background-color', 'gold');
        this.minYInput.style('text-align', 'right');
        this.minYInput.position(325, 530);
        this.minYInput.size(20);
        this.minYInput.changed(function () {
            var temp = parseFloat(self.minYInput.value());
            if (!isNaN(temp)) {
                self.minLife = temp;
                }
            }
        );

    };

    this.destroy = function () {
        this.yearSlider.remove();
        this.playButt.remove();
        this.cbDisps.length = 0;
        this.cbTrails.length = 0;
        this.yearDiv.remove();
        this.yearcbDiv.remove();
        this.maxXInput.remove();
        this.minXInput.remove();
        this.maxYInput.remove();
        this.minYInput.remove();
        this.fileDiv.remove();
        this.input.remove();
    };

    this.draw = function () {
        if (!this.loaded1 || !this.loaded2 || !this.loaded3) {
            console.log('Data not yet loaded');
            return;
        }
        
        if (this.rerange == true) {
            this.recalcAxis();
            this.createCountries();
            this.loadData();
            this.createCBs();            
            this.rerange = false;
            //console.log("IN RERANGE");
        }
        
        // set the values of the checkboxes to the display/trail flags of the countries
        for (var i=0; i<this.countNames.length; i++) {
            this.countries[i].show = this.cbDisps[i].checked();
            this.countries[i].trail = this.cbTrails[i].checked();
        };

        // Draw the title above the plot.
        this.drawTitle();

        // Draw all y-axis labels.
        drawYAxisTickLabels(this.minLife,
            this.maxLife,
            this.layout,
            this.mapyValToHeight.bind(this),
            0);

        // Draw all x-axis labels.
        for (var i = this.startFert; i <= this.endFert; i++) {
            drawXAxisTickLabel(i, this.layout,
                this.mapxValToWidth.bind(this));
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
            if (this.year >= endYear) {
                this.year = startYear;
                this.yearSlider.value(this.year);
            }
        } else {
            this.year = this.yearSlider.value();
        };

        numYear = this.year;
        
        // Write the year value from the slide to screen plot
        textSize(300);
        //noFill();
        fill(255,0,0);
        stroke(255,0,0);
        text(this.year, width / 2, height / 2);
        textSize(16);

        // draw country ellips
        this.numTips = 0;
        for (var i = 0; i < this.countries.length; i++) {
            // draw the ellipse for country objects
            // pass in this object to access scaling routines
            this.countries[i].draw(this, numYear);
        };
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
            this.startFert,
            this.endFert,
            this.layout.leftMargin, // Draw left-to-right from margin.
            this.layout.rightMargin);
    };

    this.mapyValToHeight = function (value) {
        return map(value,
            this.minLife,
            this.maxLife,
            this.layout.bottomMargin, // Smaller pay gap at bottom.
            this.layout.topMargin); // Bigger pay gap at top.
    };

    this.mapPopToWidth = function (value) {
        // ensure bubble diameter no bigger than 200 pixels
        return map(value, 0, maxPopulation, 0, 200);
    };

    this.yearToIndex = function (value) {
        return (value - startYear);
    };

    // Project Modification by W V Persad
    // function created to group commands to rescale x and y axis within a function 
    // so it can be called if a different data file selected 
    this.recalcAxis = function () {
        // Set min and max years: assumes data is sorted by date.
        // get from the table the min and max years
        startYear = int(this.data1.columns[1]);
        endYear = int(this.data1.columns[this.data1.getColumnCount() - 1]);
    };
    
    this.createCountries = function () {
        this.countries = [];
        this.countNames = [];
        for (var i = 0; i < this.data1.getRowCount(); i++) {
            //this.countries.push(new Country(0.75*width, 0.5*height + i*100, 20));
            this.countries.push(new Country());
            this.countries[i].name = this.data1.get(i, 0);
            //this.countries[i].colour = color(random(0,255), random(0,255), random(0,255));
            // generate standard but different colours for each country from article :
            // https://krazydad.com/tutorials/makecolors.php
            this.countries[i].colour = color(
                Math.sin(0.3*i + 0) * 127 + 128, 
                Math.sin(0.3*i + 2) * 127 + 128, 
                Math.sin(0.3*i + 4) * 127 + 128
            );
            this.countNames.push(this.countries[i].name);
        }
    };

    this.loadData = function () {
        // load the data arrays in each country with the table data
        if (this.countries[0].popData.length == 0) {
            for (var i = 0; i < this.countries.length; i++) {
                for (j = 1; j < this.data1.columns.length; j++) {
                    this.countries[i].popData.push(parseInt(this.data1.get(i, j)));
                    this.countries[i].yValData.push(parseFloat(this.data2.get(i, j)));
                    this.countries[i].xValData.push(parseFloat(this.data3.get(i, j)));
                };
                if (this.startFert > min(this.countries[i].xValData)) {
                    this.startFert = floor(min(this.countries[i].xValData));
                };
                if (this.endFert < max(this.countries[i].xValData)) {
                    this.endFert = ceil(max(this.countries[i].xValData));
                };
                if (this.minLife > min(this.countries[i].yValData)) {
                    this.minLife = floor(min(this.countries[i].yValData));
                };
                if (this.maxLife < max(this.countries[i].yValData)) {
                    this.maxLife = ceil(max(this.countries[i].yValData));
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
        for (var i=0; i<this.countNames.length; i++) {
            this.cbDisps.push(createCheckbox(this.countNames[i].slice(0,15), true));
            this.cbDisps[i].position(0, 50 + i* 20);
            this.cbDisps[i].style('color', this.countries[i].colour);
            this.cbDisps[i].parent(this.yearcbDiv);
        }; 
        
        this.cbTrails.length = 0;
        // create some cbTrails one for each country 
        for (var i=0; i<this.countNames.length; i++) {
            this.cbTrails.push(createCheckbox(this.countNames[i].slice(0,0), false));
            this.cbTrails[i].position(150, 50 + i* 20);
            this.cbTrails[i].parent(this.yearcbDiv);
        };
    };

}
