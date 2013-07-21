/* Global variables */
eid = getParameterByName('eid');
mid = getParameterByName('mid');
userid = getParameterByName('uid');
username = getUserName(userid);

var camera, scene, renderer;
var mesh;
var objectStack = new Array();

var pointCloud;

$(document).ready(function() {
	$('#debug').hide();

	init($('#viewportContent'));
	animate();

	var pointCloudJSON = 'https://s3-us-west-2.amazonaws.com/' + bucketOutput + eid + '/bundle/output.json';
	$.get(pointCloudJSON, function(data) {
		pointCloud = makePointCloud(data);
	});
});

function init($parent) {
	renderer = new THREE.WebGLRenderer({
		'antialias' : true
	});
	//renderer = new THREE.CanvasRenderer();

	renderer.parent = $parent;
	renderer.setSize(renderer.parent.width(), renderer.parent.height());

	$parent.append(renderer.domElement);

	// Create camera
	camera = new THREE.PerspectiveCamera(45, renderer.parent.width() / renderer.parent.height(), 1, 2000);
	camera.up = new THREE.Vector3(0, 0, 1);
	camera.position.set(350, 300, 350);

	// Camera track-ball controller
	{
		controls = new THREE.TrackballControls(camera);
		controls.rotateSpeed = 0.75;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.8;
		controls.noZoom = false;
		controls.noPan = false;
		controls.staticMoving = false;
		controls.dynamicDampingFactor = 0.3;
		controls.keys = [65, 83, 68];
	}

	// Create scene
	scene = new THREE.Scene();

	// Add a grid
	objectStack.push(createGrid(250, 50));

	// Axis in scene
	objectStack.push(createCornerAxis(50, 250));

	// Test image planes
	initialMedia();

	// Change view-port on resize
	window.addEventListener('resize', onWindowResize, false);
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

function onWindowResize() {
	camera.aspect = renderer.parent.width() / renderer.parent.height();
	camera.updateProjectionMatrix();
	renderer.setSize(renderer.parent.width(), renderer.parent.height());
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();

	// Automatically add objects at runtime
	while (objectStack.length) {
		scene.add(objectStack.pop());
	}

	render();
}

function render() {
	renderer.render(scene, camera);
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

function makePointCloud(cloud, scaling) {
	
	// Bounding box of input points
	var bbmin = new THREE.Vector3(cloud.min.x, cloud.min.y, cloud.min.z);
	var bbmax = new THREE.Vector3(cloud.max.x, cloud.max.y, cloud.max.z);
	var offset = bbmin.add(bbmax).divideScalar( 2 );
	var d = bbmax.sub(bbmin);
	
	scaling = scaling ? scaling : 300;
	var scale = Math.max(d.x, Math.max(d.y, d.z)) / scaling;

	var geometry = new THREE.Geometry();
	geometry.colors = [];
	
	// now create the individual particles
	for (var i = 0; i < cloud.points.length; i++) {
		
		// Set as normalized and centered
		var pX = cloud.points[i].x, pY = cloud.points[i].y, pZ = cloud.points[i].z;
		var particle = new THREE.Vector3(	(pX - offset.x) / scale, 
											(pY - offset.y) / scale, 
											(pZ - offset.z) / scale)

		// add it to the geometry
		geometry.vertices.push(particle);

		geometry.colors[i] = new THREE.Color();
		geometry.colors[i].setRGB(cloud.points[i].r / 255.0, cloud.points[i].g / 255.0, cloud.points[i].b / 255.0);
	}

	// material
	material = new THREE.ParticleBasicMaterial({
		size : 20,
		blending : THREE.NormalBlending,
		/*transparent : true,
		opacity : 0.7,*/
		vertexColors : true
	});

	// particle system
	particleSystem = new THREE.ParticleSystem(geometry, material);

	objectStack.push(particleSystem);
	cloud.particleSystem = particleSystem;
	return cloud;
}
