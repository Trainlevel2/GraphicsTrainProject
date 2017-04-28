//Eric Mendoza-Conner
//All vertices are based on actual cm measurements in millimeters

var NumVertices = 0;
var aspect = 10000;
var eye = vec3(0,0,10000);		var at = vec3(0,0,1027);     	var up = vec3(0,1,0);
var ytop = aspect; 	var bottom = -1*aspect; 	var left = -1*aspect; var right = aspect;
var near = -2000;	var far = 20000;

//what view is it?
var sideview = 0;

var totpoints=[];	var points = [];				//Array of Vertices
var totcolors=[];   var colors = [];
var theta = 0;
var wheels = [];	var bogies = []; var sides = [];
var rotating = 0;
var program;
var mvMatrixLoc;	
var pMatrixLoc;
var rMatrixLoc;
var rMatrix;
var mvMatrix;	//Model-view Matrix
var pMatrix;	//Projection Matrix

window.onload = function init(){
	//Get canvas elements
	canvas = document.getElementById("train");
	gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") || initWebGL(canvas);
	if (!gl) {
		window.alert("Error: Could not find WebGL");
		return;
	}

	//Setup WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor(0.0, 1.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	// Shaders
	program = initShaders(gl,"vertex-shader", "fragment-shader");
	gl.useProgram(program);

	//Buld the Skeleton for the outside of train
	buildSkeleton();

	//Build the 4 sets of double doors and 2 single doors
	// for(var i = 0; i<10; i++)
	// 	buildDoor(i);

	//Build the 2 trucks underneath the train
	for(var i = 0; i<2; i++)
		buildBogie(i);

	for(var i = 0; i<wheels.length; i++)
		buildWheel(i);


	//After generating each cube, create everything to render each cube
	// Color Buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(totcolors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

	// Vertex Buffer	
	var vBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(totpoints), gl.STATIC_DRAW );

	// Associate shader variables with data buffer
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	//Rotation Matrix
	rMatrixLoc = gl.getUniformLocation (program, "rMatrix");
    rMatrix = mult(rotate(-1,1.0,0.0,0.0),rotate(-3,0.0,1.0,0.0));

	//Model View and Projection Matrices
	mvMatrixLoc= gl.getUniformLocation (program, "mvMatrix");
	pMatrixLoc = gl.getUniformLocation (program, "pMatrix" );

    document.getElementById( "xButton" ).onclick = function () {
        rotateHoriz();
    };

	render();
}

//Initializes all parameters for every cube, including 6 "quad" faces
function buildSkeleton()
{
    roof( 1, 0, 2, 3 );
    roof( 2, 3, 7, 6 );
    roof( 3, 1, 5, 7 );
    roof( 6, 2, 0, 4 );
    roof( 4, 6, 7, 5 );
    roof( 5, 4, 0, 1 );

    under( 1, 0, 2, 3 );
    under( 2, 3, 7, 6 );
    under( 3, 1, 5, 7 );
    under( 6, 2, 0, 4 );
    under( 4, 6, 7, 5 );
    under( 5, 4, 0, 1 );

    floor( 1, 0, 2, 3 );
    floor( 2, 3, 7, 6 );
    floor( 3, 1, 5, 7 );
    floor( 6, 2, 0, 4 );
    floor( 4, 6, 7, 5 );
    floor( 5, 4, 0, 1 );    

	//Build a Specific Side
    side( 1, 0, 2, 3 ); //bottom
    
    side(10,11, 7,15 ); //top back side
    side(13, 3,11,10 ); //bottom back side
    side(2, 13,15, 6 ); //red side back

    side( 3, 1, 9,11 ); //bottom rear
    side(11, 9, 5, 7 ); //top rear
    side( 6, 2, 0, 4 ); //front
    side( 4, 6, 7, 5 ); //top
    side( 5,14, 8, 9 ); //top front side
    side( 9, 8,12, 1 ); //bottom front side
    side( 0,12,14, 4 ); //cab front side

    // first();

}

