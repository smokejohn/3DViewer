$(document).ready(function() {
    
    var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
    SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;
    
    //grid
    var GL_Length = 100;
    var GridUnit = 10;
        
    var GridMat = new THREE.LineBasicMaterial({
        color: 0x2f2f2f,

    });
    
    var Parameters = function(){
    
        this.DL_X = 1.0;
        this.DL_Y = 1.0;
        this.DL_Z = 1.0;
        this.DiffuseColor = '#c15634';
        this.FresnelColor = '#ffffff';
        this.FresnelIntensity = 0.75;
        this.FresnelExponent = 3.0;
        this.SpecularColor = '#808080';
        this.SpecularExponent = 20.0;
        this.ClearColor = '#1c1c1c';
        this.GridColor = '#2f2f2f';
        this.Grid = false;
    };
    
    var Params = new Parameters();
    
    var Controller = function(){
    
        this.DL_X;
        this.DL_Y;
        this.DL_Z;
        this.DC; 
        this.FC;
        this.FE;
        this.FI;
        this.SC;
        this.SE;
        this.CC;
        this.GC;
        this.G;
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
        udirLightPos: {type: 'v3', value: new THREE.Vector3(Params.DL_X, Params.DL_Y, Params._DL_Z)},
        uDiffuseColor: {type: 'v3', value: new THREE.Vector3(Params.DiffuseColor[0]/255, Params.DiffuseColor[1]/255, Params.DiffuseColor[2]/255)},
        uFresnelColor: {type: 'v3', value: new THREE.Vector3(Params.FresnelColor[0]/255, Params.FresnelColor[1]/255, Params.FresnelColor[2]/255)},
        uFresnelIntensity: {type: 'f', value: Params.FresnelIntensity},
        uFresnelExponent: {type: 'f', value: Params.FresnelExponent},
        uSpecularColor: {type: 'v3', value: new THREE.Vector3(Params.SpecularColor[0]/255, Params.SpecularColor[1]/255, Params.SpecularColor[2]/255)},
        uSpecularExponent: {type: 'f', value: Params.SpecularExponent}   
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
		camera.position.y = 100;
        
        //init problem Variables
 
        
        uniforms['uDiffuseColor'].value.set(193/255, 86/255, 53/255);
        uniforms['uFresnelColor'].value.set(255/255, 255/255, 255/255);
        uniforms['uSpecularColor'].value.set(128/255, 128/255, 128/255);
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
        C.SC = f2.addColor(Params, 'SpecularColor');
        C.SE = f2.add(Params, 'SpecularExponent', 0.1, 255.0);
        
        var f3 = gui.addFolder('Scene');
        C.CC = f3.addColor(Params, 'ClearColor');
        C.G = f3.add(Params, 'Grid');
        C.GC = f3.addColor(Params, 'GridColor');
        
        
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
        
        // shader
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
        
        

        
        
        
        for( var i = -10; i <= 10; i++){
        var GridGeoX = new THREE.Geometry();
            GridGeoX.vertices.push(new THREE.Vector3(-100, 0, 10 * i));
            GridGeoX.vertices.push(new THREE.Vector3(100, 0, 10 * i));
        
        var GridGeoZ = new THREE.Geometry();
            GridGeoZ.vertices.push(new THREE.Vector3(10 * i, 0, -100));
            GridGeoZ.vertices.push(new THREE.Vector3(10 * i, 0, 100));

        var GridLineX = new THREE.Line(GridGeoX, GridMat);
        var GridLineZ = new THREE.Line(GridGeoZ, GridMat);
        
        scene.add(GridLineX);
        scene.add(GridLineZ);
        
        }
        
		// renderer

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT);
		//renderer.setClearColor(0x1c1c1c, 1);
		//renderer.setClearColor(new THREE.Color().setRGB(255, 0, 0), 1);
        
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
            uniforms['udirLightPos'].value.setX(value);
        });
        C.DL_Y.onChange(function(value) {
            uniforms['udirLightPos'].value.setY(value);
        });
        C.DL_Z.onChange(function(value) {
            uniforms['udirLightPos'].value.setZ(value);
        });
        
        C.DC.onChange(function(value) {
            var color = new THREE.Color().setHex("0x" + value.substring(1, 7));
            uniforms['uDiffuseColor'].value.set(color.r, color.g, color.b);
        });
        
        C.FC.onChange(function(value) {
          var color = new THREE.Color().setHex("0x" + value.substring(1, 7));
            uniforms['uFresnelColor'].value.set(color.r, color.g, color.b);
        });
        
        C.FI.onChange(function(value) {
          
            uniforms['uFresnelIntensity'].value = value;
        }); 
        
        C.FE.onChange(function(value) {
           
            uniforms['uFresnelExponent'].value = value;
        }); 
        
        C.SC.onChange(function(value) {
            var color = new THREE.Color().setHex("0x" + value.substring(1, 7));
            uniforms['uSpecularColor'].value.set(color.r, color.g, color.b);
        }); 
        
        C.SE.onChange(function(value) {
          
            uniforms['uSpecularExponent'].value = value;
        }); 
        
        C.CC.onChange(function(value) {
            var color = new THREE.Color().setHex("0x" + value.substring(1, 7));
            renderer.setClearColor(color.getHex(), 1);
        }); 
        
        C.G.onFinishChange(function(value) {
            console.log( 'implement adding and deleting of Grid' );
        }); 
        
        C.GC.onChange(function(value) {
            GridMat.color.setHex("0x" + value.substring(1, 7));
        }); 
        
        directionalLight.position.set( dirL_x, dirL_y, dirL_z ).normalize();
		
	}

	function render() {

		renderer.render( scene, camera );

	}

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight);

    }
    
            




});