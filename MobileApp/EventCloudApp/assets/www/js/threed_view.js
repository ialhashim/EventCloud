/* Global variables */
eid = getParameterByName('eid');
mid = getParameterByName('mid');
userid = getParameterByName('uid');
username = getUserName(userid);

var camera, scene, renderer;
var mesh;
var objectStack = new Array();
var pauseRendering = false;

var bundle;
var dense;

// selection variables
var targetList = [];
var projector, mouse = { x: 0, y: 0 };

$(document).ready(function() {
	$('#debug').hide();

	init($('#viewportContent'));
	animate();
	
	var bundleCloudJSON = 'https://s3-us-west-2.amazonaws.com/' + bucketOutput + eid + '/bundle/output.json';
	var fullCloudJSON = 'https://s3-us-west-2.amazonaws.com/' + bucketOutput + eid + '/models/model.json';
		
	$.get(bundleCloudJSON, function( b ) {
		bundle = b;
		
		$.get(fullCloudJSON, function( d ) {
			dense = d;
			
			// Add sparse points
			var t = makePointCloud( bundle.points );
			
			// Add cameras
			makeCameraObjects( bundle.cameras, t );
			
			// Add dense reconstruction
			makePointCloud( dense.points, 1.0, t );
			
			// Hide sparse points
			updateObjects();
			setVisisbleObjectByID( t.id, false );
		});
	});
	
	// Test image planes
	//initialMedia();
	
	// mouse event
	projector = new THREE.Projector();
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
});

function init($parent) {
	renderer = new THREE.WebGLRenderer({
		'antialias' : true
	});
	//renderer = new THREE.CanvasRenderer();

	renderer.parent = $parent;
	renderer.setSize(renderer.parent.width(), renderer.parent.height());
	$parent.append(renderer.domElement);

	// Create scene
	scene = new THREE.Scene();

	// Create camera
	camera = new THREE.PerspectiveCamera(40, renderer.parent.width() / renderer.parent.height(), 1, 5000);
	camera.up = new THREE.Vector3(0, 0, 1);
	camera.position.set(950, 900, 950);

	// Camera track-ball controller
	updateControls();
	
	// Lights
	var light = new THREE.PointLight(0xffffff);
	light.position.set(500,550,500);
	scene.add(light);
	
	var light2 = new THREE.PointLight(0xffffff);
	light2.position.set(-500,-550,0);
	scene.add(light2);
	
	var light3 = new THREE.PointLight(0xffffff);
	light3.position.set(0,-550,0);
	scene.add(light3);
		
	// Add a grid
	//objectStack.push(createGrid(250, 50));

	// Axis in scene
	//objectStack.push(createCornerAxis(50, 250));

	// Change view-port on resize
	window.addEventListener('resize', onWindowResize, false);
}

function getClickCoordsWithinTarget(event)
{
  var coords = { x: 0, y: 0};

  if(!event) // then we're in a non-DOM (pro'ly IE) browser
  {
    event = window.event;
    coords.x = event.offsetX;
    coords.y = event.offsetY;
  }
  else // we assume DOM modeled javascript
  {
    var Element = event.target ;
    var CalculatedTotalOffsetLeft = 0;
    var CalculatedTotalOffsetTop = 0 ;

    while (Element.offsetParent)
    {
      CalculatedTotalOffsetLeft += Element.offsetLeft; 
      CalculatedTotalOffsetTop += Element.offsetTop;
      Element = Element.offsetParent ;
    }

    coords.x = event.pageX - CalculatedTotalOffsetLeft;
    coords.y = event.pageY - CalculatedTotalOffsetTop;
  }

  return coords;
}

