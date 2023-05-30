var alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", ".", ",", "–"];
var bbox, currentLetter, prevLetter, arrowSign, isPopupOpen;

init();

function init() {
    for (var i = 0; i < alphabet.length; i++) {
        var buttonWidth = "calc(100% / " + alphabet.length + ")";
        // var buttonWidth = "100px";
        // $(".arrows").css("width", buttonWidth);
        $("#letterOverview").append("<li style='width:" + buttonWidth + "'><button class='button letterButton' data-char='" + alphabet[i] + "'>" + alphabet[i] + "</button></li>");

        // which letters are missing?
        // checkAviableLetter(alphabet[i]);
    }
}

window.onload = function() {
    if (window.jQuery) {
        var headerHeight = $("header").height();
        $("nav.about").css("top", headerHeight + 10 + "px")
    }
}

function checkAviableLetter(letter) {
    $.get("data/typeface-" + letter + ".geojson").done(function() {
        drawLetter(letter);
    }).fail(function() {
        openPopup(letter);
    });
}

mapboxgl.accessToken = 'pk.eyJ1IjoiZmVyZGluYW5kc29yZyIsImEiOiI0ODBhMzAzN2IxZTQwZWRmNjE5Mjk0MDUwYzI5MWRlZCJ9.HoD_1Y8j8vO6bPsQqDOZtA';
const map = new mapboxgl.Map({
    container: 'map',
    // satellite with archivo font
    style: 'mapbox://styles/ferdinandsorg/cl84ctid4008214qqirroum55',
    //Leipzig coordinates
    center: [12.360103, 51.340199],
    zoom: 2
});

//Check Mobile Devices
function isTouch() {
    return ('ontouchstart' in document.documentElement);
}

// display coordinates in header
if (isTouch()) {
    map.on('touchmove', (e) => {
        var translatedLat = dg2gms(map.getCenter().lat, 'x');
        var translatedLng = dg2gms(map.getCenter().lng, 'y');
        $("#coordinates .gms").text("[" + translatedLat + " " + translatedLng + "]");
    });
} else {
    map.on('mousemove', (e) => {
        var translatedLat = dg2gms(e.lngLat.lat, 'x');
        var translatedLng = dg2gms(e.lngLat.lng, 'y');
        $("#coordinates .gms").text("[" + translatedLat + " " + translatedLng + "]");
    });
}


function loadLetter(geojson, letter) {

    // reset all Layer
    if (prevLetter) {
        map.removeLayer("letterOutline" + prevLetter);
        map.removeSource("letterOutline" + prevLetter);
    }

    var layerID = "letterOutline" + letter;

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
$(document).on("click touchend", ".letterButton, .char", function() {

    // get letter
    letter = $(this).attr("data-char").toLowerCase();
    // $('#letterOverview').animate({ scrollLeft: $(this).offset().left }, 'slow');
    checkAviableLetter(letter);
});

function drawLetter(letter) {
    letter = letter.toLowerCase();
    currentLetter = letter;

    // remove all active status
    $("ul#letterOverview .letterButton").removeClass("active");
    // add active status to selected
    $("ul#letterOverview").find("[data-char='" + letter + "']").addClass("active");
    console.log("letter is " + letter);

    //check if letter is valid
    if (typeof letter !== "undefined") {
        var url = "data/typeface-" + letter + ".geojson";
    } else {
        var url = "data/typeface-a.geojson";
    }

    $.getJSON(url, function(data) {

        // load Letter into Map
        loadLetter(data, letter);

        // center map to Letter
        bbox = turf.extent(data);
        map.fitBounds(bbox, { padding: 120 });
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
            checkAviableLetter(alphabet[alphabet.length - 1]);
            $(this).text(alphabet[alphabet.length - 2]);
        } else if (indexOfLetter == -1) {
            checkAviableLetter(alphabet[alphabet.length - 1]);
            $(this).text(alphabet[alphabet.length - 2]);
        } else {
            checkAviableLetter(alphabet[indexOfLetter - 1]);
            $(this).text(alphabet[indexOfLetter - 2]);
        }
    }
    if (direction == "arrowNext") {
        // check if currentLetter is the last in the alphabet
        if (indexOfLetter == alphabet.length - 1) {
            // jump to first Item
            checkAviableLetter(alphabet[0]);
            $(this).text(alphabet[1]);
        } else {
            checkAviableLetter(alphabet[indexOfLetter + 1]);
            $(this).text(alphabet[indexOfLetter + 2]);
        }
    }
});

