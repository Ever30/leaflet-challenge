// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function to determine the style of each feature based on its magnitude and depth.
    function getMarkerStyle(feature) {
      const magnitude = feature.properties.mag;
      const depth = feature.geometry.coordinates[2]; // Depth is the third coordinate
      let color;
      
      // Determine color based on depth
      if (depth <= 10) {
        color = '#00FF00';
      } else if (depth <= 30) {
        color = 'greenyellow';
      } else if (depth <= 50) {
        color = 'yellow';
      } else if (depth <= 70) {
        color = 'orange';
      } else if (depth <= 90) {
        color = 'orangered';
      } else {
        color = '#FF0000';
      }
      
      return {
        radius: magnitude * 4, // Adjust radius based on magnitude
        fillColor: color,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
    }
  
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place, magnitude, and depth of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }
  
    // Create a GeoJSON layer with custom styling and popup for each feature.
    let earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, getMarkerStyle(feature));
      },
      onEachFeature: onEachFeature
    });
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}
  

function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "Satellite":  satellite
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
    });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create a legend
  let legend = L.control({ 
    position: 'bottomright' 
    });

  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ['#00FF00', 'greenyellow', 'yellow', 'orange', 'orangered', '#FF0000'];
    let labels = [];

    // Define the box properties
    div.style.backgroundColor = 'rgba(255, 255, 255, .7)';
    div.style.padding = '10px';
    div.style.borderRadius = '5px';
    div.style.maxHeight = '200px'; // we can adjust this 
    div.style.overflowY = 'auto'; // Enable vertical scrolling if content exceeds the height
    
    // Loop through depth intervals and generate a label with a colored square for each interval
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
        '<span style="background:' + colors[i] + '; padding: 0 10px;">&nbsp;</span> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] : '+') + '<br>';
    }

  

    return div;
  };

  legend.addTo(myMap);
}


















