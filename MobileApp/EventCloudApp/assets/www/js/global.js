/* Global paths to server scripts */
var website = "http://54.214.248.120/development/workspace/EventCloud/";

/* When using local host */
var website = 'http://96.49.252.141/';

var uploadURL = website + "mediaManager.php";
var galleryURL = website + "gallery.php";
var eventsManager = website + "eventsManager.php";
var usersManager = website + "usersManager.php";

/* Default page display */
var fadeSpeed = 500;
$(document).ready(function() {
	$('#mainScreen').css('transition-duration', fadeSpeed + 'ms');
	$('#mainScreen').css({
		opacity : 1
	});

	$('#mainScreen').on("click", ".outlink", function(event) {
		event.preventDefault();

		$('#mainScreen').animate({
			opacity : '0'
		}, 1);
		$('a').fadeOut(fadeSpeed, function() {
			window.location = event.currentTarget.href;
		});

		return false;
	});
});

/* jQuery: small extensions */
jQuery.fn.outerHTML = function(s) {
	return s ? this.before(s).remove() : jQuery("<p>").append(this.eq(0).clone()).html();
};

function executeAsync(func) {
	setTimeout(func, 0);
}

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

/* Time functions */
function msToTime(s, isIncludeMS) {

	function addZ(n) {
		return (n < 10 ? '0' : '') + n;
	}

	var ms = s % 1000;
	s = (s - ms) / 1000;
	var secs = s % 60;
	s = (s - secs) / 60;
	var mins = s % 60;
	var hrs = (s - mins) / 60;

	var tail = '.' + ms;
	if (!isIncludeMS) tail = '';

	return addZ(hrs) + ':' + addZ(mins) + ':' + addZ(secs) + tail;
}

/// Form actions
function actionSubmitForm($sender, $form, callBack) {

	if ($sender.is('a'))
		eventType = 'click';
	if ($sender.is('form'))
		eventType = 'submit';

	$sender.on(eventType, function() {
		$('*').blur();
		event.preventDefault();
		$('#mainScreen').animate({
			opacity : '0'
		}, 1);
		$('a').fadeOut(fadeSpeed, function() {
			callBack();
		});
		return false;
	});
}

function defaultValues($item, defaultText) {
	$item.on('focus', function() {
		var $this = $(this);
		if ($this.val() == defaultText) {
			$this.val('');
			$this.css('color', 'hsl(208, 50%, 30%)');
		}
	}).on('blur', function() {
		var $this = $(this);
		if ($this.val() == '') {
			$this.val(defaultText);
			$this.css('color', 'hsl(0, 0%, 70%)');
		}
	});

	$item.css('color', 'hsl(0, 0%, 70%)');
}

/* Extract url variables */
function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getUserName(userid) {
	var username = '';
	$.ajax({
		url : usersManager,
		data : {
			uid : userid
		},
		type : "POST",
		async : false,
		success : function(data) {
			username = data;
		}
	});
	return username;
}

function getEventStart(eid) {
	var eventStart = '';
	$.ajax({
		url : eventsManager,
		data : {
			request : 'startTime',
			eid : eid
		},
		type : "POST",
		async : false,
		success : function(data) {
			eventStart = data;
		}
	});
	return eventStart;
}

/* Need these? */
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
	document.addEventListener("deviceready", onDeviceReady, false);
} else {
	//onDeviceReady(); //this is the browser
}

function onDeviceReady() {

}
