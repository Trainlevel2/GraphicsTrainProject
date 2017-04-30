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
var wheels = [];	var bogies = []; var sides = []; var doors = [];
var rotating = 0;
var program;
var mvMatrixLoc;	
var pMatrixLoc;
var rMatrixLoc;
var rMatrix;
var mvMatrix;	//Model-view Matrix
var pMatrix;	//Projection Matrix
var numSideVertices;

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

    // Build the 4 sets of double doors and 2 single doors
    buildDoors();

	//Buld the Skeleton for the outside of train
	buildSkeleton();

    numSideVertices = 0;
    for(var i = 0; i<sides.length; i++){
        numSideVertices = numSideVertices + sides[i].vertices.length;
    }

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
    rMatrix = mult(rotate(-1,1.0,0.0,0.0),rotate(-5,0.0,1.0,0.0));

	//Model View and Projection Matrices
	mvMatrixLoc= gl.getUniformLocation (program, "mvMatrix");
	pMatrixLoc = gl.getUniformLocation (program, "pMatrix" );

    document.getElementById( "xButton" ).onclick = function () {
        rotateHoriz();
    };

	render();
}

//Creates all the doors including the cab doors and front/back of train
function buildDoors(){
    // door( a, b, c, d,x1,x11,x12,x2,z1,z2);

    var x1 = -6707.36;
    var x11 =-6507.36;
    var x12 =-5740;
    var x2 = -5540;
    var z = 1126;
    for(var i = 0; i<4; i++){

        // front side
        door( 2,12,14,0 , x1, x11, x12, x2,z);
        door(12,13, 5,4 , x1, x11, x12, x2,z);
        door( 6, 7,15,14, x1, x11, x12, x2,z);
        door(13,20,21,15, x1, x11, x12, x2,z);
        // //window front
        door( 4, 5, 7, 6, x1, x11, x12, x2,z);

        // // back side
        door( 3,16,18, 1, x1, x11, x12, x2,z);
        door(16,17, 9, 8, x1, x11, x12, x2,z);
        door(10,11,19,18, x1, x11, x12, x2,z);
        door(17,22,23,19, x1, x11, x12, x2,z);
        // //window back
        door( 8, 9,11,10, x1, x11, x12, x2,z);
        x1 = x2+2916.19;
        x11= x1+200;
        x12= x11+767.36;
        x2 = x12+200;
    }
}