function first(a, b, c, d)
{
    //define vertices for all 27 .32x.32x.32 cubes in one single vertices definition, with .02 spacing
    var vertices = [
        //area between cab door and first door D78 DM train:
        //cab door cutout vertices 0-3
        vec4(-8278.5,-977, 1147.2,1),
        vec4(-8278.5,-977,-1147.2,1),
        vec4(-8278.5, 1027, 1075.2,1),
        vec4(-8278.5, 1027,-1075.2,1),

        //front side window vertices 4-7
        vec4(-7590.12,855.83, 1081.35,1),
        vec4(-7016,   855.83, 1081.35,1),
        vec4(-7590.12,  0,    1112.1,1),
        vec4(-7016,     0,    1112.1,1),

        // back side window vertices 8-11
        vec4(-7590.12,855.83,-1081.35,1),
        vec4(-7016,   855.83,-1081.35,1),
        vec4(-7590.12,  0   ,-1112.1,1),
        vec4(-7016,     0   ,-1112.1,1),

        //front side above/below window vertices 12-15
        vec4(-7590.12,1027, 1075.2,1),
        vec4(-7016,   1027, 1075.2,1),
        vec4(-7590.12,-977, 1147.2,1),
        vec4(-7016,   -977, 1147.2,1),

        //back side above/below window vertices 16-19
        vec4(-7590.12,1027,-1075.2,1),
        vec4(-7016,   1027,-1075.2,1),
        vec4(-7590.12,-977,-1147.2,1),
        vec4(-7016,   -977,-1147.2,1)



    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],   // white
        [ 1.0, .65, 0.0, 1.0 ],  //orange
        [ 0.0, 1.0, 1.0, 1.0 ]  // cyan

    ];

    var side = new Object();
    side.vertices = [];
    side.colors = [];
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        side.vertices.push(vertices[indices[i]]);
        totpoints.push( vertices[indices[i]] );
        if(a==6||a==0||a==2){
            side.colors.push(vertexColors[3]);
            totcolors.push(vertexColors[3]);
        }
        else if(a==9||a==13||a==3){
            side.colors.push(vertexColors[1]);
            totcolors.push(vertexColors[1]);
        }
        else{
            side.colors.push(vertexColors[5])
            totcolors.push(vertexColors[5]);
        }
    }
    sides.push(side);
}

//WIP Method to generate vertices for making the side of a cube
function side(a, b, c, d)
{
    //define vertices for all 27 .32x.32x.32 cubes in one single vertices definition, with .02 spacing
    var vertices = [
        //corners of the D78 DM train:
        //Bottom corners 0-3
        vec4(-9312.5,-1027, 1149,1),
        vec4( 9059.5,-977, 1147.2,1),
        vec4(-9312.5,-1027,-1149,1),
        vec4( 9059.5,-977,-1147.2,1),
        //Top corners   4-7
        vec4(-9312.5, 1027, 1075.2,1),
        vec4( 9059.5, 1027, 1075.2,1),
        vec4(-9312.5, 1027,-1075.2,1),
        vec4( 9059.5, 1027,-1075.2,1),
        //blue stripe vertices   8-11
        vec4(-8963.5,-557, 1132.11,1),
        vec4( 9059.5,-557, 1132.11,1),
        vec4(-8963.5,-557,-1132.11,1),
        vec4( 9059.5,-557,-1132.11,1),
        //Red face side vertices 12-15
        vec4(-8963.5,-1027, 1147.2,1),
        vec4(-8963.5,-1027,-1147.2,1),
        vec4(-8963.5, 1027, 1075.2,1),
        vec4(-8963.5, 1027,-1075.2,1),
        //cab door cutout vertices 16-19
        vec4(-8278.5,-977, 1147.2,1),
        vec4(-8278.5,-977,-1147.2,1),
        vec4(-8278.5, 1027, 1075.2,1),
        vec4(-8278.5, 1027,-1075.2,1),

    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],   // white
        [ 1.0, .65, 0.0, 1.0 ],  //orange
        [ 0.0, 1.0, 1.0, 1.0 ]  // cyan

    ];

    var side = new Object();
    side.vertices = [];
    side.colors = [];
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        side.vertices.push(vertices[indices[i]]);
        totpoints.push( vertices[indices[i]] );
        if(a==6||a==0||a==2){
            side.colors.push(vertexColors[3]);
            totcolors.push(vertexColors[3]);
        }
        else if(a==9||a==13||a==3){
            side.colors.push(vertexColors[1]);
            totcolors.push(vertexColors[1]);
        }
        else{
            side.colors.push(vertexColors[5])
            totcolors.push(vertexColors[5]);
        }
    }
    sides.push(side);
}


