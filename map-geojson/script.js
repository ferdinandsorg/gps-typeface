mapboxgl.accessToken = 'pk.eyJ1IjoiZmVyZGluYW5kc29yZyIsImEiOiJja3VvOHZleHAwczY0MnBvYXI0cHQ1eXZqIn0.Z8sROkSQ-Ovu-HERdbyeAg';
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/ferdinandsorg/cktwz8bch198i18l9wfslqsi6',
	center: [0,0],
	zoom: 1
});

var geojson, bbox;

var letter = "g";

var url = "data/typeface-"+letter+".geojson";

$.getJSON(url, function(data) {
	loadMap(data);
});

function loadMap(geojson) {

	bbox = turf.extent(geojson);

	map.on('load', () => {
		map.addSource('my-geojson', {
	        "type": "geojson",
	        "data": geojson
	  });

		map.addLayer({
	        "id": "my-geojson",
	        "type": "line",
	        "source": "my-geojson",
					"layout": {
	                'line-join': 'round',
	                'line-cap': 'round'
	        },
	        "paint": {
	            "line-color": "#B7EB74",
							"line-width": 10
	        }
	    });
	});
}




function fit() {
	map.fitBounds(bbox, {padding: 40});
}