function onDocumentMouseDown( event ) {
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	// event.preventDefault();
	
	// update the mouse variable
	var p = getClickCoordsWithinTarget(event);
	event.clientX = p.x;
	event.clientY = p.y;
	
	mouse.x = ( event.clientX / renderer.parent.width() ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.parent.height() ) * 2 + 1;
	
	// create a Ray with origin at the mouse position
	//   and direction into the scene (camera direction)
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	projector.unprojectVector( vector, camera );
	var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	// Ray visualize
	if( false )
	{
		var lineGeometry = new THREE.Geometry();
		var vertArray = lineGeometry.vertices;
		
		var p1 = new THREE.Vector3();
		var p2 = new THREE.Vector3();
	
		p1.copy( ray.ray.origin );
		p2.copy( ray.ray.origin.clone().add(ray.ray.direction.clone().multiplyScalar(1000)) );
		
		var curve = new THREE.SplineCurve3([p1, p2]);
		var segments = 3;
		var radiusSegments = 4;
		var closed = false;
		var geom = new THREE.TubeGeometry(curve, segments, 100, radiusSegments, closed);
		var simpleMat = new THREE.MeshPhongMaterial( { color:0xff0044 } );
		simpleMat.side = THREE.DoubleSide;
	    var mesh = new THREE.Mesh(geom, simpleMat);
		scene.add( mesh );
	}
	
	// create an array containing all objects in the scene with which the ray intersects
	var intersects = ray.intersectObjects( targetList );
	
	// if there is one (or more) intersections
	if ( intersects.length > 0 )
	{
		var camID = intersects[0].object.cameraID;
		var cam = getObjectById( camID );
		
		interpolateCamera( cam, function(){
			function basename(url){
			    return ((url=/(([^\/\\\.#\? ]+)(\.\w+)*)([?#].+)?$/.exec(url))!= null)? url[2]: '';
			}
			
			var b = basename( cam.cameraInfo.filename );
			var mediaID = parseInt( b, 10 );

			var folder = '/'; // full or partial
			var mediaURI = getMediaURI(mediaID, 'jpg', eid, folder);
			//var roundTrip = mediaURL + "?request=bypass&url=" + mediaURI;
			
			var imgID = "img-" + mediaID;
			var img = $("<img id='"+imgID+"' class='imagePreview' src='" + mediaURI + "'>");
			//img.css( 'border', '5px solid #EEEEEE');
			img.css( 'box-shadow', '10px 10px 20px rgba(0,0,0,0.5)');
			img.css( 'position', 'absolute' );
			img.css( 'z-index', 999);
			
			
			var w = ($('#viewportContent').height() * 0.95);
			img.css( 'width', w);
			img.css( 'left', ($('#viewportContent').width() - w) * 0.5 );
			img.css( 'top', 5);
			img.hide();
			
			$('body').append( img );
			
			pauseRendering = true;
			
			var $preview = $("#" + imgID);
			$preview.fadeIn();
			$preview.focus();
			
			
			$('body').on('mousedown mousewheel', function(){ 
				$('.imagePreview').fadeOut('fast', function(){
					$('.imagePreview').remove();
					pauseRendering = false;
				}); 
			});
			
			// Display all cameras
			for(var i = 0; i < scene.children.length; i++){
				if(scene.children[i].type == "camera")
					scene.children[i].material.opacity = 1.0;
			}
		});
	}
}

THREE.Utils = {
    cameraLookDir: function(camera) {
        var vector = new THREE.Vector3(0, -1, 0);
        vector.applyEuler(camera.rotation, camera.eulerOrder);
        return vector;
    }
};

function alphaBlend( a, b, t ){
	return ((1.0 - t) * a) + (t * b);
}

function alphaBlendPos( a, b, t ){
	return new THREE.Vector3( 	alphaBlend(a.x,b.x,t), alphaBlend(a.y,b.y,t), alphaBlend(a.z,b.z,t)); 
}

function axisAngleFromTo(v1, v2){
	var axis = new THREE.Vector3();
	axis.crossVectors( v1, v2 );
	axis.normalize();
	var angle = Math.acos( v1.dot(v2) );
	return { axis:axis, angle:angle };
}

function interpolateCamera( cam, callback ) {
	var c = cam.cameraInfo;

	var posA = camera.position.clone();
	var posB = c.position.clone();
	var i = 0;
	
	var tA = controls.target.clone();
	var delta = tA.clone().sub( camera.position.clone() );
	
	var tB = c.q.clone().add( c.direction.clone().multiplyScalar(300) );

	function frame() {
		i++; // update parameters
		var t = i / 100;
		
		// Camera position
		var newPos = alphaBlendPos( posA, posB, t );
		camera.position.set(newPos.x, newPos.y, newPos.z);
		
		// Camera direction
		//var newLookAt = lookAtA.clone();
		//var q = new THREE.Quaternion();
		//q.setFromAxisAngle(axisAngle.axis, axisAngle.angle * t);
		//newLookAt.applyQuaternion( q );
		//camera.lookAt( newLookAt );
		//camera.lookAt( c.q );
		controls.target = alphaBlendPos( tA, tB, t );
			
		cam.material.opacity = 1.0 - t;
		
		// check finish condition
		if (i == 100) {
			clearInterval(id);
			callback();
		}
	}

	var id = setInterval(frame, 10); // draw every 10ms
}

function updateControls(){
	controls = new THREE.TrackballControls( camera );
	controls.rotateSpeed = 0.75;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = false;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [65, 83, 68];
}

function onWindowResize() {
	camera.aspect = renderer.parent.width() / renderer.parent.height();
	camera.updateProjectionMatrix();
	renderer.setSize(renderer.parent.width(), renderer.parent.height());
	//updateControls();
}

function updateObjects(){
	// Automatically add objects at runtime
	while (objectStack.length) {
		var obj = objectStack.pop();
		scene.add( obj );
	}
}

function animate() {
	requestAnimationFrame( animate );
	
	//if(pauseRendering) return;
	
	controls.update();
	updateObjects();
	render();
}

function render() {
	renderer.render(scene, camera);
}

function createGrid(size, step) {
	var geometry = new THREE.Geometry();
	for (var i = -size; i <= size; i += step) {
		geometry.vertices.push(new THREE.Vector3(-size, i, -2));
		geometry.vertices.push(new THREE.Vector3(size, i, -2));
		geometry.vertices.push(new THREE.Vector3(i, -size, -2));
		geometry.vertices.push(new THREE.Vector3(i, size, -2));
	}
	var material = new THREE.LineBasicMaterial({
		color : 0x333333,
		opacity : 0.5
	});
	var line = new THREE.Line(geometry, material);
	line.type = THREE.LinePieces;
	line._meshtype = 'grid';
	return line;
}

function createBillboard(mid, imgURL, position, scaling) {
	var texture = new THREE.Texture();
	var loader = new THREE.ImageLoader();

	scaling = scaling ? scaling : 0.5;
	position = position ? position : new THREE.Vector3(0, 0, 0);

	loader.addEventListener('load', function(event) {
		texture.image = event.content;
		texture.needsUpdate = true;
		var material = new THREE.MeshBasicMaterial({
			map : texture
		});
		material.side = THREE.DoubleSide;

		var w = texture.image.width * scaling;
		var h = texture.image.height * scaling;

		var plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
		plane.mid = mid;
		plane._meshtype = 'billboard';

		plane.rotation.x = Math.PI / 2.0;

		var anchor = new THREE.Vector3(0, 0, h * 0.5);
		plane.position.add(anchor);
		plane.position.add(position);

		// Add to scene via object stack
		objectStack.push(plane);

		// Add its shadow
		var shadowPos = new THREE.Vector3(plane.position.x, plane.position.y, -1);
		addShadow(shadowPos, plane);
	});

	loader.load(imgURL);
}

function createCornerAxis(size, sceneSize) {
	var thickness = size * 0.05;
	var cylinderX = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, size), new THREE.MeshBasicMaterial({
		color : 0xff0000
	}));
	var cylinderY = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, size), new THREE.MeshBasicMaterial({
		color : 0x00ff00
	}));
	var cylinderZ = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, size), new THREE.MeshBasicMaterial({
		color : 0x0000ff
	}));
	cylinderX.rotation.z = Math.PI / 2.0;
	cylinderZ.rotation.x = Math.PI / 2.0;
	size *= 0.5
	cylinderX.position.set(size, 0, 0);
	cylinderY.position.set(0, size, 0);
	cylinderZ.position.set(0, 0, size);
	var anchor = new THREE.Vector3(-sceneSize, -sceneSize, 0);
	cylinderX.position.add(anchor);
	cylinderY.position.add(anchor);
	cylinderZ.position.add(anchor);
	cylinderX._meshtype = 'axis';
	cylinderY._meshtype = 'axis';
	cylinderZ._meshtype = 'axis';
	scene.add(cylinderX);
	scene.add(cylinderY);
	scene.add(cylinderZ);
}

