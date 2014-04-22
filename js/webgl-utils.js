///////////////////////////////////////////////////////////////////////////////
// --- DEBUGGING --------------------------------------------------------------

window.onerror = function(err, funcName, args) {
	alert(funcName + '(' + args + '): ' + err);
}

function throwOnGLError(err, funcName, args) {
	throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
}

function logGLCall(functionName, args) {
	console.log("gl." + functionName + "(" +
		WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
}

function validateNoneOfTheArgsAreUndefined(functionName, args) {
	for (var ii = 0; ii < args.length; ++ii) {
		if (args[ii] === undefined) {
			console.error("undefined passed to gl." + functionName + "(" +
				WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
		}
	}
}

function logAndValidate(functionName, args) {
   logGLCall(functionName, args);
   validateNoneOfTheArgsAreUndefined (functionName, args);
}

///////////////////////////////////////////////////////////////////////////////
// --- SIMPLE OBJECT CLASSES --------------------------------------------------

function quad() {
	this.vertices = new Float32Array([
		-1,	-1,
		1,	-1,
		-1,	1,
		1,	1]);

	this.indices = new Uint16Array([
		0, 1, 2,
		1, 2, 3]);

	this.texture = new Float32Array([
		0.0, 0.0,
		1.0, 0.0,
		0.0, 1.0,
		1.0, 1.0]);

	this.indicesTotal = this.indices.length;
}

function axis(length) {
	this.vertices = new Float32Array([
		0, 0, 0,
		length, 0, 0,
		0, 0, 0,
		0, length, 0,
		0, 0, 0,
		0, 0, length]);

	this.colors = new Float32Array([
		1, 0, 0, 1,
		1, 0, 0, 1,
		0, 1, 0, 1,
		0, 1, 0, 1,
		0, 0, 1, 1,
		0, 0, 1, 1]);

	this.indices = new Uint16Array([
		0, 1,
		2, 3,
		4, 5]);

	this.indicesTotal = this.indices.length;

	this.vertexshader = 'shaders/vs-axis.txt';
	this.fragmentshader = 'shaders/fs-axis.txt';
}

///////////////////////////////////////////////////////////////////////////////
// --- SHADERS MANAGEMENT -----------------------------------------------------

function loadProgram(vs, fs, callback) {
	var program = gl.createProgram();
	// Source of vertex shaders
	function vshaderLoadedCode(str) {
		program.vshaderSource = str;
		// If fragment shaders source is already specified
		if (program.fshaderSource) {
			linkProgram(program);
			callback(program);
		}
	}

	// Specify the source of fragment shaders
	function fshaderLoadedCode(str) {
		program.fshaderSource = str;
		// If vertex shaders source is already specified
		if (program.vshaderSource) {
			linkProgram(program);
			callback(program);
		}
	}

	// Load shaders files through XHR, without caching
	loadFile(vs, vshaderLoadedCode, true, false);
	loadFile(fs, fshaderLoadedCode, true, false);

	return program;
}

function createShader(str, type) {
	var shader = gl.createShader(type);
	// Set the source of that shader
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	// Check the compile status for errors
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		// If there is a problem, throw a message
		throw gl.getShaderInfoLog(shader);
	}

	return shader;
}

function createProgram(vstr, fstr) {
	var program = gl.createProgram();
	var vshader = createShader(vstr, gl.VERTEX_SHADER);
	var fshader = createShader(fstr, gl.FRAGMENT_SHADER);
	// Attach those shaders to the program
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
	// Link the program
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		// If there is a problem, throw a message
		throw gl.getProgramInfoLog(program);
	}

	return program;
}

function linkProgram(program) {
	// Specify the source and the type of shaders (as before)
	var vshader = createShader(program.vshaderSource, gl.VERTEX_SHADER);
	var fshader = createShader(program.fshaderSource, gl.FRAGMENT_SHADER);
	// Attach those shaders to the program
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
	// Link the program
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		// If there is a problem, throw a message
		throw gl.getProgramInfoLog(program);
	}
}

///////////////////////////////////////////////////////////////////////////////
// --- OTHER UTILS ------------------------------------------------------------

function loadFile(file, callback, noCache, isJson) {
	// Creat XHR request to get the files from server (load data without having to do full page refresh and disrupting what the user is doing)
	var request = new XMLHttpRequest();
	// Run the function when readyState changes
	request.onreadystatechange = function() {
		// State 1 - opened request
		if (request.readyState == 1) {
			if (isJson) {
				request.overrideMimeType('application/json');
			}
			// Send request and run this function again
			request.send();
		}
		// State 4 - done
		else if (request.readyState == 4) {
			// If request has been succeded
			if (request.status == 200) {
				// Sent the text inside chosen file using callback
				callback(request.responseText);
			}
			// If couldn't find the file
			else if (request.status == 404) {
				throw 'File "' + file + '"does not exist.';
			}
			// If yet another error appeared
			else {
				throw 'XHR error ' + request.status + '.';
			}
		}
	};

	// Turn of caching in order to decrease bandwidth usage
	var url = file;
	if (noCache) {
		url += '?' + (new Date()).getTime();
	}

	// Open the request for the file
	request.open('GET', url, true);
}

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelRequestAnimationFrame = window[vendors[x]+
          'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

function printInnerHTML(where, what) {
	document.getElementById(where).innerHTML = what;
}

function log(what) {
	document.getElementById('log').innerHTML = what;
}

///////////////////////////////////////////////////////////////////////////////
// --- MATRICES MANAGEMENT ----------------------------------------------------

globalGLMatrixState = {
	// Stack of models (in order to use scene graph)
	modelMatrix: [ new Matrix4x3(), new Matrix4x3() ],
	// Pass reasonable values
	projectionMatrix: new Matrix4x4().makePerspective(75, document.body.clientWidth/document.body.clientHeight, 0.01, 100),
	viewMatrix: new Matrix4x3(),
	// How many models is in stack currently
	modelStackTop: 0
};

function modelMatrix() {
	// Return the top model matrix (will need to pop and push matrices)
	return globalGLMatrixState.modelMatrix[globalGLMatrixState.modelStackTop];
}

function projectionMatrix() {
	return globalGLMatrixState.projectionMatrix;
}

function viewMatrix() {
	return globalGLMatrixState.viewMatrix;
}

// --- Push and pop matrices
function pushModelMatrix() {
	// When pushing new matrix, increment the count
	++globalGLMatrixState.modelStackTop;
	// If it hit the limit, allocate more space for matrices
	if (globalGLMatrixState.modelStackTop == globalGLMatrixState.modelMatrix.length) {
		// Create new matrix
		globalGLMatrixState.modelMatrix[globalGLMatrixState.modelMatrix.length] = new Matrix4x3();
	}

	// Copy data from the old top-most matrix to the new top-most matrix
	var newTop = globalGLMatrixState.modelMatrix[globalGLMatrixState.modelStackTop];
	var oldTop = globalGLMatrixState.modelMatrix[globalGLMatrixState.modelStackTop - 1];
	// Copy each matrix element from old to new top matrix
	for(var e = 0; e < 16; ++e) {
		newTop.element[e] = oldTop.element[e];
	}

	return newTop;
}

function popModelMatrix() {
	// Just decrease the count, cause it's likely that it's going to be used again
	--globalGLMatrixState.modelStackTop;
}