
// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;

function setup() {
  // Create a canvas to fill the content div from index.html.
  canvasContainer = select('#app');
  var c = createCanvas(1024, 576);
  c.parent('app');

  // Create a new gallery object.
  gallery = new Gallery();

  // Add the visualisation objects here.
  gallery.addVisual(new TechDiversityRace());
  gallery.addVisual(new TechDiversityGender());
  gallery.addVisual(new PayGapByJob2017());
  gallery.addVisual(new PayGapTimeSeries());
  gallery.addVisual(new ClimateChange());
  // Add 3 new visualisations & test
  gallery.addVisual(new LifeExpectancyVsFertility());
  gallery.addVisual(new WorldPopulationVsIncome());
  gallery.addVisual(new ChildSurvivalVsGdp());
  //gallery.addVisual(new LifeTest());
    
  // clear local strage variables for alert messages 
  localStorage.clear();
}

function draw() {
  background(255);
  if (gallery.selectedVisual != null) {
    gallery.selectedVisual.draw();
  }
}