function roof(a, b, c, d)
{
    //define vertices for all 27 .32x.32x.32 cubes in one single vertices definition, with .02 spacing
    var vertices = [
        //corners of the D78 DM train roof:
        //Top corners
        vec4(-9312.5, 1257, 1075.2,1),
        vec4( 9059.5, 1257, 1075.2,1),
        vec4(-9312.5, 1257,-1075.2,1),
        vec4( 9059.5, 1257,-1075.2,1),

        //Bottom corners
        vec4(-9312.5, 1027, 1075.2,1),
        vec4( 9059.5, 1027, 1075.2,1),
        vec4(-9312.5, 1027,-1075.2,1),
        vec4( 9059.5, 1027,-1075.2,1)
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],   // white
        [ 1.0, .65, 0.0, 1.0 ],  //orange
        [ 177/256, 177/256, 177/256, 1.0 ]  // grey


    ];

    var side = new Object();
    side.vertices = [];
    side.colors = [];
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        side.vertices.push(vertices[indices[i]]);
        totpoints.push( vertices[indices[i]] );
        side.colors.push(vertexColors[7]);
        totcolors.push(vertexColors[7]);
    }
    sides.push(side);
}

function under(a, b, c, d)
{
    //define vertices for all 27 .32x.32x.32 cubes in one single vertices definition, with .02 spacing
    var vertices = [
        //corners of the D78 DM train:
        //Bottom corners
        vec4(-9012.5,-1249, 999,1),
        vec4( 8759.5,-1249, 999,1),
        vec4(-9012.5,-1249,-999,1),
        vec4( 8759.5,-1249,-999,1),
        //Top corners
        vec4(-9012.5,-1027, 999,1),
        vec4( 8759.5,-1027, 999,1),
        vec4(-9012.5,-1027,-999,1),
        vec4( 8759.5,-1027,-999,1)
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],   // white
        [ 1.0, .65, 0.0, 1.0 ],  //orange
        [ 0.0, 1.0, 1.0, 1.0 ]  // cyan

    ];

    var side = new Object();
    side.vertices = [];
    side.colors = [];
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        side.vertices.push(vertices[indices[i]]);
        totpoints.push( vertices[indices[i]] );
        side.colors.push(vertexColors[5])
        totcolors.push(vertexColors[0]);
    }
    sides.push(side);
}

//WIP Method to generate vertices for making the floor of train
function floor(a, b, c, d)
{
    //define vertices for all 27 .32x.32x.32 cubes in one single vertices definition, with .02 spacing
    var vertices = [
        //corners of the D78 DM train:
        //Bottom corners
        vec4(-8963.5,-1027, 1149  ,1),
        vec4( 9059.5,-1027, 1149  ,1),
        vec4(-8963.5,-1027,-1149  ,1),
        vec4( 9059.5,-1027,-1149  ,1),
        //Top corners
        vec4(-8963.5, -977, 1147.2,1),
        vec4( 9059.5, -977, 1147.2,1),
        vec4(-8963.5, -977,-1147.2,1),
        vec4( 9059.5, -977,-1147.2,1)
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],   // white
        [ 1.0, .65, 0.0, 1.0 ],  //orange
        [120/256,120/256,120/256, 1.0 ]  // dark grey

    ];

    var side = new Object();
    side.vertices = [];
    side.colors = [];
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        side.vertices.push(vertices[indices[i]]);
        totpoints.push( vertices[indices[i]] );
        if(a==6){
            side.colors.push(vertexColors[3]);
            totcolors.push(vertexColors[3]);
        }
        else if(a==4){
            side.colors.push(vertexColors[7]);
            totcolors.push(vertexColors[7]);
        }
        else{
            side.colors.push(vertexColors[1])
            totcolors.push(vertexColors[1]);
        }
    }
    sides.push(side);
}


