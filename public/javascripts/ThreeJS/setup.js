$(document).ready(function() {

	var container, stats;
	var camera, scene, renderer;
	var mouseX = 0, mouseY = 0;
	var windowHalfX = 900 / 2;
	var windowHalfY = 500 / 2;
	init();
	animate();


	function init() {

		container = document.getElementById('container3D')
		//container = document.createElement( 'container' );
		//document.body.appendChild( container );
		camera = new THREE.PerspectiveCamera( 45, 900 / 500, 1, 2000 );
		camera.position.z = 100;

		// scene
		scene = new THREE.Scene();

		var ambient = new THREE.AmbientLight( 0x101030 );
		scene.add( ambient );

		var directionalLight = new THREE.DirectionalLight( 0xffeedd );
		directionalLight.position.set( 0, 0, 1 ).normalize();
		scene.add( directionalLight );

		// texture

		var texture = new THREE.Texture();

		var loader = new THREE.ImageLoader();
		loader.addEventListener( 'load', function ( event ) {

			texture.image = event.content;
			texture.needsUpdate = true;

		} );
		loader.load( 'files/textures/ash_uvgrid01.jpg' );

		// model

		var loader = new THREE.OBJLoader();
		loader.addEventListener( 'load', function ( event ) {

			var object = event.content;

			object.traverse( function ( child ) {

				if ( child instanceof THREE.Mesh ) {

					child.material.map = texture;

				}

			} );

			object.position.y = -10;
			scene.add( object );

		});
		loader.load( 'files/Cube.obj' );

		//

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( 900, 500 );
		renderer.setClearColor(0x444444, 1)
		container.appendChild( renderer.domElement );

		container.addEventListener( 'mousemove', onDocumentMouseMove, false );

		//

		//window.addEventListener( 'resize', onWindowResize, false );

	}
	/*
	function onWindowResize() {

		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}
	*/
	function onDocumentMouseMove( event ) {

		mouseX = ( event.clientX - windowHalfX ) / 2;
		mouseY = ( event.clientY - windowHalfY ) / 2;

	}

	//

	function animate() {

		requestAnimationFrame( animate );
		render();

	}

	function render() {

		camera.position.x += ( mouseX - camera.position.x ) * .05;
		camera.position.y += ( - mouseY - camera.position.y ) * .05;

		camera.lookAt( scene.position );

		renderer.render( scene, camera );

	}



});