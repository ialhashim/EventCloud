/* Global paths to server scripts */
var rootFolder = "http://54.214.248.120/development/workspace/EventCloud/";

/* When using local host */
var rootFolder = 'http://96.49.252.141/';
//var rootFolder = '/';

var uploadURL = rootFolder + "index.php";
var galleryURL = rootFolder + "gallery.php";
var eventsManager = rootFolder + "events.php";
	
/* Default page display */
var fadeSpeed = 1000;
$(document).ready(function() { 
	$('body').css('transition-duration', fadeSpeed + 'ms');
	$('body').css({opacity:1});
	
	$('body').on("click", ".outlink", function(event){
		event.preventDefault();
		
		$('body').animate({opacity:'0'}, 1);
		$('a').fadeOut(fadeSpeed, function(){
			window.location = event.currentTarget.href;
		});
		
		return false;
	});
});

function encode_utf8(s) {
  return unescape(htmlentities(s));
}

function decode_utf8(s) {
  return htmlentities(escape(s));
}

/* Change to title case */
function toTitleCase(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}

/* Extract url variables */
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/* Need these? */
function onBodyLoad(){
	document.addEventListener("deviceready",onDeviceReady,false);
}
function onDeviceReady(){
	document.addEventListener("resume", onResume, false);
	onResume();
}
function onResume(){
}

