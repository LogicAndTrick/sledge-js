var rmf = {
  'jBinary.all': 'RmfFile',
  'jBinary.littleEndian': true,

  Colour: {
    Red: 'byte',
    Green: 'byte',
    Blue: 'byte'
  },
  
  Visgroup: {
    Name: ['string0', 128],
    Colour: 'Colour',
    Alpha: 'byte',
    ID: 'int32',
    Visible: 'byte',
    Unused: ['array', 'byte', 3]
  },
  
  Coordinate: {
    X: 'float32',
    Y: 'float32',
    Z: 'float32',
  },
  
  Plane: {
    Coordinate1: 'Coordinate',
    Coordinate2: 'Coordinate',
    Coordinate3: 'Coordinate',
  },
  
  Face: {
    TextureName: ['string0', 256],
    Unknown1: 'int32',
    UAxis: 'Coordinate',
    XShift: 'float32',
    VAxis: 'Coordinate',
    YShift: 'float32',
    Rotation: 'float32',
    XScale: 'float32',
    YScale: 'float32',
    Unknown2: ['array', 'int32', 4],
    NumVertices: 'int32',
    Vertices: ['array', 'Coordinate', 'NumVertices'],
    Plane: 'Plane'
  },
  
  Property: {
    KeyLength: 'byte',
    Key: 'string0',
    ValueLength: 'byte',
    Value: 'string0'
  },
  
  EntityData: {
    NameLength: 'byte',
    Name: 'string0',
    Unknown1: 'int32',
    Flags: 'int32',
    NumProperties: 'int32',
    Properties: ['array', 'Property', 'NumProperties'],
    Unknown2: ['array', 'int32', 3]
  },
  
  PathNode: {
	Position: 'Coordinate',
	ID: 'int32',
	Name: ['string0', 128],
    NumProperties: 'int32',
	Properties: ['array', 'Property', 'NumProperties']
  },

  Path: {
	Name: ['string0', 128],
	Type: ['string0', 128],
	Direction: 'int32',
	NumNodes: 'int32',
	Nodes: ['array', 'PathNode', 'NumNodes']
  },
  
  MapObjectBase: {
    TypeLength: 'byte',
    Type: 'string0',
    VisgroupID: 'int32',
    Colour: 'Colour',
    NumChildren: 'int32',
    Children: ['array', 'MapObject', 'NumChildren']
  },
  
  World: {
    Data: 'EntityData',
    NumPaths: 'int32',
    Paths: ['array', 'byte', 'NumPaths']
  },
  
  Group: {},
  
  Solid: {
    NumFaces: 'int32',
    Faces: ['array', 'Face', 'NumFaces']
  },
  
  Entity: {
    Data: 'EntityData',
    Unknown1: 'int16',
    Origin: 'Coordinate',
    Unknown2: 'int32'
  },
  
  Camera: {
    EyePosition: 'Coordinate',
    LookPosition: 'Coordinate'
  },
  
  MapObject: jBinary.Type({
    read: function () {
      var base = this.binary.read('MapObjectBase');
      switch (base.Type) {
        case 'CMapWorld':
            var world = this.binary.read('World');
            base.Data = world.Data;
            base.NumPaths = world.NumPaths;
            base.Paths = world.Paths;
            break;
        case 'CMapSolid':
            var solid = this.binary.read('Solid');
            base.NumFaces = solid.NumFaces;
            base.Faces = solid.Faces;
            break;
        case 'CMapEntity':
            var entity = this.binary.read('Entity');
            base.Data = entity.Data;
            base.Origin = entity.Origin;
            break;
        case 'CMapGroup':
            var group = this.binary.read('Group');
            break;
      };
      return base;
    },
    write: function (values) {
      // not implemented
    }
  }),

  // aliasing FileItem[] as type of entire File
  RmfFile: {
    Version: 'float32',
    Header: ['const', ['string', 3], 'RMF'],
    NumVisgroups: 'int32',
    Visgroups: ['array', 'Visgroup', 'NumVisgroups'],
    Worldspawn: 'MapObject',
    Docinfo: ['const', ['string0'], 'DOCINFO'],
    DocinfoVersion: 'float32',
    ActiveCamera: 'int32',
    NumCameras: 'int32',
    Cameras: ['array', 'Camera', 'NumCameras']
  }
};

