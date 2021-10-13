init();

function init() {
	var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];

	for (var i = 0; i < alphabet.length; i++) {
		$("#letterOverview").append("<li><button class='button letterButton' data-letter='"+alphabet[i]+"'>"+alphabet[i]+"</button></li>");
	}
}

mapboxgl.accessToken = 'pk.eyJ1IjoiZmVyZGluYW5kc29yZyIsImEiOiJja3VvOHZleHAwczY0MnBvYXI0cHQ1eXZqIn0.Z8sROkSQ-Ovu-HERdbyeAg';
const map = new mapboxgl.Map({
	container: 'map',
	// dark
	style: 'mapbox://styles/ferdinandsorg/cji77ibe8231u2sqp2gwokaet',
	// satellite
	// style: 'mapbox://styles/ferdinandsorg/ckuokw3ia19oj17mrb6r9mtza',
	center: [0,0],
	zoom: 1
});

var bbox, prevLetter;

function loadLetter(geojson, letter) {

	// reset all Layer
	if (prevLetter) {
		map.removeLayer("letterOutline"+prevLetter);
		map.removeSource("letterOutline"+prevLetter);
	}

	var layerID = "letterOutline"+letter;

	map.addSource(layerID, {
		"type": "geojson",
		"data": geojson
	});

	map.addLayer({
		"id": layerID,
		"type": "line",
		"source": layerID,
		"layout": {
			'line-join': 'round',
			'line-cap': 'round'
		},
		"paint": {
			"line-color": "#B7EB74",
			"line-width": 10
		}
	});

	prevLetter = letter;
}

$(".letterButton").on("click", function() {
    var letter = $(this).attr("data-letter");
		drawLetter(letter);
});

function drawLetter(letter) {
	var url = "data/typeface-"+letter+".geojson";
	$.getJSON(url, function(data) {

		// load Letter into Map
		loadLetter(data, letter);

		// center map to Letter
		bbox = turf.extent(data);
		map.fitBounds(bbox, {padding: 40});
	});
}

function changeStyle() {
	map.setStyle('mapbox://styles/ferdinandsorg/ckuokw3ia19oj17mrb6r9mtza');
}
