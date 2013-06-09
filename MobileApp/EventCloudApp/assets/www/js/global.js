
/* Global paths to server scripts */
var uploadURL = "http://54.214.248.120/development/workspace/EventCloud/index.php";
var galleryURL = "http://54.214.248.120/development/workspace/EventCloud/gallery.php";
	
var fadeSpeed = 1000;

/* Default page display */
$(document).ready(function() { 
	$('body').css('transition-duration', fadeSpeed + 'ms');
	$('body').css({opacity:1});
	
	$("a").click(function(event){
		event.preventDefault();
		$('body').animate({opacity:'0'}, 1);
		$('a').fadeOut(fadeSpeed, function(){
			window.location = this.href;
		});
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