function addShadow(position, parent) {
	var canvas = document.createElement('canvas');
	canvas.width = 64;
	canvas.height = 64;

	var context = canvas.getContext('2d');
	var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
	gradient.addColorStop(0.1, 'rgba(0,0,0,0.4)');
	gradient.addColorStop(1, 'rgba(0,0,0,0)');

	context.fillStyle = gradient;
	context.fillRect(0, 0, canvas.width, canvas.height);

	var shadowTexture = new THREE.Texture(canvas);
	shadowTexture.needsUpdate = true;

	var width = parent.material.map.image.width * 0.75;
	var length = width * 0.3;

	var shadowMaterial = new THREE.MeshBasicMaterial({
		map : shadowTexture,
		transparent : true
	});
	var shadowGeo = new THREE.PlaneGeometry(width, length, 1, 1);

	mesh = new THREE.Mesh(shadowGeo, shadowMaterial);
	mesh.parentMID = parent.mid;
	mesh._meshtype = 'shadow';

	mesh.position.add(position);
	objectStack.push(mesh);
}

function initialMedia() {
	//Test
	//createBillboard( 'crate.gif' );

	$.post(mediaURL, {
		request : 'getChunkByMid',
		mid : mid
	}, function(data) {
		var chunk = JSON.parse(data);

		var theta = (Math.PI * 2) / Object.keys(chunk).length;
		var r = 200;

		for (var i in chunk) {
			var media = chunk[i];
			var folder = '/';

			if (media.type == 'mp4') {
				folder = '/poster/';
				media.type = 'png';
			}

			var mediaURI = getMediaURI(media.mid, media.type, eid, folder);

			var roundTrip = mediaURL + "?request=bypass&url=" + mediaURI;
			var position = new THREE.Vector3(r * Math.cos(theta * i), r * Math.sin(theta * i), 0);
			createBillboard(media.mid, roundTrip, position);
		};
	});
}

