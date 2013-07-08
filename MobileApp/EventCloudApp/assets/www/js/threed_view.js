
var camera, scene, renderer;
var mesh;


$(document).ready(function() { 
	init( $('#viewportContent') );
	animate();
});

function init( $parent ) {
	renderer = new THREE.WebGLRenderer();
	renderer.parent = $parent;
	renderer.setSize( renderer.parent.width(), renderer.parent.height() );
	
	$parent.append( renderer.domElement );

	camera = new THREE.PerspectiveCamera( 70, renderer.parent.width() / renderer.parent.height(), 1, 1000 );
	camera.position.z = 400;

	scene = new THREE.Scene();

	var geometry = new THREE.CubeGeometry( 200, 200, 200 );

	var texture = THREE.ImageUtils.loadTexture( 'crate.gif' );
	texture.anisotropy = renderer.getMaxAnisotropy();

	var material = new THREE.MeshBasicMaterial( { map: texture } );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = renderer.parent.width() / renderer.parent.height();
	camera.updateProjectionMatrix();

	renderer.setSize( renderer.parent.width(), renderer.parent.height() );
}

function animate() {

	requestAnimationFrame( animate );

	mesh.rotation.x += 0.005;
	mesh.rotation.y += 0.01;

	renderer.render( scene, camera );

}