/*

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
			if (havePointerLock ) {

				var element = document.body;
				var pointerlockchange = function ( event ) {
					if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
                        controls.enabled = true;
						blocker.style.display = 'none';
					} else {

						controls.enabled = false;
						blocker.style.display = '-webkit-box';
						blocker.style.display = '-moz-box';
						blocker.style.display = 'box';
						instructions.style.display = '';
					}
				}

				var pointerlockerror = function ( event ) {
					instructions.style.display = '';
				}

				// Hook pointer lock state change events
				document.addEventListener( 'pointerlockchange', pointerlockchange, false );
				document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

				document.addEventListener( 'pointerlockerror', pointerlockerror, false );
				document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
				document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

				instructions.addEventListener( 'click', function ( event ) {
					instructions.style.display = 'none';
					element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
                    element.requestPointerLock();
				}, false );

			} else {
				instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
			}

*/
            
var scene, camera, renderer;
var light, controls;
var lastTime;

var geometry;

var MapViewer = function() {
    this.init();
    this.animate();
};

MapViewer.prototype.init = function() {

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor( 0x000000 );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    
    document.body.appendChild( this.renderer.domElement );

    this.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 3000 );
    this.camera.position.x = -234;
    this.camera.position.y = 429;
    this.camera.position.z = -941;

    this.controls = new THREE.FirstPersonControls(this.camera);
    this.controls.movementSpeed = 1000;
    this.controls.lookSpeed = 0.2;
    this.controls.lookVertical = true;
    this.controls.lat = -13;
    this.controls.lon = -6043;

    this.scene = new THREE.Scene();
    
    var light = new THREE.AmbientLight( 0x888888 );
    light.position.set( 1, 1, 1 );
    this.scene.add( light );

    var light1 = new THREE.DirectionalLight(0xffffff, 0.3);
    light1.position.set(-1, -2, 3).normalize();
    this.scene.add(light1);

    var light2 = new THREE.DirectionalLight(0xffffff, 0.3);
    light2.position.set(1, 2, 3).normalize();
    this.scene.add(light2);

    this.lastTime = performance.now();
};

MapViewer.prototype.animate = function() {
    requestAnimationFrame(this.animate.bind(this));
    var time = performance.now() / 1000;
    
    this.controls.update(time - this.lastTime);
    this.renderer.render(this.scene, this.camera);

    this.lastTime = time;
};

MapViewer.prototype.addRmf = function(rmf) {

    var i, f, v;
    var solids = collectSolids(rmf.Worldspawn, []);
    for (i = 0; i < solids.length; i++) {
        var geo = new THREE.Geometry();
        
        var index = 0;
        var solid = solids[i];
        var c = (solid.Colour.Red << 16) + (solid.Colour.Green << 8) + solid.Colour.Blue;
        
        for (f = 0; f < solid.Faces.length; f++) {
            var face = solid.Faces[f];
            for (v = 0; v < face.Vertices.length; v++) {
                var vertex = face.Vertices[v];
                geo.vertices.push(new THREE.Vector3(vertex.X, vertex.Z, -vertex.Y));
            }
            var plane = new THREE.Plane();
            plane.setFromCoplanarPoints(geo.vertices[index + 0], geo.vertices[index + 1], geo.vertices[index + 2]);
            for (v = 1; v < face.Vertices.length - 1; v++) {
                var fc = new THREE.Face3(index + v + 1, index + v, index + 0, plane.normal, c);
                fc.vertexColors = [ c, c, c ];
                geo.faces.push(fc);
            }
            index += face.Vertices.length;
        }
        geo.mergeVertices();
        geo.computeBoundingBox();
        geo.computeVertexNormals();
        geo.computeFaceNormals();
        
        var material = new THREE.MeshLambertMaterial( { ambient: c, shading: THREE.FlatShading } );

        var mesh = new THREE.Mesh(geo, material);
        this.scene.add(mesh);
    }
};

function collectSolids(mapObject, array) {
    if (mapObject.Type == 'CMapSolid') array.push(mapObject);
    for (var i = 0; i < mapObject.Children.length; i++) {
        collectSolids(mapObject.Children[i], array);
    }
    return array;
}

function RunApp() {

    window.viewer = new MapViewer();

    jBinary.load('example.rmf', rmf).then(function(data) {
        var parsed = data.readAll();
        console.log(parsed);
        
        window.viewer.addRmf(parsed);
    }) 

}