function bbox( points ){
	var minx=Number.MAX_VALUE,miny=Number.MAX_VALUE,minz=Number.MAX_VALUE;
	var maxx=-minx,maxy=-miny,maxz=-minz;
	
	for (var i = 0; i < points.length; i++) {
		var x = points[i].x, y = points[i].y, z = points[i].z;
		minx = Math.min(minx, x);	miny = Math.min(miny, y);	minz = Math.min(minz, z);
		maxx = Math.max(maxx, x);	maxy = Math.max(maxy, y);	maxz = Math.max(maxz, z);
	}
	var bbmin = new THREE.Vector3(minx, miny, minz);
	var bbmax = new THREE.Vector3(maxx, maxy, maxz);
	var center = bbmin.add(bbmax).divideScalar( 2 );
	var d = bbmax.sub( bbmin );
	var s = Math.max(d.x, Math.max(d.y, d.z));

	return {min: bbmin, max: bbmax, center: center, diag: d, maxExtent: s};
}

function setVisisbleObjectByID( id, visible ){
	for (var i = 0; i < scene.children.length; i++) {
		if(scene.children[i].id == id){
			scene.children[i].visible = visible;
			console.log( "Setting visiblity for (" + id + ") to " + visible );
		}
	}
}

function getObjectById(id){
	for (var i = 0; i < scene.children.length; i++) {
		if(scene.children[i].id == id){
			return scene.children[i];
		}
	}
	return 0;
}

