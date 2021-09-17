function LifeTest() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'Life Test';

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = 'life-test';

  // Title to display above the plot.
  this.title = 'Life Expectancy vs Fertility';

  // Names for each axis.
  this.xAxisLabel = 'fertility (children per woman)';
  this.yAxisLabel = 'life expectancy (years)';
    
  // Create an array to hold all the country objects which will be bubbles
  this.countries = [];

  // set margin size
  var marginSize = 20;

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    marginSize: marginSize,

    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,

    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function() {
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
    
  // define variavle to hold year value
  this.year = 1900;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function() {
    var self = this;

    this.data1 = loadTable(
      './data/life-expectancy/test_population_total.csv', 'csv', 'header',
      // Callback function to set the value
      // this.loaded to true.
      function(table) {
        self.loaded1 = true;
      });

    this.data2 = loadTable(
      './data/life-expectancy/test_life_expectancy_years.csv', 'csv', 'header',
      // Callback function to set the value
      // this.loaded to true.
      function(table) {
        self.loaded2 = true;
      });

    this.data3 = loadTable(
      './data/life-expectancy/test_children_per_woman_total_fertility.csv', 'csv', 'header',
      // Callback function to set the value
      // this.loaded to true.
      function(table) {
        self.loaded3 = true;
      });

  };

  this.setup = function() {
    // set up frame rate
    frameRate(5);
  
    // Font defaults.
    textSize(16);

    // Set min and max fertility i.e. 0 and 8
    this.startFert = 1;
    this.endFert = 8;

    // same for life expectancy
    this.minLife = 20;
    this.maxLife = 80;
      
    // Create a select DOM element.
    this.input = createFileInput(function(file) {
        print(file.name);
        this.file = file;}
    );
    this.input.position(50, 600);
    //console.log(this.input);
  
    // Create sliders to control year to display
    this.yearSlider = createSlider(1900, 2018, 1);
    this.yearSlider.position(400, 600);
    this.yearSlider.style('width', '200px');
      
    //create a button to toggle play parameter
    var self = this;
    this.button = createButton('play/pause');
    this.button.position(700, 600);
    this.button.mousePressed(function() {
        if (!self.play) {
            self.play = true;
        } else {
            self.play = false;
        };
    }
    );

    // Create a select DOM element.
    this.country = createSelect();
    this.country.position(1350, 40);

    // fill first 3 manually
    // get the country names from data table 1 and printout
    for (var i=0; i<this.data1.getRowCount(); i++) {
        this.country.option(this.data1.get(i, 0));
    };

    var self = this;
    this.country.changed(function() {
        console.log(self.country.value());
        if (self.countries[0].show) {
            self.countries[0].show = false;
        } else {
            self.countries[0].show = true;
        }
        //    console.log(self.countries[0].show);
        }
    );
      
    // create a single country object to display
    //this.countries.push(new Country(0.75*width, 0.75*height, 50));
      
    // create a country object for every country
    for (var i=0; i<this.data1.getRowCount(); i++) {
        this.countries.push(new Country(0.75*width, 0.5*height + i*100, 20));
    }
  };

  this.destroy = function() {
    this.input.remove();
    this.yearSlider.remove();
    this.country.remove();
  };

  this.draw = function() {
    if (!this.loaded1|| !this.loaded2|| !this.loaded3) {
      console.log('Data not yet loaded');
      return;
    }
      
    // Draw the title above the plot.
    this.drawTitle();

    // Draw all y-axis labels.
    drawYAxisTickLabels(this.minLife,
                        this.maxLife,
                        this.layout,
                        this.mapLifeToHeight.bind(this),
                        0);

    // Draw all x-axis labels.
    for (var i=this.startFert; i<=this.endFert; i++) {
          drawXAxisTickLabel(i, this.layout,
            this.mapFertToWidth.bind(this));
    }

    // Draw x and y axis.
    drawAxis(this.layout);

    // Draw x and y axis labels.
    drawAxisLabels(this.xAxisLabel,
                   this.yAxisLabel,
                   this.layout);

    //var num = this.yearSlider.value();
    //console.log(num.toString());

    // if the play button is true set year to 1950 for test ...  
    if (this.play) {
        this.year = this.year + 1;
        if (this.year >= 2018) {
            this.year = 1900;
        }
    } else {
        this.year = this.yearSlider.value(); 
    };
      
    num = this.year;

    //get data for slider year
    var popYear = this.data1.getColumn(num.toString());
    var lifeYear = this.data2.getColumn(num.toString());
    var fertYear = this.data3.getColumn(num.toString());
      
    var colours = ['red', 'green', 'blue'];
      
    fill(255);
    stroke(0);
    strokeWeight(1);

    // draw 3 ellipses for the 3 countries in the csv file
    for (var i=0; i < 3; i++) {
        var pop = popYear[i];
        var popNum = parseInt(pop);
        var life = lifeYear[i];
        var lifeNum = parseFloat(life);
        var fert = fertYear[i];
        var fertNum = parseFloat(fert);
        
        // find the x and y coordinates for plotting
        // these are the centre of the circles
        var xpos = this.mapFertToWidth(fertNum);
        var ypos = this.mapLifeToHeight(lifeNum);
        
        //console.log(xpos + "XX" + ypos);

        // draw ellipsw representing the population
        fill(colours[i]);
        stroke(0);
        strokeWeight(1);

        ellipse(xpos, ypos, 
            map(popNum, 0, 1300000000, 0, 200));    
    };

    // draw the test country objects
    for (var i=0; i<this.data1.getRowCount(); i++) {
        if (this.countries[i].show) {
        this.countries[i].draw();
        };
    }

    // Write the year value from the slide to screen plot
    textSize(100);
    fill(255, 0, 0);
    text(this.year, width/2, height/2);
    textSize(16);
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');

    text(this.title,
         (this.layout.plotWidth() / 2) + this.layout.leftMargin,
         this.layout.topMargin - (this.layout.marginSize / 2));
  };

  this.mapFertToWidth = function(value) {
    return map(value,
               this.startFert,
               this.endFert,
               this.layout.leftMargin,   // Draw left-to-right from margin.
               this.layout.rightMargin);
  };

  this.mapLifeToHeight = function(value) {
    return map(value,
               this.minLife,
               this.maxLife,
               this.layout.bottomMargin, // Smaller pay gap at bottom.
               this.layout.topMargin);   // Bigger pay gap at top.
  };
}
