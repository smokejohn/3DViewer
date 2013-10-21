$(document).ready(function() {
    
    var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
    SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;
    
    var Parameters = function(){
    
        this.DL_X = 1.0;
        this.DL_Y = 1.0;
        this.DL_Z = 1.0;
        this.DiffuseColor = [193, 86, 52];
        this.FresnelColor = [255, 255, 255];
        this.FresnelIntensity = 0.75;
        this.FresnelExponent = 3.0;
    }
    
    var Params = new Parameters();
    
    var Controller = function(){
    
        this.DL_X;
        this.DL_Y;
        this.DL_Z;
        this.DC; 
        this.FC;
        this.FE;
        this.FI;
    }
    
    var C = new Controller();
    
    
    var dirL_x = 1.0, dirL_y = 1.0, dirL_z = 1.0;
    var directionalLight;
	var container, stats;
	var camera, controls, scene, renderer;
    var path;
    var url = location.href;
    var attributes = {};
    var uniforms = {
        scale: {type: 'f', value: 1.0},
        dirLightPos: {type: 'v3', value: new THREE.Vector3(Params.DL_X, Params.DL_Y, Params._DL_Z)},
        DiffuseColor: {type: 'v3', value: new THREE.Vector3(Params.DiffuseColor[0]/255, Params.DiffuseColor[1]/255, Params.DiffuseColor[2]/255)},
        FresnelColor: {type: 'v3', value: new THREE.Vector3(Params.FresnelColor[0]/255, Params.FresnelColor[1]/255, Params.FresnelColor[2]/255)},
        FresnelIntensity: {type: 'f', value: Params.FresnelIntensity},
        FresnelExponent: {type: 'f', value: Params.FresnelExponent}
    
    
    };
    getPath();
	
	

    
    
    function getPath(){
    
    
        url = url.substring(url.lastIndexOf('/') + 1);

        $.post('/user/getModel', { id: url }).done(function(data){
            console.log(data.path);
            path = data.path;
            init()

        });
    
        /*
        $.ajax({
        
            url: '/user/getModel',
            type: 'POST',
            dataType: 'json',

            complete: function(){
                console.log('CL:process complete');
            },

            success: function(data){
                console.log("CL Data: " + data);
                path = data;
                console.log('CL:process success');
            },

            error: function(){
                console.log('CL:process error');       
            }

        });
        */
     
    }


	function init() {

		container = document.getElementById('container3D')
		//container = document.createElement( 'container' );
		//document.body.appendChild( container );
		camera = new THREE.PerspectiveCamera( 45, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 2000 );
		camera.position.z = 150;
        
        
        //*************************
        //DAT.GUI
        //*************************
        
        
        

        var gui = new dat.GUI({ autoPlace: false });
        var customContainer = document.getElementById('guiContainer');
        customContainer.appendChild(gui.domElement)
        
        var f1 = gui.addFolder('Directional Light Orientation');
        C.DL_X = f1.add(Params, 'DL_X', -1, 1);
        C.DL_Y = f1.add(Params, 'DL_Y', -1, 1);
        C.DL_Z = f1.add(Params, 'DL_Z', -1, 1);
        
        var f2 = gui.addFolder('Shader Parameters');
        C.DC = f2.addColor(Params, 'DiffuseColor');
        C.FC = f2.addColor(Params, 'FresnelColor');
        C.FI = f2.add(Params, 'FresnelIntensity', 0.0, 1.0);
        C.FE = f2.add(Params, 'FresnelExponent', 1.0, 8.0);
        
		// scene
		scene = new THREE.Scene();

        // lights
		var ambient = new THREE.AmbientLight( 0x202020 );
		scene.add( ambient );

		directionalLight = new THREE.DirectionalLight( 0xffeedd );
		directionalLight.position.set( 1, 2.5, 1 ).normalize();
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
        
        var vertShader = $('#vertShader').text();
        var fragShader = $('#fragShader').text();
        
        var uberMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            attributes: attributes,
            vertexShader: vertShader,
            fragmentShader: fragShader,
            transparent: false       
        });
        
        
		// model

		var loader = new THREE.OBJLoader();
		loader.addEventListener( 'load', function ( event ) {

			var object = event.content;

			object.traverse( function ( child ) {

				if ( child instanceof THREE.Mesh ) {

					child.material = uberMaterial;

				}

			} );
            
			object.position.y = 0;
            
			scene.add( object );

		});
		// loader.load( '/' + path );
		loader.load(path);
        
        window.addEventListener('resize', onWindowResize, false);
        
		// renderer

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
		renderer.setClearColor(0x1c1c1c, 1);
        
		container.appendChild( renderer.domElement );
        controls = new THREE.TrackballControls( camera, renderer.domElement);
        controls.addEventListener( 'change', render, false );
        
        animate();
	}
	


	function animate() {

		requestAnimationFrame( animate );
        renderer.render( scene, camera );
        controls.update();
        
        C.DL_X.onChange(function(value) {
            uniforms['dirLightPos'].value.setX(value);
        });
        C.DL_Y.onChange(function(value) {
            uniforms['dirLightPos'].value.setY(value);
        });
        C.DL_Z.onChange(function(value) {
            uniforms['dirLightPos'].value.setZ(value);
        });
        
        C.DC.onChange(function(value) {
            //console.log(value);
            uniforms['DiffuseColor'].value.set(value[0]/255, value[1]/255, value[2]/255);
        });
        
        C.FC.onChange(function(value) {
            //console.log(value);
            uniforms['FresnelColor'].value.set(value[0]/255, value[1]/255, value[2]/255);
        });
        
        C.FI.onChange(function(value) {
            //console.log(value);
            uniforms['FresnelIntensity'].value = value;
        });  
        C.FE.onChange(function(value) {
            //console.log(value);
            uniforms['FresnelExponent'].value = value;
        }); 
        
        directionalLight.position.set( dirL_x, dirL_y, dirL_z ).normalize();
		
	}

	function render() {

		renderer.render( scene, camera );

	}

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }
    
            




});