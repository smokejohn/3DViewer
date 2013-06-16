$(document).ready(function() {

	var container, stats;
	var camera, controls, scene, renderer;
	init();
	animate();


	function init() {

		container = document.getElementById('container3D')
		//container = document.createElement( 'container' );
		//document.body.appendChild( container );
		camera = new THREE.PerspectiveCamera( 45, 900 / 500, 1, 2000 );
		camera.position.z = 100;
        
        controls = new THREE.OrbitControls( camera );
        controls.addEventListener( 'change', render );
        
		// scene
		scene = new THREE.Scene();

        // lights
		var ambient = new THREE.AmbientLight( 0x101030 );
		scene.add( ambient );

		var directionalLight = new THREE.DirectionalLight( 0xffeedd );
		directionalLight.position.set( 2, 2.5, 1 ).normalize();
		scene.add( directionalLight );

		// texture
        /*
		var texture = new THREE.Texture();

		var loader = new THREE.ImageLoader();
		loader.addEventListener( 'load', function ( event ) {

			texture.image = event.content;
			texture.needsUpdate = true;

		} );
		loader.load( '/files/textures/ash_uvgrid01.jpg' );
        */
        
        
		// model

		var loader = new THREE.OBJLoader();
		loader.addEventListener( 'load', function ( event ) {

			var object = event.content;

			/*object.traverse( function ( child ) {

				if ( child instanceof THREE.Mesh ) {

					child.material.map = texture;

				}

			} );
            */
			object.position.y = -10;
			scene.add( object );

		});
		loader.load( '/files/Cube.obj' );

		// renderer

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( 900, 500 );
		renderer.setClearColor(0x444444, 1)
		container.appendChild( renderer.domElement );





	}
	


	function animate() {

		requestAnimationFrame( animate );
        renderer.render( scene, camera );
        controls.update();
		
	}

	function render() {

		renderer.render( scene, camera );

	}



});