//Eric Mendoza-Conner
//All vertices are based on actual cm measurements in millimeters

var NumVertices = 0;
var aspect = 9515;
var eye = vec3(0,0,10000);		var at = vec3(0,0,1027);     	var up = vec3(0,1,0);
// var ytop = aspect; 	var bottom = -1*aspect; 	var left = -1*aspect; var right = aspect;
var near = -2000;	var far = 40000;

var totpoints=[];	var points = [];				//Array of Vertices
var totcolors=[];   var colors = [];
var textures = [];  var texSize = 64;
var theta = 0;
var wheels = [];	var bogies = []; var sides = []; var doors = [];
var rotating = 0;
var program;
var mvMatrixLoc;	
var pMatrixLoc;
var rMatrixLoc;
var rMatrix;
var tMatrixLoc;
var trainMtxLoc;
var trainMtx;
var left = false;
var circlePts = [];
var numvertices = 0;

//For button disabling
var leftPressed = false;
var rightPressed = false;

var mvMatrix;	//Model-view Matrix
var pMatrix;	//Projection Matrix
var numSideVertices;
var doorIsClosing = false;
var pos = 0; //for door position translating
var mainDoorsSize = 88; //for main doors that open
var offset = 0; var totoffset = 0;
var zoomedIn = 0;
var click = false;
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0),
    vec2(0,0.0001),
    vec2(0.0001,0.0001),
    vec2(0.0001,0)
];

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

	// Buld the Skeleton for the outside of train
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

    for(var i = 0; i<4; i++)
        buildPole(i);

    trainMtx = translate(0,0,0);
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

    initTextures();

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(textures), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

	//Rotation Matrix
    trainMtxLoc = gl.getUniformLocation (program, "trainMtx");
	rMatrixLoc = gl.getUniformLocation (program, "rMatrix");
    rMatrix = mult(rotate(-1,1.0,0.0,0.0),rotate(-4,0.0,1.0,0.0));
    tMatrixLoc = gl.getUniformLocation (program, "tMatrix");

	//Model View and Projection Matrices
	mvMatrixLoc= gl.getUniformLocation (program, "mvMatrix");
	pMatrixLoc = gl.getUniformLocation (program, "pMatrix" );

    document.getElementById( "xButton" ).onclick = function () {
        rotateHoriz();
    };

    document.getElementById( "doors"   ).onclick = function () {
        if(doors[0].isClosed){
            for(var i = 0; i<mainDoorsSize; i++){
                doors[i].isClosed = false;
            }
            document.getElementById("doors").innerHTML = "Close Doors";
        }
        else{
            doorIsClosing = true;
            document.getElementById("doors").innerHTML = "Open Doors";
        }
    }

    document.getElementById("MoveInRight").onclick = function() {
        if(!rightPressed&&!leftPressed){
            rightPressed=true;
            if(totoffset==0){
                eye = vec3(0,0,6500);
                at = vec3(0,0,6000);
                rMatrix = mult(rMatrix,mult(rotate(-2,0.0,0.0,1.0),rotate(-1.0,0.0,1.0,0.0)));
                aspect = 2000;
            }
            if(totoffset<=7000){
                offset += 500;
                totoffset += 500;
            }
        }
    }
    document.getElementById("MoveInLeft").onclick = function() {
        if(!leftPressed&&!rightPressed){
            leftPressed = true;
            left = true;
            if(totoffset==0){
                eye = vec3(0,0,6500);
                at = vec3(0,0,6000);
                rMatrix = mult(rMatrix,mult(rotate(-2,0.0,0.0,1.0),rotate( 9.0,0.0,1.0,0.0)));
                aspect = 2000;
            }
            if(totoffset<=7000){
                offset += 500;
                totoffset += 500;
            }
        }        
    }
    document.getElementById("MoveOut").onclick = function() {
        if(totoffset==500){
            eye = vec3(0,0,10000);
            at = vec3(0,0,1027);
            aspect = 2000;
            if(left){
                rMatrix = mult(rMatrix,mult(rotate(-9.0,0.0,1.0,0.0),rotate( 2,0.0,0.0,1.0)));
                left = false; leftPressed = false;
            }
            else{
                rMatrix = mult(rMatrix,mult(rotate( 1.0,0.0,1.0,0.0),rotate( 2,0.0,0.0,1.0)));
                rightPressed = false;
            }
        }
        if(totoffset>=500){
            offset -= 500;
            totoffset -=500;
        }
        
    }
    document.getElementById("Zoom").onclick = function() {
        if(zoomedIn){
            // eye = vec3(0,0,10000);
            // at = vec3(0,0,1027);
            aspect = aspect*5;
            zoomedIn = false;
        }
        else{
            // eye = vec3(0,0,500);
            // at = vec3(0,0,0);
            aspect = aspect/5;
            zoomedIn = true;
        }

    }
    document.getElementById("Click").onclick = function() {
        click = !click;
        if(click){
            document.getElementById("Click").innerHTML = "Disable Continuous Rotating";
        }
        else{
            document.getElementById("Click").innerHTML = "Allow Continuous Rotating";
        }

    }

	render();
}

