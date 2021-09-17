function ChildServivalVsGdp() {

    // Name for the visualisation to appear in the menu bar.
    this.name = 'Child Survival vs GDP';

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'child-survival-gdp';

    // Title to display above the plot.
    this.title = 'Child Survival vs GDP';

    // Names for each axis.
    this.xAxisLabel = 'GDP per capita ($)';
    this.yAxisLabel = 'Child Survival (%)';
    
    // Description on tool tip
    this.xttDesc = 'GDP / cap  ($) : ';
    this.yttDesc = 'Child Sur  (%) : ';

    // Create an array to hold all the country objects which will be bubbles
    // also an array to hols the country names
    this.countries = [];
    this.countNames = [];
    this.cbDisps = [];
    this.cbTrails = [];
    this.fileDiv;
    this.yearDiv;
    this.dispcbDiv;
    
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
        numYTickLabels: 8,
    };

    // Property to represent whether data has been loaded.
    this.loaded1 = false;
    this.loaded2 = false;
    this.loaded3 = false;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        var self = this;

        this.data1 = loadTable(
            './data/life-expectancy/t30_population_total.csv', 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                self.loaded1 = true;
            });

        this.data2 = loadTable(
            './data/life-expectancy/t30_life_expectancy_years.csv', 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                self.loaded2 = true;
            });

        this.data3 = loadTable(
            './data/life-expectancy/t30_children_per_woman_total_fertility.csv', 'csv', 'header',
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

        // get from the table the min and max years
        startYear = int(this.data1.columns[1]);
        endYear = int(this.data1.columns[this.data1.getColumnCount() - 1]);

        // Set min and max fertility i.e. 0 and 8
        this.startGDP = 4;
        this.endGDP = 6;

        // same for life expectancy
        this.minSurv = 10;
        this.maxSurv = 80;
        
        //
        // Create the country objects and load their data
        //
        
        // create a country object and set name, colour only if already empty
        if (this.countries.length == 0) {
            for (var i = 0; i < this.data1.getRowCount(); i++) {
                //this.countries.push(new Country(0.75*width, 0.5*height + i*100, 20));
                this.countries.push(new Country());
                this.countries[i].name = this.data1.get(i, 0);
                this.countries[i].colour = color(random(0,255), random(0,255), random(0,255));
                this.countNames.push(this.countries[i].name);
            }
        }

        // load the data arrays in each country with the table data
        // NB test first that the arrays are empty !!!
        if (this.countries[0].popData.length == 0) {
            for (var i = 0; i < this.countries.length; i++) {
                for (j = 1; j < this.data1.columns.length; j++) {
                    this.countries[i].popData.push(parseInt(this.data1.get(i, j)));
                    this.countries[i].yValData.push(parseFloat(this.data2.get(i, j)));
                    this.countries[i].xValData.push(parseFloat(this.data3.get(i, j)));
                };
                if (this.startGDP > min(this.countries[i].xValData)) {
                    this.startGDP = floor(min(this.countries[i].xValData));
                };
                if (this.endGDP < max(this.countries[i].xValData)) {
                    this.endGDP = ceil(max(this.countries[i].xValData));
                };
                if (this.minSurv > min(this.countries[i].yValData)) {
                    this.minSurv = floor(min(this.countries[i].yValData));
                };
                if (this.maxSurv < max(this.countries[i].yValData)) {
                    this.maxSurv = ceil(max(this.countries[i].yValData));
                };
                if (maxPopulation < max(this.countries[i].popData)) {
                    maxPopulation = max(this.countries[i].popData);
                };
            }
        }

        //
        // Create all the DOM elements from here ...
        //
        
        // create a div for choose file & position etc
        this.fileDiv = createDiv('Choose File ?');
        this.fileDiv.position(50, 600);
        this.fileDiv.style('width', '250px');
        this.fileDiv.style('border', 'thin solid blue');
        this.fileDiv.style('padding', '10px');

        // Create a select file DOM element.
        this.input = createFileInput(function (file) {
            print(file.name);
            this.file = file;
        }, true);
        this.input.parent(this.fileDiv);
        this.input.position(0, 40);
        //console.log(this.input);

        // creat a div for year slider and play button
        this.yearDiv = createDiv('Year Slider and Play/Pause');
        this.yearDiv.position(350, 600);
        this.yearDiv.style('width', '950px');
        this.yearDiv.style('border', 'thin solid blue');
        this.yearDiv.style('padding', '10px');
       
        // Create sliders to control year to display
        this.yearSlider = createSlider(startYear, endYear, 1);
        this.yearSlider.position(350, 10);
        this.yearSlider.parent(this.yearDiv);
        this.yearSlider.style('width', '200px');

        //create a button to toggle play parameter
        var self = this;
        this.button = createButton('Play');
        this.button.position(800, 10);
        this.button.parent(this.yearDiv);
        this.button.mousePressed(function () {
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
        this.yearcbDiv.position(1325, 0);
        this.yearcbDiv.style('width', '175px');
        this.yearcbDiv.style('border', 'thin solid blue');
        this.yearcbDiv.style('padding', '10px');
        
        // create some cbDisps one for each country check if empty first
        if (this.cbDisps.length == 0) {
            for (var i=0; i<this.countNames.length; i++) {
                this.cbDisps.push(createCheckbox(this.countNames[i].slice(0,15), true));
                this.cbDisps[i].position(0, 50 + i* 20);
                this.cbDisps[i].parent(this.yearcbDiv);
            }; 
        }
        
        // create some cbTrails one for each country check if empty first
        if (this.cbTrails.length == 0) {
            for (var i=0; i<this.countNames.length; i++) {
                this.cbTrails.push(createCheckbox(this.countNames[i].slice(0,0), false));
                this.cbTrails[i].position(150, 50 + i* 20);
                this.cbTrails[i].parent(this.yearcbDiv);
            }; 
        }

    };

    this.destroy = function () {
        this.input.remove();
        this.yearSlider.remove();
        this.button.remove();
        this.cbDisps.length = 0;
        this.cbTrails.length = 0;
        this.fileDiv.remove();
        this.yearDiv.remove();
        this.yearcbDiv.remove();
    };

    this.draw = function () {
        if (!this.loaded1 || !this.loaded2 || !this.loaded3) {
            console.log('Data not yet loaded');
            return;
        }
        
        // set the values of the checkboxes to the display/trail flags of the countries
        for (var i=0; i<this.countNames.length; i++) {
            this.countries[i].show = this.cbDisps[i].checked();
            this.countries[i].trail = this.cbTrails[i].checked();
        };

        // Draw the title above the plot.
        this.drawTitle();

        // Draw all y-axis labels.
        drawYAxisTickLabels(this.minSurv,
            this.maxSurv,
            this.layout,
            this.mapyValToHeight.bind(this),
            0);

        // Draw all x-axis labels.
        for (var i = this.startGDP; i <= this.endGDP; i++) {
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
        textSize(150);
        fill(255, 0, 0);
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
            this.startGDP,
            this.endGDP,
            this.layout.leftMargin, // Draw left-to-right from margin.
            this.layout.rightMargin);
    };

    this.mapyValToHeight = function (value) {
        return map(value,
            this.minSurv,
            this.maxSurv,
            this.layout.bottomMargin, // Smaller pay gap at bottom.
            this.layout.topMargin); // Bigger pay gap at top.
    };

    this.mapPopToWidth = function (value) {
        return map(value, 0, maxPopulation, 0, 200);
    };

    this.yearToIndex = function (value) {
        return (value - startYear);
    };

}