function door( a, b, c, d, x1,x11,x12, x2, z){
    //z value specified is outermost z at bottom of door
    var yTop = 1027;
    var yWTop = yTop-171.17;
    var yWBot = 0;
    var yBot = -977;
    var zTop = z-72;
    var zWTop = zTop+6.15;
    var zWBot = zWTop+30.75;
    //define vertices for all 27 .32x.32x.32 cubes in one single vertices definition, with .02 spacing
    var vertices = [
        //area between cab door and first door D78 DM train:
        //left door cutout vertices 0-3
        vec4(x1, yBot, z    ,1),
        vec4(x1, yBot,-z   ,1),
        vec4(x1, yTop, zTop,1),
        vec4(x1, yTop,-zTop,1),

        //front side window vertices 4-7
        vec4(x11,yWTop,zWTop,1),
        vec4(x12,yWTop,zWTop,1),
        vec4(x11,yWBot,zWBot,1),
        vec4(x12,yWBot,zWBot,1),

        // back side window vertices 8-11
        vec4(x11,yWTop,-zWTop,1),
        vec4(x12,yWTop,-zWTop,1),
        vec4(x11,yWBot,-zWBot,1),
        vec4(x12,yWBot,-zWBot,1),

        //front side above/below window vertices 12-15
        vec4(x11,yTop, zTop,1),
        vec4(x12,yTop, zTop,1),
        vec4(x11,yBot, z   ,1),
        vec4(x12,yBot, z   ,1),

        //back side above/below window vertices 16-19
        vec4(x11,yTop,-zTop,1),
        vec4(x12,yTop,-zTop,1),
        vec4(x11,yBot,-z   ,1),
        vec4(x12,yBot,-z   ,1),

        //right door cab side vertices front and back 20-23
        vec4(x2, yTop, zTop,1),
        vec4(x2, yBot, z   ,1),
        vec4(x2, yTop,-zTop,1),
        vec4(x2, yBot,-z   ,1),

    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],   // white
        [ 1.0, .65, 0.0, 1.0 ],  //orange
        [ 127/256, 176/256, 255/256, 1.0 ]  // cab blue

    ];

    var door = new Object();
    door.vertices = [];
    door.colors = [];
    door.isClosed = true;
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        door.vertices.push(vertices[indices[i]]);
        totpoints.push( vertices[indices[i]] );
        if(a==4||a==8){
            door.colors.push(vertexColors[0]);
            totcolors.push(vertexColors[0]);
        }
        else{
            door.colors.push(vertexColors[3])
            totcolors.push(vertexColors[3]);
        }
    }
    doors.push(door);
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

    //bottom of floor/train
    floor( 8, 9, 2, 0 );
    floor( 3, 1, 0, 2 );

    //top of floor
    floor( 6, 7, 5, 4 );
    floor(10,11, 6, 4 );

    //blue sides
    floor( 2, 6, 7, 3 );
    floor( 1, 5, 7, 3 );
    floor( 0, 4, 5, 1 );    

    //red sides
    floor( 4, 0, 8, 10);
    floor( 9,11,10, 8 );
    floor(11, 6, 2, 9 );

	//Build a Specific Side
    // side( 1, 0, 2, 3 ); //bottom
    
    // side(10,11, 7,15 ); //top back side
    // side(13, 3,11,10 ); //bottom back side
    side(2, 13,15, 6 ); //red side back

    // side( 3, 1, 9,11 ); //bottom rear
    // side(11, 9, 5, 7 ); //top rear
    // side( 6, 2, 0, 4 ); //front
    side( 4, 6, 7, 5 ); //top
    // side( 5,14, 8, 9 ); //top front side
    // side( 9, 8,12, 1 ); //bottom front side
    side( 0,12,14, 4 ); //cab front side

    var x1 = -8278.5;
    var x11= -7903;
    var x12= x11+729.05;
    var x2 = x12+466.59;

    // front side first part
    sidePart( 2,12,14,0 , x1, x11, x12, x2);
    sidePart(12,13, 5,4 , x1, x11, x12, x2);
    sidePart( 6, 7,15,14, x1, x11, x12, x2);
    sidePart(13,20,21,15, x1, x11, x12, x2);
    sidePart( 0,21,24,26, x1, x11, x12, x2); //blue stripe front
    //window far left front
    sidePart( 4, 5, 7, 6, x1, x11, x12, x2);

    // back side first part
    sidePart( 3,16,18, 1, x1, x11, x12, x2);
    sidePart(16,17, 9, 8, x1, x11, x12, x2);
    sidePart(10,11,19,18, x1, x11, x12, x2);
    sidePart(17,22,23,19, x1, x11, x12, x2);
    sidePart( 1,23,25,27, x1, x11, x12, x2); //blue stripe back
    //window far left back
    sidePart( 8, 9,11,10, x1, x11, x12, x2);



    // front side first part
    sidePartInterior( 2,12,14,0 , x1, x11, x12, x2);
    sidePartInterior(12,13, 5,4 , x1, x11, x12, x2);
    sidePartInterior( 6, 7,15,14, x1, x11, x12, x2);
    sidePartInterior(13,20,21,15, x1, x11, x12, x2);
    //window far left front
    sidePartInterior( 4, 5, 7, 6, x1, x11, x12, x2);

    // back side first part
    sidePartInterior( 3,16,18, 1, x1, x11, x12, x2);
    sidePartInterior(16,17, 9, 8, x1, x11, x12, x2);
    sidePartInterior(10,11,19,18, x1, x11, x12, x2);
    sidePartInterior(17,22,23,19, x1, x11, x12, x2);
    //window far left back
    sidePartInterior( 8, 9,11,10, x1, x11, x12, x2);

    //First Passenger Door doorway left front and back
    sidePartInterior(24,20,21,25, x1, x11, x12, x2);
    sidePartInterior(26,22,23,27, x1, x11, x12, x2);

    
    //Passenger Cab Wall Cab Side
    sidePart( 3, 2,26,27, x1, x11, x12, x2);

    x1 = -8243.2;

    //Passenger-Cab Wall Passenger Side
    sidePart( 3, 2,26,27, x1, x11, x12, x2);


    //First Part Seat Sides
    seating(16,20,22,12,x1,x2);
    seating(14,18,16,12,x1,x2);
    //seating(2,6,4,0,x1,x2);
    //seating(4,8,10,0,x1,x2);

    //First Part Textured Seats
    seating(22,20,8,10,x1,x2);
    seating(20,16,4,8,x1,x2);
    seating(16,18,6,4,x1,x2);
    seating(18,14,2,6,x1,x2);


    //First Part Seat Sides
    seating(17,21,23,13,x1,x2);
    seating(15,19,17,13,x1,x2);
    //seating(3,7,5,1,x1,x2);
    //seating(5,9,11,1,x1,x2);

    //First Part Textured Seats
    seating(23,21,9,11,x1,x2);
    seating(21,17,5,9,x1,x2);
    seating(17,19,7,5,x1,x2);
    seating(19,15,3,7,x1,x2);

    //FIRST PART DONE WOO

    //SECOND PART--TO LAST PART
    
    for(var i = 0; i<4; i++){

        x1 = x2+1166.47;
        x11= x1+583.24;
        x12= x11+1846.92;
        x2 = x12+486.03;

        if(i==3){
            x12 = x11+1263.7;
            x2 = 9058;
        }

        // front side first part
        sidePart( 2,12,14,0 , x1, x11, x12, x2);
        sidePart(12,13, 5,4 , x1, x11, x12, x2);
        sidePart( 6, 7,15,14, x1, x11, x12, x2);
        sidePart(13,20,21,15, x1, x11, x12, x2);
        sidePart( 0,21,24,26, x1, x11, x12, x2); //blue stripe front
        //window far left front
        sidePart( 4, 5, 7, 6, x1, x11, x12, x2);

        // back side first part
        sidePart( 3,16,18, 1, x1, x11, x12, x2);
        sidePart(16,17, 9, 8, x1, x11, x12, x2);
        sidePart(10,11,19,18, x1, x11, x12, x2);
        sidePart(17,22,23,19, x1, x11, x12, x2);
        sidePart( 1,23,25,27, x1, x11, x12, x2); //blue stripe back
        //window far left back
        sidePart( 8, 9,11,10, x1, x11, x12, x2);

        // front side first part
        sidePartInterior( 2,12,14,0 , x1, x11, x12, x2);
        sidePartInterior(12,13, 5,4 , x1, x11, x12, x2);
        sidePartInterior( 6, 7,15,14, x1, x11, x12, x2);
        sidePartInterior(13,20,21,15, x1, x11, x12, x2);
        //window far left front
        sidePartInterior( 4, 5, 7, 6, x1, x11, x12, x2);

        // back side first part
        sidePartInterior( 3,16,18, 1, x1, x11, x12, x2);
        sidePartInterior(16,17, 9, 8, x1, x11, x12, x2);
        sidePartInterior(10,11,19,18, x1, x11, x12, x2);
        sidePartInterior(17,22,23,19, x1, x11, x12, x2);
        //window far left back
        sidePartInterior( 8, 9,11,10, x1, x11, x12, x2);

        //First Passenger Door doorway left front and back
        sidePartInterior(24,20,21,25, x1, x11, x12, x2);
        sidePartInterior(26,22,23,27, x1, x11, x12, x2);

        //Other Passenger Door doorway left front and back
        sidePartInterior(28,2,0,29, x1, x11, x12, x2);
        sidePartInterior(30,3,1,31, x1, x11, x12, x2);

        //First Part Seat Sides
        seating(16,20,22,12,x1,x2);
        seating(14,18,16,12,x1,x2);
        seating(2,6,4,0,x1,x2);
        seating(4,8,10,0,x1,x2);

        //First Part Textured Seats
        seating(22,20,8,10,x1,x2);
        seating(20,16,4,8,x1,x2);
        seating(16,18,6,4,x1,x2);
        seating(18,14,2,6,x1,x2);


        //First Part Seat Sides
        seating(17,21,23,13,x1,x2);
        seating(15,19,17,13,x1,x2);
        seating(3,7,5,1,x1,x2);
        seating(5,9,11,1,x1,x2);

        //First Part Textured Seats
        seating(23,21,9,11,x1,x2);
        seating(21,17,5,9,x1,x2);
        seating(17,19,7,5,x1,x2);
        seating(19,15,3,7,x1,x2);

    }
    var xF = -9312.5;
    // Front end of train in 1st iteration, back in second
    for(var i = 0; i<2; i++){
        if(i==0){
            end( 0, 2, 3, 1,xF);
            end( 4, 6, 7, 5,xF);
            // end( 1, 5,13, 9,xF);
        }
        else{
            end(32, 2, 3,34,xF);
            end(33, 6, 7,35,xF);
            end( 4,33,35, 5,xF);
            end( 0,32,34, 1,xF);
        }
        end( 8, 9,11,10,xF);
        end(12,13,15,14,xF);
        end(16,17,19,18,xF);
        end(20,21,23,22,xF);
        end(24,25,27,26,xF);
        end(28,29,31,30,xF);
        // windows
        end(29,21,23,31,xF);
        end(25,17,19,27,xF);
        xF = 9059.5;
    }
}

