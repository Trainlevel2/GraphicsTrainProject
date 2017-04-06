var NumVertices = 0;

var eye = 0; 		var at = 0;     var up = vec3(0,1,0);
var ytop = 0; 		var bottom = 0; var left = 0; var right = 0;
var near = -1.5;	var far = 1.5;

var totpoints=[];	var points = [];				//Array of Vertices
var totcolors=[];   var colors = [];

var mvMatrixLoc;
var pMatrixLoc;
var grMatrixLoc;
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
	var program = initShaders(gl,"vertex-shader", "fragment-shader");
	gl.useProgram(program);

	//Buld the Skeleton for the outside of train
	buildSkeleton();

	//Build the 4 sets of double doors and 2 single doors
	for(var i = 0; i<10; i++)
		buildDoor(i);

	//Build the 2 trucks underneath the train
	for(var i = 0; i<2; i++)
		buildBogie(i);


	initKeyGroups();

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

	//Model View and Projection Matrices
	mvMatrixLoc= gl.getUniformLocation (program, "mvMatrix");
	pMatrixLoc = gl.getUniformLocation (program, "pMatrix" );

	render();
}

//Initializes all parameters for every cube, including 6 "quad" faces
function buildSkeleton()
{
	//Build a Specific Side
    side( 1, 0, 3, 2 ,i);

}

//WIP Method to generate vertices for making the side of a cube
function side(a, b, c, d)
{
	//define vertices for all 27 .32x.32x.32 cubes in one single vertices definition, with .02 spacing
    var vertices = [
  /*      vec4( -0.5 +(cubenum%3)*0.34, -0.5 +(Math.floor(cubenum/3)%3)*0.34,  0.5 -(Math.floor(cubenum/9)%3)*0.34, 1.0 ),
        vec4( -0.5 +(cubenum%3)*0.34, -0.18+(Math.floor(cubenum/3)%3)*0.34,  0.5 -(Math.floor(cubenum/9)%3)*0.34, 1.0 ),
        vec4( -0.18+(cubenum%3)*0.34, -0.18+(Math.floor(cubenum/3)%3)*0.34,  0.5 -(Math.floor(cubenum/9)%3)*0.34, 1.0 ),
        vec4( -0.18+(cubenum%3)*0.34, -0.5 +(Math.floor(cubenum/3)%3)*0.34,  0.5 -(Math.floor(cubenum/9)%3)*0.34, 1.0 ),
        vec4( -0.5 +(cubenum%3)*0.34, -0.5 +(Math.floor(cubenum/3)%3)*0.34,  0.18-(Math.floor(cubenum/9)%3)*0.34, 1.0 ),
        vec4( -0.5 +(cubenum%3)*0.34, -0.18+(Math.floor(cubenum/3)%3)*0.34,  0.18-(Math.floor(cubenum/9)%3)*0.34, 1.0 ),
        vec4( -0.18+(cubenum%3)*0.34, -0.18+(Math.floor(cubenum/3)%3)*0.34,  0.18-(Math.floor(cubenum/9)%3)*0.34, 1.0 ),
        vec4( -0.18+(cubenum%3)*0.34, -0.5 +(Math.floor(cubenum/3)%3)*0.34,  0.18-(Math.floor(cubenum/9)%3)*0.34, 1.0 )*/
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

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex
 /*   var indices = [ a, b, c, a, c, d ];
	for ( var i = 0; i < indices.length; ++i ) {
	    points.push( vertices[indices[i]] );
	    totpoints.push( vertices[indices[i]] );
	    

	    // If it isn't an outer face, make it black
	    if(!(outerFace(vertices[a])&&outerFace(vertices[b])&&outerFace(vertices[b])&&outerFace(vertices[c])&&outerFace(vertices[d]))){
	    	colors.push(vertexColors[0]);
	    	totcolors.push(vertexColors[0]);
	    }
	    // for solid colored faces use
	    else{
	    	colors.push(vertexColors[a]);
	    	totcolors.push(vertexColors[a]);
	    }

	}*/
}

buildDoor(number){
	
}

buildBogie(number){
	

}

// Display the train
function render(){
	gl.depthFunc(gl.LEQUAL); 

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mvMatrix = lookAt(eye, at, up);
	pMatrix  = ortho (left, right, bottom, ytop, near, far);
    gl.uniformMatrix4fv( mvMatrixLoc, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( pMatrixLoc, false, flatten(pMatrix) );
	//cubes[i].rMatrix =mult(mult(mult(cubes[i].rMatrixZ,cubes[i].rMatrixY),cubes[i].rMatrixX),cubes[i].rMatrix);
	//gl.uniformMatrix4fv(grMatrixLoc, false, flatten(cubes[i].grMatrix));
	//gl.uniformMatrix4fv(rMatrixLoc, false, flatten(cubes[i].rMatrix));
	//cubes[i].rMatrixX = mat4(); cubes[i].rMatrixY = mat4(); cubes[i].rMatrixZ = mat4();

    // gl.uniform3fv(thetaLoc, cubes[i].theta);
    //gl.drawArrays( gl.TRIANGLES, 0+NumVertices*i, NumVertices);
	window.requestAnimationFrame(render,canvas);
}

window.onresize = function(){
	var min = innerWidth;
	if (innerHeight<innerWidth)
		min = innerHeight;
	if (min<canvas.width || min< canvas.height)
		gl.viewport(0,canvas.height-min, min, min);
}