function buildDoor(number){
    var Door = new Object();
    Door.vertices = [];
    Door.closed = true;
    Door.color = 0;
}

function buildBogie(number){

	var vertices = [
		//wheel center points, diameter is 915
        //left bogie
  		vec4(-7086.5,-1743, 717.5,1), //front left wheel
  		vec4(-4798.5,-1743, 717.5,1), //right of front left wheel
  		vec4(-6699.5,-1743,-717.5,1), //back left wheel
  		vec4(-4413.5,-1743,-717.5,1), //right of back left wheel

  		//right bogie
  		vec4( 4798.5,-1743, 717.5,1), //left of front right wheel
  		vec4( 7086.5,-1743, 717.5,1), //front right wheel
  		vec4( 4798.5,-1743,-717.5,1), //left of back right wheel
  		vec4( 7086.5,-1743,-717.5,1)  //back right wheel
    ];
    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],   // white
        [ 1.0, 0.65, 0.0, 1.0 ],  //orange
        [ 0.0, 1.0, 1.0, 1.0 ]  // cyan

    ];
    for(var i = number*4; i<4*(number+1); i++){
    	var wheel = new Object();
    	wheel.radius = 394;
    	wheel.location = vertices[i];
    	wheel.color = vertexColors[0];
    	wheel.sideVertices = [];
    	wheel.topVertices = [];
    	wheel.botVertices = [];
        wheel.buffers = [];
    	wheel.segments = 32;
    	wheels.push(wheel);
    }

    //figure out correct vertices
    vertices = [
    	//left bogie
    	vec4(-7480.5,-1027, 716,1), 
    	vec4(-4404.5,-1027, 716,1), 
    	vec4(-7480.5,-1940, 716,1), 
    	vec4(-4404.5,-1940, 716,1), 
        vec4(-7480.5,-1027,-716,1), 
        vec4(-4404.5,-1027,-716,1), 
        vec4(-7480.5,-1940,-716,1), 
        vec4(-4404.5,-1940,-716,1),

    	//right bogie
        vec4( 4404.5,-1027, 716,1), 
        vec4( 7480.5,-1027, 716,1), 
        vec4( 4404.5,-1940, 716,1), 
        vec4( 7480.5,-1940, 716,1), 
        vec4( 4404.5,-1027,-716,1), 
        vec4( 7480.5,-1027,-716,1), 
        vec4( 4404.5,-1940,-716,1), 
        vec4( 7480.5,-1940,-716,1)
    ];

    quadBogie( 1+8*number, 0+8*number, 2+8*number, 3+8*number ,vertices);
    quadBogie( 2+8*number, 3+8*number, 7+8*number, 6+8*number ,vertices);
    quadBogie( 3+8*number, 1+8*number, 5+8*number, 7+8*number ,vertices);
    quadBogie( 6+8*number, 2+8*number, 0+8*number, 4+8*number ,vertices);
    quadBogie( 4+8*number, 6+8*number, 5+8*number, 7+8*number ,vertices);
    quadBogie( 5+8*number, 4+8*number, 0+8*number, 1+8*number ,vertices);

    /*

    side( 1, 0, 2, 3 );
    side( 2, 3, 7, 6 );
    side( 3, 1, 5, 7 );
    side( 6, 2, 0, 4 );
    side( 4, 6, 7, 5 );
    side( 5, 4, 0, 1 );
    */
    var bogie = new Object();
    bogie.color = vertexColors[0];
    bogie.vertices = points;
    points = [];
    bogies.push(bogie);
}