function end(a,b,c,d,xF){
    // var xF = -9312.5;           //x value at front of train (constant)

    var yTop = 1027;            //y value at top of train
    var yFloor = -977;          //y value at top of floor of train
    var yWdwT = yTop-138.21;    //y value at bottom of window level
    var yWdwB = yWdwT-967.45;   //y value at top of window level = -78.66

    var zB = 1147.2;            //z value at top of floor of train
    var zT = 1075.2;            //z value at top of train (below roof)
    var zD = 243.51;            //z value at Door edge left/right
    var zWdwI = 312.18;         //z value at inner side of front window
    var zWdwOT= zWdwI+632.02;
    var zWdwOB= zWdwOT+47.18;
    var zWdwT = zT+ 4.97;
    var zWdwB = zT+39.73;       //z value at edge farthest right/left of bottom window

    var yBlue = -557;
    var zBlue = 1132.11;

    var vertices = [
        //Bottom Right Front Rectangle
        vec4( xF, yFloor, zB   ,1),
        vec4( xF, yFloor, zD   ,1),
        vec4( xF, yWdwB , zWdwB,1),
        vec4( xF, yWdwB , zD   ,1),

        //Bottom Left Rectangle
        vec4( xF, yFloor,-zB   ,1),
        vec4( xF, yFloor,-zD   ,1),
        vec4( xF, yWdwB ,-zWdwB,1),
        vec4( xF, yWdwB ,-zD   ,1),

        //Top Right Front Rectangle 8-11
        vec4( xF, yTop  , zT   ,1),
        vec4( xF, yTop  , zD   ,1),
        vec4( xF, yWdwT , zWdwT,1),
        vec4( xF, yWdwT , zD   ,1),

        //Top Left Front Rectangle 12-15
        vec4( xF, yTop  ,-zT   ,1),
        vec4( xF, yTop  ,-zD   ,1),
        vec4( xF, yWdwT ,-zWdwT,1),
        vec4( xF, yWdwT ,-zD   ,1),

        //Door-Window Right Rectangle 16-19
        vec4( xF, yWdwT , zD   ,1),
        vec4( xF, yWdwT , zWdwI,1),
        vec4( xF, yWdwB , zD   ,1),
        vec4( xF, yWdwB , zWdwI,1),

        //Door-Window Left Rectangle 20-23
        vec4( xF, yWdwT ,-zD   ,1),
        vec4( xF, yWdwT ,-zWdwI,1),
        vec4( xF, yWdwB ,-zD   ,1),
        vec4( xF, yWdwB ,-zWdwI,1),

        //Window-Side Right Rectangle 24-27
        vec4( xF, yWdwT , zWdwT ,1),
        vec4( xF, yWdwT , zWdwOT,1),
        vec4( xF, yWdwB , zWdwB ,1),
        vec4( xF, yWdwB , zWdwOB,1),

        //Window-Side Left Rectangle 28-31
        vec4( xF, yWdwT ,-zWdwT ,1),
        vec4( xF, yWdwT ,-zWdwOT,1),
        vec4( xF, yWdwB ,-zWdwB ,1),
        vec4( xF, yWdwB ,-zWdwOB,1),

        //Blue Stripe for Back 32-35
        vec4( xF, yBlue , zBlue ,1),
        vec4( xF, yBlue ,-zBlue ,1),
        vec4( xF, yBlue , zD    ,1),
        vec4( xF, yBlue ,-zD    ,1)
    ];
    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],   // white
        [ 1.0, .65, 0.0, 1.0 ],  //orange
        [240/256,240/256,240/256, 1.0 ]  // doorway

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
        if(a==29||a==25){
            side.colors.push(vertexColors[0]);
            totcolors.push(vertexColors[0]);
        }
        else{
            if(xF>0){ //if back
                if(a>4){
                    side.colors.push(vertexColors[5])
                    totcolors.push(vertexColors[5]);
                }
                else{
                    side.colors.push(vertexColors[1])
                    totcolors.push(vertexColors[1]);
                }
            }
            else{    //if front
                side.colors.push(vertexColors[3])
                totcolors.push(vertexColors[3]);
            }
        }
    }
    sides.push(side);
}

