let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'

d3.json(url).then(function(response) {
    // let markers = L.markerClusterGroup();
    console.log(response);

    createFeatures(response.features);
});

//['-10-10','10-30','30-50','50-70','70-90', '90+']

function getColor(c) {
    return c === '-10-10'  ? "#5cd644" :
           c === '10-30'  ? "#96b900" :
           c === '30-50' ? "#b59b00" :
           c === '50-70' ? "#c47b06" :
           c === '70-90' ? "#c65c2b" :
           c === '90+' ? "#bb4343" :
                            "#5cd644";
}

function createFeatures(earthquakeData) {

    function createCircles (feature, latlng) {
        let circleColor;
        let depth = feature.geometry.coordinates[2];

        let magnitude = feature.properties.mag*2**2;

        //console.log(magnitude);

        if(depth >= 90){
            circleColor = getColor('90+');
        }
        else if (depth >= 70){
            circleColor = getColor('70-90');
        }
        else if (depth >= 50){
            circleColor = getColor('50-70')
        }
        else if (depth >= 30){
            circleColor = getColor('30-50')
        }
        else if (depth >= 10){
            circleColor = getColor('10-30')
        }
        else if (depth >= -10){
            circleColor = getColor('-10-10')
        }

        //console.log(circleColor);

        return L.circleMarker(latlng, {
            color: "black",
            weight: 1,
            opacity: 0.75,
            fillColor: circleColor,
            fillOpacity: 1,
            radius: magnitude
        })
    };


    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: createCircles,
        onEachFeature: onEachFeature
        });


    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
};

function createMap(earthquakes) {

    let carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    });

    let baseMaps = {
        "Cartographic Map": carto
    };

    let overlayMaps = {
        Earthquakes: earthquakes
    };

    let myMap = L.map("map", {
        center: [
        37.09, -95.71
        ],
        zoom: 4,
        layers: [carto, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function() {
        let div = L.DomUtil.create('div', 'legend');
        labels = [];
        bins = ['-10-10','10-30','30-50','50-70','70-90', '90+'];

        labels.push("<table>");

        for (let i = 0; i < bins.length; i++) {
                //console.log(getColor(bins[i]));

                labels.push(
                                '<tr><td style="background-color: '
                                 + getColor(bins[i]) + '; width: 50px;">&nbsp;</td>' 
                                 + '<td>' + bins[i] + "</td></tr>")

                console.log(labels);
                
            }
            labels.push("</table>");
            div.innerHTML = labels.join('<br>');
            
            console.log(div);

        return div;
        };

    legend.addTo(myMap);

}