function quadBogie(a,b,c,d,vertices){
	var indices = [ a, b, c, a, c, d ];
	for ( var i = 0; i < indices.length; ++i ) {
	    points.push( vertices[indices[i]] );
	    totpoints.push( vertices[indices[i]] );
	    totcolors.push( [51/256,13/256,0.0,1.0] );
	}
}

function buildWheel(number){
	var vertex = wheels[number].location;
	var depth = 1.5; var radius = wheels[number].radius;
	var theta = (Math.PI/180) * (360/wheels[number].segments);
    var rs = 217/256;   var gs = 217/256;   var bs = 217/256;
    var rf = 0.0;         var gf = 0.0;         var bf = 0.0;
    var al = 1.0;
	for(var i = 0; i<=wheels[number].segments; i++){
		var x = Math.cos(theta*i) + vertex[0];
		var y = Math.sin(theta*i) + vertex[1];
		wheels[number].botVertices.push(x,y,vertex[2]);

		wheels[number].sideVertices.push(x,y,vertex[2]);

		if(vertex[2]>0)
			depth = depth*-1.0;

        wheels[number].sideVertices.push(x,y,vertex[2]+depth);

		wheels[number].topVertices.push(x,y,vertex[2]+depth);

	}
    for(var i  = 0; i<wheels[number].botVertices.length; i++){
        totpoints.push(vec4(wheels[number].botVertices[i].x,wheels[number].botVertices[i].y,wheels[number].botVertices[i].z,1.0));
        totcolors.push( [rf,gf,bf,al] );
    }
    for(var i = 0; i<wheels[number].sideVertices.length; i++){
        totpoints.push(vec4(wheels[number].sideVertices[i].x,wheels[number].sideVertices[i].y,wheels[number].sideVertices[i].z,1.0));
        totcolors.push( [rs,gs,bs,al] );
    }
    for(var i = 0; i<wheels[number].topVertices.length; i++){
        totpoints.push(vec4(wheels[number].topVertices[i].x,wheels[number].topVertices[i].y,wheels[number].topVertices[i].z,1.0));
        totcolors.push( [rf,gf,bf,al] );
    }


    // //Vertex buffer for TOP
    // var vertexBufferWheelFace = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferWheelFace);
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(wheels[number].topVertices), gl.STATIC_DRAW);
    // vertexBufferWheelFace.nmbrOfVertices = wheels[number].topVertices.length/7;
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // wheels[number].buffers.push(vertexBufferWheelFace);

    // // Vertexbuffer for BOTTOM
    // var vertexBufferWheelBack = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferWheelBack);
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(wheels[number].botVertices), gl.STATIC_DRAW);
    // vertexBufferWheelBack.nmbrOfVertices = wheels[number].botVertices.length/7; //xyz + rgba = 7
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // wheels[number].buffers.push(vertexBufferWheelBack);

    // //Vertex buffer for cylinder SIDES
    // var vertexBufferWheelSide = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferWheelSide);
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(wheels[number].sideVertices), gl.STATIC_DRAW);
    // vertexBufferWheelSide.nmbrOfVertices = wheels[number].sideVertices.length / 7; //xyz + rgba = 7
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // wheels[number].buffers.push(vertexBufferWheelSide);
}

function rotateHoriz(){
    if(rotating){
        rotating = 0;
    }
    else{
        rotating = 1;
        sideview = !sideview;
        if(!sideview){
            ytop = 10000; bottom = -10000; left = -10000; right = 10000; near = -5000; far = 20000;
        }
        else{
            ytop = 3000; bottom = -3000; left = -3000; right = 3000; near = -3000; far = 20000;
        }
    }
}

