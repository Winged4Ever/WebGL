///////////////////////////////////////////////////////////////////////////////
// --- MESH CLASS -------------------------------------------------------------

function Mesh() {

	this.programLoaded = function(program) {
		program.vertexPosAttrib = gl.getAttribLocation(program, 'aVertexPosition');
		program.vertexNormalAttrib = gl.getAttribLocation(program, 'aVertexNormal');
		program.vertexTextureCoordAttrib = gl.getAttribLocation(program, 'aVertexTextureCoord');
		program.mMatrixUniform = gl.getUniformLocation(program, 'uMMatrix');
		program.pMatrixUniform = gl.getUniformLocation(program, 'uPMatrix');
		program.vMatrixUniform = gl.getUniformLocation(program, 'uVMatrix');
		program.diffuseSampler = gl.getUniformLocation(program, 'uDiffuseSampler');
		program.emissiveSampler = gl.getUniformLocation(program, 'uEmissiveSampler');
	//	program.offsetUniform = gl.getUniformLocation(program, 'uOffset');

		// If this was the last program to load
		if (--this.numOfMaterialsToLoad == 0)
			this.callback();
	};

	this.loadTex = function(filename) {
		var tex = gl.createTexture();
		var img = new Image();
		img.onload = function() {
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
		};
		img.src = filename;
		return tex;
	};

	this.init = function(jsonString) {
		// Parse returned JSON string to the JSON.parse() function to get a Javascript object
		var mesh = JSON.parse(jsonString);
		// Create a new buffer to hold the position data
		this.vertexPosBuffer = gl.createBuffer();
		// Bind that buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer);
		// Fill the buffer with data from the mesh that has been loaded ('vertexPositions' is a predefined name inside of loaded object that contains vertex positions)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.verts), gl.STATIC_DRAW);

		// Do the same with indices (plurar from index) (use indices buffer to store the vertex position data once and use it multiple times(useful in texture normal operations))
		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		// 'indices', as 'vertexPosition', is a variable defined in loaded file
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);
		// Count how many inidces have the mesh in case if not specified
		mesh.indicesTotal = 0;
		for (var i in mesh.indices){
			mesh.indicesTotal += 1;
		}

		// If mesh file contains normals data
		if (mesh.normals) {
			this.vertexNormalBuffer = gl.createBuffer();
			// This is vertex data so it's not gonna be an element array buffer
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
			// Put mesh.normals data into that array
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.normals), gl.STATIC_DRAW);
		}

		// If mesh file contains texture coordinates
		if (mesh.texcoords) {
			this.vertexTextureCoordBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.texcoords), gl.STATIC_DRAW);
		}

		// How many material we need to load ('materials' - same as 'indices')
		this.numOfMaterialsToLoad = mesh.materials.length;
		// Generate an array of programs
		this.programs = [];
		var self = this;
		for (var m in mesh.materials) {
			// Get the description for each material in 'materials' area
			var material = mesh.materials[m];
			var prog = loadProgram(material.vertexshader, material.fragmentshader, function(prog) { self.programLoaded(prog); });
			if (!material.numindices)
				prog.numIndices = mesh.indicesTotal;
			else
				prog.numIndices = material.numindices;

			// If material has diffuse texture specified
			if (material.diffuse) {
				// Load that texture
				prog.diffuseTexture = this.loadTex(material.diffuse);
			}
			// If material has emissive texture specified
			if (material.emissive) {
				// Load that texture
				prog.emissiveTexture = this.loadTex(material.emissive);
			}

			// Push that program on to the global list of programs required to draw that model
			this.programs.push(prog);
		}
	};

	this.load = function(file, callback) {
		// Save callback for later (it will be available in all child functions)
		this.callback = callback;
		// Because of how 'this' works, there is a need to create an another variable to use in inner functions
		var self = this;
		// Load json file and callback it's source to the function init(), where it will be deconstructed, binded to buffers and main callback function will be called  
		loadFile(file, function(x) { self.init(x); }, false, true);
	};

	this.setMatrixUniforms = function(program) {
		gl.uniformMatrix4fv(program.mMatrixUniform, false, modelMatrix().element);
		gl.uniformMatrix4fv(program.pMatrixUniform, false, projectionMatrix().element);
		gl.uniformMatrix4fv(program.vMatrixUniform, false, viewMatrix().element);
	//	gl.uniform2f(program.offsetUniform, offset[0], offset[1]);
	};

	this.draw = function() {
		var startDrawingFrom = 0;
		// For each of the programs
		for (var p in this.programs) {
			// Get the reference of each one
			var program = this.programs[p];
			gl.useProgram(program);

			gl.enableVertexAttribArray(program.vertexPosAttrib);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer);
			// Point the data and tell that there is 3 floats per vertex
			gl.vertexAttribPointer(program.vertexPosAttrib, 3, gl.FLOAT, false, 0, 0);

			// If going to use normals
			if(program.vertexNormalAttrib !== -1) {
				// Enable it
				gl.enableVertexAttribArray(program.vertexNormalAttrib);
				// Bind it
				gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
				// Specify format of the data
				gl.vertexAttribPointer(program.vertexNormalAttrib, 3, gl.FLOAT, false, 0, 0);
			}

			// If going to use textures
			if(program.vertexTextureCoordAttrib !== -1) {
				gl.enableVertexAttribArray(program.vertexTextureCoordAttrib);
				gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
				// 2D so 2 component floats
				gl.vertexAttribPointer(program.vertexTextureCoordAttrib, 2, gl.FLOAT, false, 0, 0);
			}
			// If has diffuse texture
			if (program.diffuseTexture) {
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, program.diffuseTexture);
				gl.uniform1i(program.diffuseSampler, 0);
			}
			// If has emissive texture
			if (program.emissiveTexture) {
				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, program.emissiveTexture);
				gl.uniform1i(program.emissiveSampler, 1);
			}

			// Set matrices before drawing (separate function is useful)
			this.setMatrixUniforms(program);

			gl.drawElements(gl.TRIANGLES, program.numIndices, gl.UNSIGNED_SHORT, startDrawingFrom * 2);
			// Tell the drawElements what was the last vertex darwed by previous program (multiply by 2 cause passing in bytes)
			startDrawingFrom += program.numIndices;
		}

	};
}