function seating(a, b, c, d, xfIL, xfIR)
{
    var zfI = 1000;
    var zfS = 950;
    var zfsE = 487.95;
    // var xfIL = -8278.48;
    // var xfIR = -6598.5;
    //define vertices for all 27 .32x.32x.32 cubes in one single vertices definition, with .02 spacing
    var vertices = [
        //area between cab door and first door D78 DM train:
        //cab door cutout Interior vertices 0-3
        vec4(xfIL,-977   , zfI,1),
        vec4(xfIL,-977   ,-zfI,1),
        vec4(xfIL,-115.28, zfI,1),
        vec4(xfIL,-115.28,-zfI,1),

        //cab door cutout seatback vertices 4-7
        vec4(xfIL,-503.92, zfS,1),
        vec4(xfIL,-503.92,-zfS,1), //butt of seat level
        vec4(xfIL,-115.28, zfS,1), //top of seat
        vec4(xfIL,-115.28,-zfS,1),

        //cab door cutout seatfront vertices 8-11
        vec4(xfIL,-503.92, zfsE,1),
        vec4(xfIL,-503.92,-zfsE,1), //butt of seat level
        vec4(xfIL,-977   , zfsE,1), //bottom of seat
        vec4(xfIL,-977   ,-zfsE,1),

        //First Passenger door cab side vertices front and back interior 12-15
        vec4(xfIR,-977   , zfI,1),
        vec4(xfIR,-977   ,-zfI,1),
        vec4(xfIR,-115.28, zfI,1),
        vec4(xfIR,-115.28,-zfI,1),

        //First Passenger door cab side vertices front and back interior 16-19
        vec4(xfIR,-503.92, zfS,1),
        vec4(xfIR,-503.92,-zfS,1),
        vec4(xfIR,-115.28, zfS,1),
        vec4(xfIR,-115.28,-zfS,1),

        // First Passenger door cab side vertices front and back seat front 20-23
        vec4(xfIR,-503.92, zfsE,1),
        vec4(xfIR,-503.92,-zfsE,1),
        vec4(xfIR,-977   , zfsE,1),
        vec4(xfIR,-977   ,-zfsE,1)

    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],   // white
        [ 1.0, .65, 0.0, 1.0 ],  //orange
        [240/256,240/256,240/256, 1.0 ]  // doorway

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
        if(d==12||d==13||d==0||d==1){
            side.colors.push(vertexColors[0]);
            totcolors.push(vertexColors[0]);
        }
        else{
            side.colors.push(vertexColors[6])
            totcolors.push(vertexColors[6]);
        }
    }
    sides.push(side);
}


