var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",".",",","–"];
var bbox, currentLetter, prevLetter, arrowSign;

init();

function init() {
	for (var i = 0; i < alphabet.length; i++) {
		var buttonWidth = "calc(100% / "+alphabet.length+")";
		// var buttonWidth = "100px";
		$(".arrows").css("width", buttonWidth);
		$("#letterOverview").append("<li style='width:"+buttonWidth+"'><button class='button letterButton' data-char='"+alphabet[i]+"'>"+alphabet[i]+"</button></li>");

		// which letters are missing?
		checkAviableLetter(alphabet[i]);

	}
}

function checkAviableLetter(letter) {
	$.get("data/typeface-"+letter+".geojson").done(function() {
			// console.log("✓ – "+letter+" does exist"); ;
	}).fail(function() {
			console.log(letter);
	});
}

mapboxgl.accessToken = 'pk.eyJ1IjoiZmVyZGluYW5kc29yZyIsImEiOiJja3VvOHZleHAwczY0MnBvYXI0cHQ1eXZqIn0.Z8sROkSQ-Ovu-HERdbyeAg';
const map = new mapboxgl.Map({
	container: 'map',
	// dark
	// style: 'mapbox://styles/ferdinandsorg/ckuphc9rs0he617k95nwqdchq',
	// satellite
	style: 'mapbox://styles/ferdinandsorg/ckuokw3ia19oj17mrb6r9mtza',
	//Leipzig coordinates
	center: [12.360103, 51.340199],
	// center: [0,0],
	zoom: 1
});

//Check Mobile Devices
function isTouch() {
  return ('ontouchstart' in document.documentElement);
}


// display coordinates in header
if ( isTouch() ) {
	map.on('touchmove', (e) => {
		var translatedLat = dg2gms(map.getCenter().lat, 'x');
		var translatedLng = dg2gms(map.getCenter().lng, 'y');
		$("#coordinates .gms").text("["+translatedLat+" "+translatedLng+"]");
	});
} else {
	map.on('mousemove', (e) => {
		var translatedLat = dg2gms(e.lngLat.lat, 'x');
		var translatedLng = dg2gms(e.lngLat.lng, 'y');
		$("#coordinates .gms").text("["+translatedLat+" "+translatedLng+"]");
	});
}


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
			"line-color": "#AEF553",
			"line-width": 10
		}
	});

	prevLetter = letter;
}


// trigger Letter
$(document).on("click touchend", ".letterButton, .char", function () {
	console.log("hallo logo");
	// get letter
	letter = $(this).attr("data-char");
	$('#letterOverview').animate({scrollLeft:$(this).offset().left},'slow');
	drawLetter(letter);
});

function drawLetter(letter) {
	letter = letter.toLowerCase();
	currentLetter = letter;

	// remove all active status
	$("ul#letterOverview .letterButton").removeClass("active");
	// add active status to selected
	$("ul#letterOverview").find("[data-char='"+letter+"']").addClass("active");
	console.log("letter is "+letter);

	//check if letter is valid
	if(typeof letter !== "undefined") {
		var url = "data/typeface-"+letter+".geojson";
	} else {
		var url = "data/typeface-a.geojson";
	}

	$.getJSON(url, function(data) {

		// load Letter into Map
		loadLetter(data, letter);

		// center map to Letter
		bbox = turf.extent(data);
		map.fitBounds(bbox, {padding: 120});
	});
}

$(".arrows").on("click", function() {
	var direction = $(this).attr("name");
	var indexOfLetter = jQuery.inArray(currentLetter, alphabet);
	if (direction == "arrowPrev") {
		$(this).text("←");
		// check if currentLetter is first Item
		if (indexOfLetter == 0) {
			// jump to last Item in alphabet
			drawLetter(alphabet[alphabet.length-1]);
			$(this).text(alphabet[alphabet.length-2]);
		} else {
			drawLetter(alphabet[indexOfLetter-1]);
			$(this).text(alphabet[indexOfLetter-2]);
		}
	}
	if (direction == "arrowNext") {
		// check if currentLetter is the last in the alphabet
		if (indexOfLetter == alphabet.length-1) {
			// jump to first Item
			drawLetter(alphabet[0]);
			$(this).text(alphabet[1]);
		} else {
			drawLetter(alphabet[indexOfLetter+1]);
			$(this).text(alphabet[indexOfLetter+2]);
		}
	}
});

$( ".arrows" ).hover(
	function() {
		var direction = $(this).attr("name");
		arrowSign = $(this).text();
		var indexOfLetter = jQuery.inArray(currentLetter, alphabet);
		if (direction == "arrowPrev") {
			// check if currentLetter is first Item
			if (indexOfLetter == 0) {
				// jump to last Item in alphabet
				$(this).text(alphabet[alphabet.length-1]);
			} else {
				$(this).text(alphabet[indexOfLetter-1]);
			}
		}
		if (direction == "arrowNext") {
			// check if currentLetter is the last in the alphabet
			if (indexOfLetter == alphabet.length-1) {
				// jump to first Item
				$(this).text(alphabet[0]);
			} else {
				$(this).text(alphabet[indexOfLetter+1]);
			}
		}
	}, function() {
		$(this).text(arrowSign);
	}
);

// individual cursor
$("#map").mousemove(function( event ) {

	var x = event.clientX;
	var y = event.clientY;

	// change logo font-variation on x,y cursor
	// var mapWidth = $("#map").width();
	// var mapHeight = $("#map").height();
	// var logoWdth = mapFunc(x, 0, mapWidth, 125, 62);
	// var logoWght = mapFunc(y, 0, mapHeight, 100, 900);
	// $('a#logo .word').css('font-variation-settings', '"wdth" '+logoWdth+', "wght" '+logoWght);

	$(".cursorLine.verticalCursor").css("left", x);
	$(".cursorLine.horizontalCursor").css("top", y);
	// $(".coordinates").text("["+x+", "+y+"]");
	$(".cursorPoint").css({
		top: y-4,
		left: x-4
	});
});

$("#map").mouseenter(function() {
	$(".navigationTool").fadeIn("fast");
}).mouseleave(function() {
	$(".navigationTool").fadeOut("fast");
});

$('#map').on('mousedown', function() {
	$(".cursorPoint").css("border-radius", "8px");
}).on('mouseup mouseleave', function() {
	$(".cursorPoint").css("border-radius", "0");
});

function dg2gms(dec, dir) {
	var plus=Math.abs(dec);
	var degr=Math.floor(plus);
	var minu=Math.floor(60*(plus-degr));
	var sec=Math.floor(60*(60*(plus-degr)-minu));
	var compass="?"
	if (minu<10) {minu="0"+minu};
	if (sec<10) {sec="0"+sec};
	if (dir=='x') compass=dec<0?"S":"N";
	else compass=dec<0?"W":"E";
	return degr+"° "+minu+"' "+sec+'" '+compass;
}


function mapFunc(val, low1, high1, low2, high2) {
	return (val - low1) / (high1 - low1) * (high2 - low2) + low2;
}