// Display the train
function render(){
	gl.depthFunc(gl.LEQUAL); 

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mvMatrix = lookAt(eye, at, up);
	pMatrix  = ortho (left, right, bottom, ytop, near, far);
    if(rotating){
        theta = theta+2;
        rMatrix=mult(rMatrix,rotate(-2,0.0,1.0,0.0));
        if(theta == 90){
            theta = 0;
            rotating = 0;
        }
    }
    gl.uniformMatrix4fv( mvMatrixLoc, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( pMatrixLoc, false, flatten(pMatrix) );
    gl.uniformMatrix4fv( rMatrixLoc, false, flatten(rMatrix) );


    start = 0;
    gl.drawArrays( gl.TRIANGLES, start, sides.length*sides[0].vertices.length);
    start = start + sides.length*sides[0].vertices.length;
    for(var i = 0; i<bogies.length; i++){
        gl.drawArrays( gl.TRIANGLES, start, bogies[i].vertices.length);
        start = start + bogies[i].vertices.length;
        console.log(start);
    }
    console.log(wheels.length);
    for(var i = 0; i<wheels.length; i++){
        gl.drawArrays(gl.TRIANGLE_FAN, start, wheels[i].botVertices.length);
        start = start + wheels[i].botVertices.length;
        gl.drawArrays(gl.TRIANGLE_FAN, start, wheels[i].sideVertices.length);
        start = start + wheels[i].sideVertices.length;
        gl.drawArrays(gl.TRIANGLE_FAN, start, wheels[i].topVertices.length);
        start = start + wheels[i].topVertices.length;
    }

        // for(var i = 0; i<wheels.length; i++){
    //     drawWheelFace(i);
    //     drawWheelBack(i);
    //     drawWheelSide(i);
    // }
	window.requestAnimationFrame(render,canvas);
}

// function drawWheelFace(num){
//     var stride = (3+4)*4;
//     gl.bindBuffer(gl.ARRAY_BUFFER, wheels[num].buffers[0]);
//     vPosition = gl.getAttribLocation(program, 'vPosition');
//     gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, stride, 0);
//     gl.enableVertexAttribArray(vPosition);

//     var colorOffset = 3*4;
//     vColor = gl.getAttribLocation(program, 'vColor');
//     gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, stride, colorOffset);
//     gl.enableVertexAttribArray(vColor);

//     gl.drawArrays(gl.TRIANGLE_FAN, 0, wheels[num].buffers[0].nmbrOfVertices);
// }

// function drawWheelBack(num){
//     var stride = (3+4)*4;
//     gl.bindBuffer(gl.ARRAY_BUFFER, wheels[num].buffers[1]);
//     vPosition = gl.getAttribLocation(program, 'vPosition');
//     gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, stride, 0);
//     gl.enableVertexAttribArray(vPosition);

//     var colorOffset = 3*4;
//     vColor = gl.getAttribLocation(program, 'vColor');
//     gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, stride, colorOffset);
//     gl.enableVertexAttribArray(vColor);

//     gl.drawArrays(gl.TRIANGLE_FAN, 0, wheels[num].buffers[1].nmbrOfVertices);

// }
// function drawWheelSide(num){
//     var stride = (3+4)*4;
//     gl.bindBuffer(gl.ARRAY_BUFFER, wheels[num].buffers[2]);
//     vPosition = gl.getAttribLocation(program, 'vPosition');
//     gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, stride, 0);
//     gl.enableVertexAttribArray(vPosition);

//     var colorOffset = 3*4;
//     vColor = gl.getAttribLocation(program, 'vColor');
//     gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, stride, colorOffset);
//     gl.enableVertexAttribArray(vColor);

//     gl.drawArrays(gl.TRIANGLE_FAN, 0, wheels[num].buffers[2].nmbrOfVertices);

// }

window.onresize = function(){
	var min = innerWidth;
	if (innerHeight<innerWidth)
		min = innerHeight;
	if (min<canvas.width || min< canvas.height)
		gl.viewport(0,canvas.height-min, min, min);
}