function sidePartInterior(a, b, c, d, x1, x11, x12, x2)
{    
    // var x1 = -8278.5;
    // var x11= -7590.12;
    // var x12= -7016;
    // var x2 = -6598.5;
    var zfI = 1000;
    //define vertices for all 27 .32x.32x.32 cubes in one single vertices definition, with .02 spacing
    var vertices = [
        //area between cab door and first door D78 DM train:
        //cab door cutout vertices 0-3
        vec4(x1,-977, zfI,1),
        vec4(x1,-977,-zfI,1),
        vec4(x1, 1027, zfI,1),
        vec4(x1, 1027,-zfI,1),

        //front side window vertices 4-7
        vec4(x11,855.83, zfI,1),
        vec4(x12,   855.83, zfI,1),
        vec4(x11,  0,    zfI,1),
        vec4(x12,     0,    zfI,1),

        // back side window vertices 8-11
        vec4(x11,855.83,-zfI,1),
        vec4(x12,   855.83,-zfI,1),
        vec4(x11,  0   ,-zfI,1),
        vec4(x12,     0   ,-zfI,1),

        //front side above/below window vertices 12-15
        vec4(x11,1027, zfI,1),
        vec4(x12,   1027, zfI,1),
        vec4(x11,-977, zfI,1),
        vec4(x12,   -977, zfI,1),

        //back side above/below window vertices 16-19
        vec4(x11,1027,-zfI,1),
        vec4(x12,   1027,-zfI,1),
        vec4(x11,-977,-zfI,1),
        vec4(x12,   -977,-zfI,1),

        //First Passenger door cab side vertices front and back interior 20-23
        vec4(x2,1027, zfI,1),
        vec4(x2,-977, zfI,1),
        vec4(x2,1027,-zfI,1),
        vec4(x2,-977,-zfI,1),

        //First Passenger door cab side vertices front and back 24-27
        vec4(x2,1027, 1075.2,1),
        vec4(x2,-977, 1147.2,1),
        vec4(x2,1027,-1075.2,1),
        vec4(x2,-977,-1147.2,1),

        //Other Passenger door cab side vertices front and back 28-31
        vec4(x1,1027, 1075.2,1),
        vec4(x1,-977, 1147.2,1),
        vec4(x1,1027,-1075.2,1),
        vec4(x1,-977,-1147.2,1)
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],   // white
        [ 1.0, .65, 0.0, 1.0 ],  //orange
        [240/256,240/256,240/256, 1.0 ]  // doorway

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
        if(a==4||a==8){
            side.colors.push(vertexColors[0]);
            totcolors.push(vertexColors[0]);
        }
        else if(a==24||a==26||a==28||a==30){
            side.colors.push(vertexColors[7]);
            totcolors.push(vertexColors[7]);
        }
        else{
            side.colors.push(vertexColors[5]);
            totcolors.push(vertexColors[5]);
        }
    }
    sides.push(side);
}