$(".arrows").hover(
    function() {
        var direction = $(this).attr("name");
        arrowSign = $(this).text();
        var indexOfLetter = jQuery.inArray(currentLetter, alphabet);
        if (direction == "arrowPrev") {
            // check if currentLetter is first Item
            if (indexOfLetter == 0) {
                // jump to last Item in alphabet
                $(this).text(alphabet[alphabet.length - 1]);
            } else {
                $(this).text(alphabet[indexOfLetter - 1]);
            }
        }
        if (direction == "arrowNext") {
            // check if currentLetter is the last in the alphabet
            if (indexOfLetter == alphabet.length - 1) {
                // jump to first Item
                $(this).text(alphabet[0]);
            } else {
                $(this).text(alphabet[indexOfLetter + 1]);
            }
        }
    },
    function() {
        $(this).text(arrowSign);
    }
);

// popup

$("#openAbout").on("click", function() {
    $("#about").fadeIn('fast');
});

$(".closePopup").on("click", function() {
    closePopup();
});


function openPopup(letter) {
    isPopupOpen = true;
    if (letter != undefined) {
        $(".selected-letter").text(letter.toUpperCase());
        $("#missingLetter").fadeIn('fast');
    }
}

function closePopup() {
    isPopupOpen = false;
    $(".popup").fadeOut('fast');
}

$(document).keydown(function(e) {
    if (e.keyCode == 27) {
        closePopup();
    }
});

// individual cursor
// $("#map").mousemove(function(event) {

//     var x = event.clientX;
//     var y = event.clientY;

//     // change logo font-variation on x,y cursor
//     // var mapWidth = $("#map").width();
//     // var mapHeight = $("#map").height();
//     // var logoWdth = mapFunc(x, 0, mapWidth, 125, 62);
//     // var logoWght = mapFunc(y, 0, mapHeight, 100, 900);
//     // $('a#logo .word').css('font-variation-settings', '"wdth" '+logoWdth+', "wght" '+logoWght);

//     $(".cursorLine.verticalCursor").css("left", x);
//     $(".cursorLine.horizontalCursor").css("top", y);
//     // $(".coordinates").text("["+x+", "+y+"]");
//     $(".cursorPoint").css({
//         top: y - 4,
//         left: x - 4
//     });
// });

// $("#map").mouseenter(function() {
//     $(".navigationTool").fadeIn("fast");
// }).mouseleave(function() {
//     $(".navigationTool").fadeOut("fast");
// });

// $('#map').on('mousedown', function() {
//     $(".cursorPoint").css("border-radius", "8px");
// }).on('mouseup mouseleave', function() {
//     $(".cursorPoint").css("border-radius", "0");
// });


// change cursor on mousedown
$('#map').on('mousedown', function() {
    $(this).css("cursor", "grabbing");
}).on('mouseup mouseleave', function() {
    $(this).css("cursor", "grab");
});

function dg2gms(dec, dir) {
    var plus = Math.abs(dec);
    var degr = Math.floor(plus);
    var minu = Math.floor(60 * (plus - degr));
    var sec = Math.floor(60 * (60 * (plus - degr) - minu));
    var compass = "?"
    if (minu < 10) { minu = "0" + minu };
    if (sec < 10) { sec = "0" + sec };
    if (dir == 'x') compass = dec < 0 ? "S" : "N";
    else compass = dec < 0 ? "W" : "E";
    return degr + "° " + minu + "' " + sec + '" ' + compass;
}

function mapFunc(val, low1, high1, low2, high2) {
    return (val - low1) / (high1 - low1) * (high2 - low2) + low2;
}

// rotating world emoji

var worldEmoji = ['🌎', '🌍', '🌏'];

textSequence(0);

function textSequence(i) {

    if (worldEmoji.length > i) {
        setTimeout(function() {
            $(".rotating-world").text(worldEmoji[i]);
            textSequence(++i);
        }, 250);

    } else if (worldEmoji.length == i) { // Loop
        textSequence(0);
    }

}