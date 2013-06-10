/* Global paths to server scripts */
var rootFolder = "http://54.214.248.120/development/workspace/EventCloud/";

/* When using local host */
var rootFolder = 'http://192.168.0.10/';
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
			window.location = this.href;
		});
		return false;
	});
});

/* Extract url variables */
$.extend({
  getUrlVars: function(){
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i = 0; i < hashes.length; i++)
	{
	  hash = hashes[i].split('=');
	  vars.push(hash[0]);
	  vars[hash[0]] = hash[1];
	}
	return vars;
  },
  getUrlVar: function(name){
	return $.getUrlVars()[name];
  }
});

/* Change to title case */
function toTitleCase(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
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

