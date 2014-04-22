///////////////////////////////////////////////////////////////////////////////
// --- DIRECTED ACYCLIC GRAPH -------------------------------------------------

function DAGNode(child) {
	// Local transform (all children will transform in the same manner)
	this.local = new Matrix4x3();
	this.position = new vec3();
	this.rotation = new Quaternion();
	// Child list (if no children passed, assign an empty array)
	this.children = child ? child : [];

/*	this.yaw = 0;
	this.pitch = 0;
	this.roll = 0;*/
}

DAGNode.prototype = {
	addChild: function(newChild) { // Example: scene.addChild(getModel(0));
		this.children[this.children.length] = new DAGNode([newChild]);
	},

	removeChild: function(child) { // Prediction: 'child' would be an ordinal
		if (child >= this.children.length)
			this.children.splice(this.children.length - 1, 1);
		else
			this.children.splice(child, 1);
	}, // TODO: How to specify a child not by an ordinal number?

	transferChild: function(whichChild, newNode) {
		if (this.children[whichChild] === newNode) { // In case of logic typo
			throw 'Error in transferChild function: cannot transfer object to itself!';
		}
		else if (whichChild >= this.children.length) { // If child ordinal is larger than children array length
			newNode.children[newNode.children.length] = this.children[this.children.length - 1];
			// Remove old child
			this.children.splice(this.children.length - 1, 1);
		}
		else { // If ordinal makes in the array
			newNode.children[newNode.children.length] = this.children[whichChild];
			// Remove old child
			this.children.splice(whichChild, 1);
		}
	},

	draw: function () {
		// Push the model matrix and apply main node's transformation to it
		pushModelMatrix().multiply(this.local);
		// Loop over all the children and draw them
		for (var c in this.children) {
			this.children[c].draw();
		}
		popModelMatrix();
	},

	move: function(x, y, z) {
		this.position.addSelf(new vec3().make(x, y, z));

		this.local.setTranslation(this.position);
	},

	rotate: function(radX, radY, radZ) { // TODO
		this.rotation.multiply(new Quaternion().axisToQuaternion(radX, this.rotation.getUpVector()));
		this.rotation.multiply(new Quaternion().axisToQuaternion(radY, this.rotation.getForwardVector()));
		this.rotation.multiply(new Quaternion().axisToQuaternion(radZ, this.rotation.getRightVector()));

		this.local.setRotation(this.rotation.quaternionToMatrix());
	},

	lookAt: function(at) {
		if (this.position.isEqual(at)) {
			return;
		}
		var zAxis = this.position.sub(at).normalize();
		var up = upVec();
		var xAxis = up.cross(zAxis).normalize();
		var yAxis = zAxis.cross(xAxis);
		this.local.make(
			xAxis.x,			xAxis.y,			xAxis.z,
			yAxis.x,			yAxis.y,			yAxis.z,
			zAxis.x,			zAxis.y,			zAxis.z,
			this.position.x,	this.position.y,	this.position.z);
	},
};

function Geometry(mesh) {
	// Save reference to passed mesh
	this.mesh = mesh;
}

Geometry.prototype = {
	draw: function() {
		this.mesh.draw();
	}
};

// What does it mean??
Geometry.prototype.prototype = DAGNode.prototype;

///////////////////////////////////////////////////////////////////////////////
// --- MODELS MANAGEMENT ------------------------------------------------------

var modelsLoaded = [];
function loadModels(intoWhichNode) {
	var self = this;
	this.checkQ = function() {
		if (modelsLoaded.length == modelsToLoad.length) {
			drawLoop();
		}
		else {
			modelsLoaded[modelsLoaded.length] = new Mesh();
			modelsLoaded[modelsLoaded.length - 1].load(modelsToLoad[modelsLoaded.length - 1], self.checkQ);
		}
	};

	modelsLoaded[modelsLoaded.length] = new Mesh();
	modelsLoaded[modelsLoaded.length - 1].load(modelsToLoad[modelsLoaded.length - 1], self.checkQ);
}

function getModel(whichModel) {
	return new Geometry(modelsLoaded[whichModel]);
}