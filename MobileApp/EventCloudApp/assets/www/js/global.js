/* Global paths to server scripts */
var rootFolder = "http://54.214.248.120/development/workspace/EventCloud/";

/* When using local host */
var rootFolder = 'http://96.49.252.141/';
//var rootFolder = '/';

var uploadURL = rootFolder + "index.php";
var galleryURL = rootFolder + "gallery.php";
var eventsManager = rootFolder + "events.php";
	
/* Default page display */
var fadeSpeed = 500;
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


/// Form actions
function actionSubmitForm( $sender, $form ){
	
	if($sender.is('a')) eventType ='click';
	if($sender.is('form')) eventType ='submit';
	
	$sender.on(eventType,function() {
		$('*').blur();
		event.preventDefault();
		$('body').animate({opacity:'0'}, 1);
		$('a').fadeOut(fadeSpeed, function(){
			$form.unbind("submit").submit();
			});
		return false;
	});
}

function defaultValues( $item, defaultText ){
	$item
		.on('focus', function(){
			var $this = $(this);
			if($this.val() == defaultText){
				$this.val('');
				$this.css('color', 'hsl(208, 50%, 30%)');
			}
		})
		.on('blur', function(){
			var $this = $(this);
			if($this.val() == ''){
				$this.val(defaultText);
				$this.css('color', 'hsl(0, 0%, 70%)');
			}
		});

	$item.css('color', 'hsl(0, 0%, 70%)');
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