function makePointCloud(points, scaling, t) {

	// Transformation
	var offset, scale;
	
	if( t ){
		offset = t.offset;
		scale = t.scale;
	} else {
		// Bounding box of input points
		var box = bbox( points );
		offset = box.center;
	
		// Normalize factor
		scaling = scaling ? scaling : 300;
		scale = box.maxExtent / scaling;
	}
	
	var geometry = new THREE.Geometry();
	geometry.colors = [];
	
	// now create the individual particles
	for (var i = 0; i < points.length; i++) {
		
		// Set as normalized and centered
		var pX = points[i].x, pY = points[i].y, pZ = points[i].z;
		var particle = new THREE.Vector3(	(pX - offset.x) / scale, 
											(pY - offset.y) / scale, 
											(pZ - offset.z) / scale)

		// add it to the geometry
		geometry.vertices.push(particle);

		geometry.colors[i] = new THREE.Color();
		geometry.colors[i].setRGB(points[i].r / 255.0, points[i].g / 255.0, points[i].b / 255.0);
	}

	// material
	material = new THREE.ParticleBasicMaterial({
		size : 20,
		transparent : true,
		vertexColors : true,
		/*opacity : 0.7,*/
	});

	// particle system
	var system = new THREE.ParticleSystem(geometry, material);
	objectStack.push( system );
	
	return {offset: offset, scale: scale, id: system.id };
}

function rotationFromTo( v1, v2 ){
	var q = new THREE.Quaternion();
	var a = new THREE.Vector3();
	a.crossVectors(v1, v2);
    q.x = a.x;  q.y = a.y;  q.z = a.z;
    q.w = Math.sqrt( (v1.length() * v1.length()) * (v2.length() * v2.length()) ) + v1.dot(v2);
    q.normalize();
    return q;
}

function makeSphere(p, r){
	r = r ? r : 20;
	var simpleMat = new THREE.MeshPhongMaterial( { color:0x4466ff} );
	var s = new THREE.Mesh( new THREE.SphereGeometry( r, 10, 10 ), simpleMat );
    s.position.set( p.x, p.y, p.z );
    return s;
}

function createCamera( p, n, cam, q ){
	var simpleMat = new THREE.MeshPhongMaterial( { color:0x6644ff, transparent:true, opacity:1 } );
    var cone = new THREE.Mesh(new THREE.CylinderGeometry(25, 5, 40, 6), simpleMat);
	cone.position.set(p.x, p.y, p.z);
	cone.useQuaternion = true;
	
	var v1 = new THREE.Vector3(0,1,0);
	var v2 = n;
    cone.quaternion = rotationFromTo(v1, v2);
    
    cone.type = "camera";
    cone.cameraInfo = { filename: cam.filename, position: p, direction: n, q: q };

    // Selection spheres
    var intersectSphere = new THREE.Mesh( new THREE.SphereGeometry( 80, 10, 10 ), simpleMat );
    intersectSphere.position.set( p.x, p.y, p.z );
    intersectSphere.cameraID = cone.id;
    intersectSphere.visible = false;
    
    objectStack.push( intersectSphere );    
    targetList.push( intersectSphere );
    
	return cone;
}

function makeCameraObjects( cameras, t ){
	var offset = t.offset;
	var scale = t.scale;
	
	for (var i = 0; i < cameras.length; i++) {
		cam = cameras[i];
		var camPos = new THREE.Vector3(	(cam.c.x - offset.x) / scale,(cam.c.y - offset.y) / scale,(cam.c.z - offset.z) / scale );
		var camNormal = new THREE.Vector3(cam.p.x - cam.c.x,cam.p.y - cam.c.y,cam.p.z - cam.c.z);	
		var camLook = new THREE.Vector3((cam.p.x - offset.x) / scale,(cam.p.y - offset.y) / scale,(cam.p.z - offset.z) / scale );	
		camNormal.normalize();				
										
		objectStack.push( createCamera( camPos, camNormal, cam, camLook ) );
	}
}