function initTextures() {
    roundelTexture = gl.createTexture();
    roundelImage = new Image();
    roundelImage.onload = function() { handleTextureLoaded(roundelImage,roundelTexture); }
    roundelImage.src = 'tubelogo.png';
}

function handleTextureLoaded(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.uniformli(gl.getUniformLocation(program, "texture"), 0);
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

        // front side
        door( 2,12,14,0 , x1, x11, x12, x2,z-30);
        door(12,13, 5,4 , x1, x11, x12, x2,z-30);
        door( 6, 7,15,14, x1, x11, x12, x2,z-30);
        door(13,20,21,15, x1, x11, x12, x2,z-30);
        // //window front
        door( 4, 5, 7, 6, x1, x11, x12, x2,z-30);

        // // back side
        door( 3,16,18, 1, x1, x11, x12, x2,z-30);
        door(16,17, 9, 8, x1, x11, x12, x2,z-30);
        door(10,11,19,18, x1, x11, x12, x2,z-30);
        door(17,22,23,19, x1, x11, x12, x2,z-30);
        // //window back
        door( 8, 9,11,10, x1, x11, x12, x2,z-30);

        //connection
        door( 25, 0, 2,24,x1, x11, x12, x2,z);
        door( 26,27, 1, 3,x1, x11, x12, x2,z);
        x1 = x2+2916.19;
        x11= x1+200;
        x12= x11+767.36;
        x2 = x12+200;
    }


    endDoor(0,2,3,1,-9312.5,3); //3 = red
    endDoor(1,3,7,5,-9312.5,3); //3 = red
    endDoor(5,7,6,4,-9312.5,3); //3 = red
    endDoor(4,6,2,0,-9312.5,3); //3 = red
    // window
    endDoor(2,3,7,6,-9312.5,3); //3 = red


    endDoor(0,2,3,1, 9059.5,5); //5 = white
    endDoor(8,3,7,9, 9059.5,5); //5 = white
    endDoor(1,8,9,5, 9059.5,5); //blue stripe
    endDoor(5,7,6,4, 9059.5,5); //5 = white
    endDoor(4,6,2,0, 9059.5,5); //5 = white
    // window
    endDoor(2,3,7,6, 9059.5,5); //5 = white
    
    var z = 1140;
    x1 = -8875.1;
    x11 =-8675.1;
    x12 =-8078.5;
    x2 = -8278.5;

    // front side
    cabDoor( 2, 4, 5,12, x1, x11, x12, x2,z);
    cabDoor(12, 5, 7,18, x1, x11, x12, x2,z);
    cabDoor(18, 7, 6,16, x1, x11, x12, x2,z);
    cabDoor(16, 6, 4, 2, x1, x11, x12, x2,z);
    // blue stripe
    cabDoor( 0,16,18,13, x1, x11, x12, x2,z);
    // window front
    cabDoor( 4, 5, 7, 6, x1, x11, x12, x2,z);

    // back side
    cabDoor( 3, 8, 9,14, x1, x11, x12, x2,z);
    cabDoor(14, 9,11,19, x1, x11, x12, x2,z);
    cabDoor(19,11,10,17, x1, x11, x12, x2,z);
    cabDoor(17,10, 8, 3, x1, x11, x12, x2,z);
    // blue stripe
    cabDoor(1,17,19,15, x1, x11, x12, x2,z);
    // window back
    cabDoor( 8, 9,11,10, x1, x11, x12, x2,z);
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

        //right door cab side vertices front and back 24-27
        vec4(x1, yTop, zTop-30,1),
        vec4(x1, yBot, z   -30,1),
        vec4(x1, yTop,-zTop+30,1),
        vec4(x1, yBot,-z   +30,1)

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
    door.offset = JSON.parse(JSON.stringify(totpoints.length));
    door.tMatrix = rotate(0.0,0.0,0.0,1.0);
    door.isClosed = true;
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        door.vertices.push(vertices[indices[i]]);
        totpoints.push( vertices[indices[i]] );
        switch(indices[i]){
            case a : textures.push(texCoord[0]); break;
            case b : textures.push(texCoord[4]); break;
            case c : textures.push(texCoord[5]); break;
            case d : textures.push(texCoord[6]); break;
            default:break;
        }
        if(a==4||a==8||a==25||a==26){
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

function cabDoor( a, b, c, d, x1,x11,x12, x2, z){
    //z value specified is outermost z at bottom of door
    var yTop = 1027;
    var yWTop = yTop-171.17;
    var yWBot = 0;
    var yBot = -977;
    var zTop = z-72;
    var zWTop = zTop+6.15;
    var zWBot = zWTop+30.75;
    var yBlue = -557;
    var zBlue = 1132.11;
    //define vertices for all 27 .32x.32x.32 cubes in one single vertices definition, with .02 spacing
    var vertices = [
        //area between cab door and first door D78 DM train:
        //left door cutout vertices 0-3
        vec4(x1, yBot, z   ,1),
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

        //right door cab side vertices front and back 12-15
        vec4(x2, yTop, zTop,1),
        vec4(x2, yBot, z   ,1),
        vec4(x2, yTop,-zTop,1),
        vec4(x2, yBot,-z   ,1),

        //Blue Stripe for Back 16-19
        vec4( x1, yBlue , zBlue ,1),
        vec4( x1, yBlue ,-zBlue ,1),
        vec4( x2, yBlue , zBlue ,1),
        vec4( x2, yBlue ,-zBlue ,1)

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
    door.tMatrix = rotate(0.0,0.0,0.0,1.0);
    door.isClosed = true;
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        door.vertices.push(vertices[indices[i]]);
        totpoints.push( vertices[indices[i]] );
        switch(indices[i]){
            case a : textures.push(texCoord[0]); break;
            case b : textures.push(texCoord[4]); break;
            case c : textures.push(texCoord[5]); break;
            case d : textures.push(texCoord[6]); break;
            default:break;
        }
        if(a==4||a==8){
            door.colors.push(vertexColors[0]);
            totcolors.push(vertexColors[0]);
        }
        else if(a==0||a==1){
            door.colors.push(vertexColors[1]);
            totcolors.push(vertexColors[1]);
        }

        else{
            door.colors.push(vertexColors[5])
            totcolors.push(vertexColors[5]);
        }
    }
    doors.push(door);
}

function endDoor( a, b, c, d, x, color){
    var yTop = 1027;
    var yWTop = yTop-171.17;
    var yWBot = 0;
    var yBot = -977;
    var zD = 243.51;
    var zW = 210;
    var yBlue = -557;
    var vertices = [
        //area between cab door and first door D78 DM train:
        //left door rectangle
        vec4(x, yTop , zD,1),
        vec4(x, yBot , zD,1),
        vec4(x, yWTop, zW,1),
        vec4(x, yWBot, zW,1),

        //right door rectangle 4-7
        vec4(x, yTop ,-zD,1),
        vec4(x, yBot ,-zD,1),
        vec4(x, yWTop,-zW,1),
        vec4(x, yWBot,-zW,1),

        //blue stripe vertices
        vec4(x, yBlue , zD ,1),
        vec4(x, yBlue ,-zD ,1)


    ];
    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],   // white
        [ 1.0, .65, 0.0, 1.0 ],  //orange

    ];

    var door = new Object();
    door.vertices = [];
    door.colors   = [];
    door.isClosed = true;
    door.tMatrix = rotate(0.0,0.0,0.0,1.0);
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        door.vertices.push(vertices[indices[i]]);
        totpoints.push( vertices[indices[i]] );
        switch(indices[i]){
            case a : textures.push(texCoord[0]); break;
            case b : textures.push(texCoord[4]); break;
            case c : textures.push(texCoord[5]); break;
            case d : textures.push(texCoord[6]); break;
            default:break;
        }
        if(a==2){
            door.colors.push(vertexColors[0]);
            totcolors.push(vertexColors[0]);
        }
        else if(a==1&&x>0){
            door.colors.push(vertexColors[1]);
            totcolors.push(vertexColors[1]);
        }
        else{
            door.colors.push(vertexColors[color])
            totcolors.push(vertexColors[color]);
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
    seating(14,18,16,12,x1,x2);
    seating(16,20,22,30,x1,x2);
    seating(30,34,12,16,x1,x2);

    //First Part Textured Seats
    seating(22,20,8,10,x1,x2);
    seating(20,16,4,8,x1,x2);
    seating(16,18,6,4,x1,x2);
    seating(18,14,2,6,x1,x2);
    //Underside Part
    seating(28,30,34,32,x1,x2);


    //First Part Seat Sides
    seating(15,19,17,13,x1,x2);
    seating(17,21,23,31,x1,x2);
    seating(31,35,13,17,x1,x2);
    
    //First Part Textured Seats
    seating(23,21, 9,11,x1,x2);
    seating(21,17,5,9,x1,x2);
    seating(17,19,7,5,x1,x2);
    seating(19,15,3,7,x1,x2);
    //Underside Part
    seating(29,31,35,33,x1,x2);

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
        if(i!=1)
            sidePart( 6, 7,15,14, x1, x11, x12, x2);
        else{
            sidePart( 6,28,29, 7,x1,x11,x12,x2);
            sidePart( 7,29,30,15,x1,x11,x12,x2);
            sidePart(15,30,31,14,x1,x11,x12,x2);
            sidePart(14,31,28, 6,x1,x11,x12,x2);
            //tube logo
            sidePart(28,29,30,31,x1,x11,x12,x2);
        }
        sidePart(13,20,21,15, x1, x11, x12, x2);
        sidePart( 0,21,24,26, x1, x11, x12, x2); //blue stripe front
        //window far left front
        sidePart( 4, 5, 7, 6, x1, x11, x12, x2);

        // back side first part
        sidePart( 3,16,18, 1, x1, x11, x12, x2);
        sidePart(16,17, 9, 8, x1, x11, x12, x2);
        if(i!=1)
            sidePart(10,11,19,18, x1, x11, x12, x2);
        else{
            sidePart(10,32,33,11,x1,x11,x12,x2);
            sidePart(11,33,34,19,x1,x11,x12,x2);
            sidePart(19,34,35,18,x1,x11,x12,x2);
            sidePart(18,35,32,10,x1,x11,x12,x2);
            //tube logo
            sidePart(32,33,34,35,x1,x11,x12,x2);
        }
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
        seating(14,18,16,12,x1,x2);
        seating(2,6,4,0,x1,x2);
        //\/ Test
        seating(16,20,22,30,x1,x2);
        seating(30,34,12,16,x1,x2);        
        seating(4,8,10,28,x1,x2);
        seating(28,32,0,4,x1,x2);

        //Underside Part
        seating(28,30,34,32,x1,x2);

        //First Part Textured Seats
        seating(22,20,8,10,x1,x2);

        seating(20,16,4,8,x1,x2);
        seating(16,18,6,4,x1,x2);
        seating(18,14,2,6,x1,x2);


        //First Part Seat Sides
        seating(15,19,17,13,x1,x2);
        seating(3,7,5,1,x1,x2);
        //\/Test
        seating(17,21,23,31,x1,x2);
        seating(31,35,13,17,x1,x2);
        seating(5,9,11,29,x1,x2);
        seating(29,33,1,5,x1,x2);

        //First Part Textured Seats
        seating(23,21, 9,11,x1,x2);

        seating(21,17,5,9,x1,x2);
        seating(17,19,7,5,x1,x2);
        seating(19,15,3,7,x1,x2);
        //Underside Part
        seating(29,31,35,33,x1,x2);

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
        switch(indices[i]){
            case a : textures.push(texCoord[0]); break;
            case b : textures.push(texCoord[4]); break;
            case c : textures.push(texCoord[5]); break;
            case d : textures.push(texCoord[6]); break;
            default:break;
        }
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
    var zfsE = 587.95;
    var yCushB = -700;
    // var xfIL = -8278.48;
    // var xfIR = -6598.5;
    //define vertices for all 27 .32x.32x.32 cubes in one single vertices definition, with .02 spacing
    var vertices = [
        //area between cab door and first door D78 DM train:
        //cab door cutout Interior vertices 0-3
        vec4(xfIL, -977  , zfI,1),
        vec4(xfIL, -977  ,-zfI,1),
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
        vec4(xfIL, yCushB, zfsE,1), //bottom of seat
        vec4(xfIL, yCushB,-zfsE,1),

        //First Passenger door cab side vertices front and back interior 12-15
        vec4(xfIR, -977  , zfI,1),
        vec4(xfIR, -977  ,-zfI,1),
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
        vec4(xfIR, yCushB, zfsE,1),
        vec4(xfIR, yCushB,-zfsE,1),

        // Seat Cushions 24-27
        vec4(xfIL,yCushB , zfsE,1),
        vec4(xfIL,yCushB ,-zfsE,1),
        vec4(xfIR,yCushB , zfsE,1),
        vec4(xfIR,yCushB ,-zfsE,1),

        // Seat Stand 28-31
        vec4(xfIL,yCushB , (zfsE+200),1),
        vec4(xfIL,yCushB ,-(zfsE+200),1),
        vec4(xfIR,yCushB , (zfsE+200),1),
        vec4(xfIR,yCushB ,-(zfsE+200),1),

        // Seat Underside 32-35
        vec4(xfIL,-977   , (zfsE+200),1),
        vec4(xfIL,-977   ,-(zfsE+200),1),
        vec4(xfIR,-977   , (zfsE+200),1),
        vec4(xfIR,-977   ,-(zfsE+200),1)

    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],   // white
        [ 1.0, .65, 0.0, 1.0 ],  //orange
        [150/256,150/256,150/256, 1.0 ]  // doorway

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
        switch(indices[i]){
            case a : textures.push(texCoord[0]); break;
            case b : textures.push(texCoord[4]); break;
            case c : textures.push(texCoord[5]); break;
            case d : textures.push(texCoord[6]); break;
            default:break;
        }
        if(a==22||a==20||a==18||a==23||a==21||a==19||c==6||c==7){
            side.colors.push(vertexColors[6]);
            totcolors.push(vertexColors[6]);
        }
        else if(b==31||b==30){
            side.colors.push(vertexColors[0]);
            totcolors.push(vertexColors[0]);
        }
        else{
            side.colors.push(vertexColors[7]);
            totcolors.push(vertexColors[7]);
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
        switch(indices[i]){
            case a : textures.push(texCoord[0]); break;
            case b : textures.push(texCoord[4]); break;
            case c : textures.push(texCoord[5]); break;
            case d : textures.push(texCoord[6]); break;
            default:break;
        }
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

    var height = 499.6;
    var width  = 1000;
    var x111 = (846.92/2)+300 + x11;
    var x112 = x12-(846.92/2)-300;
    var y1 = -78.75;
    var y2 = -478.25;
    var offset = 2.83;
    var z1 = -2.83+1112.1;
    var z2 = 1132.11-2.83; 
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
        vec4(x12,855.83, 1081.35,1),
        vec4(x11,  0,    1112.1,1),
        vec4(x12,  0,    1112.1,1),

        // back side window vertices 8-11
        vec4(x11,855.83,-1081.35,1),
        vec4(x12,855.83,-1081.35,1),
        vec4(x11,  0   ,-1112.1,1),
        vec4(x12,  0   ,-1112.1,1),

        //front side above/below window vertices 12-15
        vec4(x11,1027, 1075.2,1),
        vec4(x12,1027, 1075.2,1),
        vec4(x11,-557, 1132.11,1),
        vec4(x12,-557, 1132.11,1),

        //back side above/below window vertices 16-19
        vec4(x11,1027,-1075.2,1),
        vec4(x12,1027,-1075.2,1),
        vec4(x11,-557,-1132.11,1),
        vec4(x12,-557,-1132.11,1),

        //First Passenger door cab side vertices front and back 20-23
        vec4(x2,1027, 1075.2,1),
        vec4(x2,-557, 1132.11,1),
        vec4(x2,1027,-1075.2,1),
        vec4(x2,-557,-1132.11,1),

        //blue stripe vertices 24-27
        vec4(x2,-977, 1147.2,1),
        vec4(x2,-977,-1147.2,1),
        vec4(x1,-977, 1147.2,1),
        vec4(x1,-977,-1147.2,1),

        //tubelogo vertices 28-31
        vec4(x111, y1, z1 ,1),
        vec4(x112, y1, z1 ,1),
        vec4(x112, y2, z2 ,1),
        vec4(x111, y2, z2, 1),

        //tubelogo vertices 32-35
        vec4(x111, y1, -z1 ,1),
        vec4(x112, y1, -z1 ,1),
        vec4(x112, y2, -z2 ,1),
        vec4(x111, y2, -z2, 1)

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
            switch(indices[i]){
                case a : textures.push(texCoord[0]); break;
                case b : textures.push(texCoord[4]); break;
                case c : textures.push(texCoord[5]); break;
                case d : textures.push(texCoord[6]); break;
                default:break;
            }
            side.colors.push(vertexColors[0]);
            totcolors.push(vertexColors[0]);
        }
        else if(a==0||a==1){
            switch(indices[i]){
                case a : textures.push(texCoord[0]); break;
                case b : textures.push(texCoord[4]); break;
                case c : textures.push(texCoord[5]); break;
                case d : textures.push(texCoord[6]); break;
                default:break;
            }
            side.colors.push(vertexColors[1]);
            totcolors.push(vertexColors[1]);
        }
        else if(b==2&&x1==-8278.5){
            switch(indices[i]){
                case a : textures.push(texCoord[0]); break;
                case b : textures.push(texCoord[4]); break;
                case c : textures.push(texCoord[5]); break;
                case d : textures.push(texCoord[6]); break;
                default:break;
            }
            side.colors.push(vertexColors[7]);
            totcolors.push(vertexColors[7]);
        }
        else{
            if(a==28){
                switch(indices[i]){
                    case a : textures.push(texCoord[1]); break;
                    case b : textures.push(texCoord[0]); break;
                    case c : textures.push(texCoord[3]); break;
                    case d : textures.push(texCoord[2]); break;
                }
            }
            else if(a==32){
                switch(indices[i]){
                    case a : textures.push(texCoord[0]); break;
                    case b : textures.push(texCoord[1]); break;
                    case c : textures.push(texCoord[2]); break;
                    case d : textures.push(texCoord[3]); break;
                }
            }
            else{
                switch(indices[i]){
                    case a : textures.push(texCoord[0]); break;
                    case b : textures.push(texCoord[4]); break;
                    case c : textures.push(texCoord[5]); break;
                    case d : textures.push(texCoord[6]); break;
                    default:break;
                }
            }
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
        switch(indices[i]){
            case a : textures.push(texCoord[0]); break;
            case b : textures.push(texCoord[4]); break;
            case c : textures.push(texCoord[5]); break;
            case d : textures.push(texCoord[6]); break;
            default:break;
        }
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
        switch(indices[i]){
            case a : textures.push(texCoord[0]); break;
            case b : textures.push(texCoord[4]); break;
            case c : textures.push(texCoord[5]); break;
            case d : textures.push(texCoord[6]); break;
            default:break;
        }
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
        switch(indices[i]){
            case a : textures.push(texCoord[0]); break;
            case b : textures.push(texCoord[4]); break;
            case c : textures.push(texCoord[5]); break;
            case d : textures.push(texCoord[6]); break;
            default:break;
        }
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
        switch(indices[i]){
            case a : textures.push(texCoord[0]); break;
            case b : textures.push(texCoord[4]); break;
            case c : textures.push(texCoord[5]); break;
            case d : textures.push(texCoord[6]); break;
            default:break;
        }
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
    var upfactor = 140;
	var vertices = [
		//wheel center points, diameter is 888
        //left bogie
  		vec4(-7086.5,-1743+upfactor, 717.5,1), //front left wheel
  		vec4(-4798.5,-1743+upfactor, 717.5,1), //right of front left wheel
  		vec4(-7086.5,-1743+upfactor,-717.5,1), //back left wheel
  		vec4(-4798.5,-1743+upfactor,-717.5,1), //right of back left wheel

  		//right bogie
  		vec4( 4798.5,-1743+upfactor, 717.5,1), //left of front right wheel
  		vec4( 7086.5,-1743+upfactor, 717.5,1), //front right wheel
  		vec4( 4798.5,-1743+upfactor,-717.5,1), //left of back right wheel
  		vec4( 7086.5,-1743+upfactor,-717.5,1)  //back right wheel
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
    	wheel.color = vertexColors[5];
    	wheel.sideVertices = [];
    	wheel.topVertices = [];
    	wheel.botVertices = [];
    	wheel.segments = 16;
    	wheels.push(wheel);
    }

    //figure out correct vertices
    vertices = [
    	//left bogie
    	vec4(-7480.5,-1027, 716,1), 
    	vec4(-4404.5,-1027, 716,1), 
    	vec4(-7480.5,-1940+upfactor, 716,1), 
    	vec4(-4404.5,-1940+upfactor, 716,1), 
        vec4(-7480.5,-1027,-716,1), 
        vec4(-4404.5,-1027,-716,1), 
        vec4(-7480.5,-1940+upfactor,-716,1), 
        vec4(-4404.5,-1940+upfactor,-716,1),

    	//right bogie
        vec4( 4404.5,-1027, 716,1), 
        vec4( 7480.5,-1027, 716,1), 
        vec4( 4404.5,-1940+upfactor, 716,1), 
        vec4( 7480.5,-1940+upfactor, 716,1), 
        vec4( 4404.5,-1027,-716,1), 
        vec4( 7480.5,-1027,-716,1), 
        vec4( 4404.5,-1940+upfactor,-716,1), 
        vec4( 7480.5,-1940+upfactor,-716,1)
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
        switch(indices[i]){
            case a : textures.push(texCoord[0]); break;
            case b : textures.push(texCoord[4]); break;
            case c : textures.push(texCoord[5]); break;
            case d : textures.push(texCoord[6]); break;
            default:break;
        }
	    totcolors.push( [51/256,13/256,0.0,1.0] );
	}
}

function buildWheel(number){
	var vertex = wheels[number].location;
	var depth = 100; var radius = wheels[number].radius;
	var theta = Math.PI*2/wheels[number].segments;
    var rs = 217/256;   var gs = 217/256;   var bs = 217/256;
    var rf = 0.0;         var gf = 0.0;         var bf = 0.0;
    var al = 1.0;

	for(var i = 0; i<wheels[number].segments; i++){
		var x = Math.cos(theta*i)*radius + vertex[0];
		var y = Math.sin(theta*i)*radius + vertex[1];
		wheels[number].botVertices.push(vec4(x,y,vertex[2],1.0));
        wheels[number].sideVertices.push(vec4(x,y,vertex[2],1.0));
        if(vertex[2]<0){
            wheels[number].sideVertices.push(vec4(x,y,vertex[2]-depth,1.0));
            wheels[number].topVertices.push(vec4(x,y,vertex[2]-depth,1.0));
        }
        else{
            wheels[number].sideVertices.push(vec4(x,y,vertex[2]+depth,1.0));
            wheels[number].topVertices.push(vec4(x,y,vertex[2]+depth,1.0));
        }
	}
    for(var i  = 1; i<wheels[number].botVertices.length; i++){
        totpoints.push(wheels[number].botVertices[i]);
        textures.push(texCoord[0]);
        totcolors.push( [rf,gf,bf,al] );
        totpoints.push(vertex);
        textures.push(texCoord[4]);
        totcolors.push( [rf,gf,bf,al] );
        if(i+1<wheels[number].botVertices.length)
            totpoints.push(wheels[number].botVertices[i+1]);
        else
            totpoints.push(wheels[number].botVertices[1]);
        textures.push(texCoord[5]);
        totcolors.push( [rf,gf,bf,al] );
    }
    for(var i = 0; i<wheels[number].sideVertices.length-2; i++){
        totpoints.push(wheels[number].sideVertices[i]);
        textures.push(texCoord[0]);
        totcolors.push( [rs,gs,bs,al] );
        totpoints.push(wheels[number].sideVertices[i+1]);
        textures.push(texCoord[4]);
        totcolors.push( [rs,gs,bs,al] );
        totpoints.push(wheels[number].sideVertices[i+2]);
        textures.push(texCoord[5]);
        totcolors.push( [rs,gs,bs,al] );
    }
    totpoints.push(wheels[number].sideVertices[wheels[number].sideVertices.length-2]);
    textures.push(texCoord[0]);
    totcolors.push( [rs,gs,bs,al] );
    totpoints.push(wheels[number].sideVertices[wheels[number].sideVertices.length-1]);
    textures.push(texCoord[4]);
    totcolors.push( [rs,gs,bs,al] );
    totpoints.push(wheels[number].sideVertices[0]);
    textures.push(texCoord[5]);
    totcolors.push( [rs,gs,bs,al] );
    totpoints.push(wheels[number].sideVertices[wheels[number].sideVertices.length-1]);
    textures.push(texCoord[0]);
    totcolors.push( [rs,gs,bs,al] );
    totpoints.push(wheels[number].sideVertices[0]);
    textures.push(texCoord[4]);
    totcolors.push( [rs,gs,bs,al] );
    totpoints.push(wheels[number].sideVertices[1]);
    textures.push(texCoord[5]);
    totcolors.push( [rs,gs,bs,al] );

    for(var i  = 1; i<wheels[number].topVertices.length; i++){
        totpoints.push(wheels[number].topVertices[i]);
        textures.push(texCoord[0]);
        totcolors.push( [rf,gf,bf,al] );
        totpoints.push(vertex);
        textures.push(texCoord[4]);

        totcolors.push( [rf,gf,bf,al] );
        if(i+1<wheels[number].topVertices.length)
            totpoints.push(wheels[number].topVertices[i+1]);
        else
            totpoints.push(wheels[number].topVertices[1]);
        textures.push(texCoord[5]);
        totcolors.push( [rf,gf,bf,al] );
    }
}

function buildPole(number){
    var vertex = -6123.68+4083.55*number;
    var radius = 50;
    var theta = Math.PI*2/16;
    var rs = 0.0;   var gs = 100/256;   var bs = 0.0;
    var al = 1.0;
    var vertices = [];

    for(var i = 0; i<16; i++){
        var x = Math.cos(theta*i)*radius + vertex;
        var z = Math.sin(theta*i)*radius;
        vertices.push(vec4(x,-977,z,1.0));
        vertices.push(vec4(x,1027,z,1.0));
    }
    for(var i = 0; i<vertices.length-2; i++){
        totpoints.push(vertices[i]);
        textures.push(texCoord[0]);
        totcolors.push( [rs,gs,bs,al] );
        
        totpoints.push(vertices[i+1]);
        textures.push(texCoord[4]);
        totcolors.push( [rs,gs,bs,al] );

        totpoints.push(vertices[i+2]);
        textures.push(texCoord[5]);
        totcolors.push( [rs,gs,bs,al] );
    }
    totpoints.push(vertices[vertices.length-2]);
    textures.push(texCoord[0]);
    totcolors.push( [rs,gs,bs,al] );

    totpoints.push(vertices[vertices.length-1]);
    textures.push(texCoord[4]);
    totcolors.push( [rs,gs,bs,al] );

    totpoints.push(vertices[0]);
    textures.push(texCoord[5]);
    totcolors.push( [rs,gs,bs,al] );

    totpoints.push(vertices[vertices.length-1]);
    textures.push(texCoord[0]);
    totcolors.push( [rs,gs,bs,al] );

    totpoints.push(vertices[0]);
    textures.push(texCoord[4]);
    totcolors.push( [rs,gs,bs,al] );
    
    totpoints.push(vertices[1]);
    textures.push(texCoord[5]);
    totcolors.push( [rs,gs,bs,al] );

    numvertices = vertices.length;
    vertices = [];
}

function rotateHoriz(){
    if(rotating){
        rotating = 0;
    }
    else{
        rotating = 1;
    }
}

// Display the train
function render(){
	gl.depthFunc(gl.LEQUAL); 

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	if(rotating){
        theta = theta+1;
        if(theta==90||zoomedIn){
            aspect = 2000;
        }
        else{
            if(theta<90){
                aspect = 83.5*(90-theta)+2000;
            }
            else{
                aspect = 83.5*(theta-90)+2000;
            }
            // aspect = 10000;
        }
        rMatrix=mult(rMatrix,rotate(-1,0.0,1.0,0.0));
        if(theta == 90&&!click){
            rotating = 0;
        }
        else if(theta == 180){
            theta = 0;
            if(!click)
                rotating = 0;
        }
    }
    var ytop = aspect;  var bottom = -1*aspect;     var left = -1*aspect; var right = aspect;


    if(offset>0){
        offset-=50;
        // trainMtx = mult(trainMtx,translate(0,0,-50));
    }
    else if(offset<0){
        offset+=50;
        // trainMtx = mult(trainMtx,translate(0,0, 50));
    }

    mvMatrix = lookAt(eye, at, up);
	pMatrix  = ortho (left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv( mvMatrixLoc, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( pMatrixLoc, false, flatten(pMatrix) );
    gl.uniformMatrix4fv( rMatrixLoc, false, flatten(rMatrix) );

    start = 0;
    var stopPt = 1130;
    if(doorIsClosing){
        if(pos==0){
            doorIsClosing = false;
            for(var i = 0; i<doors.length; i++)
                doors[i].isClosed = true;
        }
        else{
            for(var i = 0; i<doors.length; i++){
                for(var j = 0; j<doors[i].vertices.length; j++){
                    if(pos<10){
                        doors[i].vertices[j].x -= pos;
                    }
                    else{
                        doors[i].vertices[j].x -= 10;
                    }
                }
                if(pos<10)
                    doors[i].tMatrix = mult(translate(-pos,0,0),doors[i].tMatrix); 
                else
                    doors[i].tMatrix = mult(translate(-10,0,0),doors[i].tMatrix);
            }
            if(pos<10)
                pos=0;
            else
                pos-=10;
        }
    }
    else if(doors[0].isClosed==false&&pos<stopPt){
        for(var i = 0; i<doors.length; i++){
            for(var j = 0; j<doors[i].vertices.length; j++){
                if(pos>stopPt-10){
                    doors[i].vertices[j].x += stopPt-pos;
                }
                else{
                    doors[i].vertices[j].x += 10;
                }
            }
            if(pos>stopPt-10)
                doors[i].tMatrix = mult(translate(stopPt-pos,0,0),doors[i].tMatrix);
            else
                doors[i].tMatrix = mult(translate(10,0,0),doors[i].tMatrix);
        }
        if(pos>stopPt-10)
            pos = stopPt;
        else
            pos+=10;
    }

    gl.uniformMatrix4fv( trainMtxLoc, false, flatten(trainMtx) );
    for(var i = 0; i<mainDoorsSize; i++){
        gl.uniformMatrix4fv(tMatrixLoc, false, flatten(doors[i].tMatrix));
        gl.drawArrays( gl.TRIANGLES, start, doors[i].vertices.length);
        start = start + doors[i].vertices.length;
    }
    gl.uniformMatrix4fv(tMatrixLoc, false, flatten(translate(0,0,0)));



    gl.drawArrays( gl.TRIANGLES, start, (doors.length-mainDoorsSize)*doors[0].vertices.length);
    for(var i = mainDoorsSize; i<doors.length; i++)
        start = start + doors[i].vertices.length;


    gl.drawArrays( gl.TRIANGLES, start, numSideVertices);
    start = start + numSideVertices;

    for(var i = 0; i<bogies.length; i++){
        gl.drawArrays( gl.TRIANGLES, start, bogies[i].vertices.length);
        start = start + bogies[i].vertices.length;
    }
    for(var i = 0; i<wheels.length; i++){
        gl.drawArrays(gl.TRIANGLES, start, (wheels[i].botVertices.length-1)*3);
        start = start + (wheels[i].botVertices.length-1)*3;
        gl.drawArrays(gl.TRIANGLES, start, (wheels[i].sideVertices.length-2)*3 + 6);
        start = start + (wheels[i].sideVertices.length-2)*3 + 6;

        gl.drawArrays(gl.TRIANGLES, start, (wheels[i].topVertices.length-1)*3);
        start = start + (wheels[i].topVertices.length-1)*3;
    }
    // for(var i = 0; i<4; i++)
        gl.drawArrays(gl.TRIANGLES, start, totpoints.length-start);
	window.requestAnimationFrame(render,canvas);
}


window.onresize = function(){
	var min = innerWidth;
	if (innerHeight<innerWidth)
		min = innerHeight;
	if (min<canvas.width || min< canvas.height)
		gl.viewport(0,canvas.height-min, min, min);
}