///////////////////////////////////////////////////////////////////////////////
// --- LINE CLASS -------------------------------------------------------------

function Line() {
	this.programLoaded = function(program) {
		program.vertexPosAttrib = gl.getAttribLocation(program, 'aVertexPosition');
		program.vertexColorAttrib = gl.getAttribLocation(program, 'aColor');
		program.mMatrixUniform = gl.getUniformLocation(program, 'uMMatrix');
		program.pMatrixUniform = gl.getUniformLocation(program, 'uPMatrix');
		program.vMatrixUniform = gl.getUniformLocation(program, 'uVMatrix');

		this.callback();
	};

	this.load = function(data, callback) {
		this.callback = callback;

		var line = data;
		this.vertexPosBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(line.verts), gl.STATIC_DRAW);

		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(line.indices), gl.STATIC_DRAW);

		this.indicesTotal = line.indices.length;

		if (line.colors) {
			this.colorsBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(line.colors), gl.STATIC_DRAW);
		}

		var self = this;
		var prog = loadProgram(line.vertexshader, line.fragmentshader, function(prog) { self.programLoaded(prog); });
		this.program = prog;
	};

	this.setMatrixUniforms = function(program) {
		gl.uniformMatrix4fv(program.mMatrixUniform, false, modelMatrix().element);
		gl.uniformMatrix4fv(program.pMatrixUniform, false, projectionMatrix().element);
		gl.uniformMatrix4fv(program.vMatrixUniform, false, viewMatrix().element);
	};

	this.draw = function() {
			var program = this.program;
			gl.useProgram(program);

			gl.enableVertexAttribArray(program.vertexPosAttrib);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer);
			gl.vertexAttribPointer(program.vertexPosAttrib, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(program.vertexColorAttrib);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
			gl.vertexAttribPointer(program.vertexColorAttrib, 4, gl.FLOAT, false, 0, 0);

			this.setMatrixUniforms(program);

			gl.drawElements(gl.LINES, this.indicesTotal, gl.UNSIGNED_SHORT, 0);
	};
}