function sidePart(a, b, c, d, x1, x11, x12, x2)
{
    //define vertices for all 27 .32x.32x.32 cubes in one single vertices definition, with .02 spacing
    var vertices = [
        //area between cab door and first door D78 DM train:
        //cab door cutout vertices 0-3
        vec4(x1,-557, 1132.11,1),
        vec4(x1,-557,-1132.11,1),
        vec4(x1, 1027, 1075.2,1),
        vec4(x1, 1027,-1075.2,1),

        //front side window vertices 4-7
        vec4(x11,855.83, 1081.35,1),
        vec4(x12,   855.83, 1081.35,1),
        vec4(x11,  0,    1112.1,1),
        vec4(x12,     0,    1112.1,1),

        // back side window vertices 8-11
        vec4(x11,855.83,-1081.35,1),
        vec4(x12,   855.83,-1081.35,1),
        vec4(x11,  0   ,-1112.1,1),
        vec4(x12,     0   ,-1112.1,1),

        //front side above/below window vertices 12-15
        vec4(x11,1027, 1075.2,1),
        vec4(x12,   1027, 1075.2,1),
        vec4(x11,-557, 1132.11,1),
        vec4(x12,   -557, 1132.11,1),

        //back side above/below window vertices 16-19
        vec4(x11,1027,-1075.2,1),
        vec4(x12,   1027,-1075.2,1),
        vec4(x11,-557,-1132.11,1),
        vec4(x12,   -557,-1132.11,1),

        //First Passenger door cab side vertices front and back 20-23
        vec4(x2,1027, 1075.2,1),
        vec4(x2,-557, 1132.11,1),
        vec4(x2,1027,-1075.2,1),
        vec4(x2,-557,-1132.11,1),

        //blue stripe vertices 24-27
        vec4(x2,-977, 1147.2,1),
        vec4(x2,-977,-1147.2,1),
        vec4(x1,-977, 1147.2,1),
        vec4(x1,-977,-1147.2,1)

    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],   // white
        [ 1.0, .65, 0.0, 1.0 ],  //orange
        [ 127/256, 176/256, 255/256, 1.0 ]  // cab blue

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
        if(a==4||a==8){
            side.colors.push(vertexColors[0]);
            totcolors.push(vertexColors[0]);
        }
        else if(a==0||a==1){
            side.colors.push(vertexColors[1]);
            totcolors.push(vertexColors[1]);
        }
        else if(b==2&&x1==-8278.5){
            side.colors.push(vertexColors[7]);
            totcolors.push(vertexColors[7]);
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
    var xred = -8875.1;
    //define vertices for all 27 .32x.32x.32 cubes in one single vertices definition, with .02 spacing
    var vertices = [
        //corners of the D78 DM train:
        //Bottom corners 0-3
        vec4(-9312.5,-977, 1147.2,1),
        vec4( 9059.5,-977, 1147.2,1),
        vec4(-9312.5,-977,-1147.2,1),
        vec4( 9059.5,-977,-1147.2,1),
        //Top corners   4-7
        vec4(-9312.5, 1027, 1075.2,1),
        vec4( 9059.5, 1027, 1075.2,1),
        vec4(-9312.5, 1027,-1075.2,1),
        vec4( 9059.5, 1027,-1075.2,1),
        //blue stripe vertices   8-11
        vec4( xred,-557, 1132.11,1),
        vec4( 9059.5,-557, 1132.11,1),
        vec4( xred,-557,-1132.11,1),
        vec4( 9059.5,-557,-1132.11,1),
        //Red face side vertices 12-15
        vec4( xred,-977, 1147.2,1),
        vec4( xred,-977,-1147.2,1),
        vec4( xred, 1027, 1075.2,1),
        vec4( xred, 1027,-1075.2,1),
        //cab door cutout vertices 16-19
        vec4(-8278.5,-977, 1147.2,1),
        vec4(-8278.5,-977,-1147.2,1),
        vec4(-8278.5, 1027, 1075.2,1),
        vec4(-8278.5, 1027,-1075.2,1)

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
        vec4( 9059.5, -977,-1147.2,1),

        //Bottom corners front
        vec4(-9312.5,-1027, 1149  ,1),
        vec4(-9312.5,-1027,-1149  ,1),
        //Top corners front
        vec4(-9312.5, -977, 1147.2,1),
        vec4(-9312.5, -977,-1147.2,1)
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
        if(a==4||a==9||a==11){
            side.colors.push(vertexColors[3]);
            totcolors.push(vertexColors[3]);
        }
        else if(a==6||a==10){
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
//test line below delete later
        // ytop = 3000; bottom = -3000; left = -3000; right = 3000; near = -3000; far = 20000;

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
    gl.drawArrays( gl.TRIANGLES, start, doors.length*doors[0].vertices.length);
    start = start + doors.length*doors[0].vertices.length;


    gl.drawArrays( gl.TRIANGLES, start, numSideVertices);
    start = start + numSideVertices;

    for(var i = 0; i<bogies.length; i++){
        gl.drawArrays( gl.TRIANGLES, start, bogies[i].vertices.length);
        start = start + bogies[i].vertices.length;
    }
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