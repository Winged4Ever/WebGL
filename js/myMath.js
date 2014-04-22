///////////////////////////////////////////////////////////////////////////////
// --- VECTOR 3 ---------------------------------------------------------------

function vec3() {
	this.x = 0;
	this.y = 0;
	this.z = 0;
}

vec3.prototype = {
	make: function(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;

		return this;
	},

	copy: function(vec) {
		this.x = vec.x;
		this.y = vec.y;
		this.z = vec.z;

		return this;
	},

	makeIdentity: function() {
		return this.make(0, 0, 0);
	},

	length: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	},

	negate: function() {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;

		return this;
	},

	normalize: function() {
		var vecLength = this.length();

		if (vecLength === 0) {
			this.x = 0;
			this.y = 0;
			this.z = 0;
		}
		else {
			this.x /= vecLength;
			this.y /= vecLength;
			this.z /= vecLength;
		}

		return this;
	},

	add: function(vec) {
		var vecOut = new vec3();
		vecOut.copy(this);

		vecOut.x += vec.x;
		vecOut.y += vec.y;
		vecOut.z += vec.z;

		return vecOut;
	},

	addSelf: function(vec) {
		this.x += vec.x;
		this.y += vec.y;
		this.z += vec.z;

		return this;
	},

	sub: function(vec) {
		var vecOut = new vec3();
		vecOut.copy(this);

		vecOut.x -= vec.x;
		vecOut.y -= vec.y;
		vecOut.z -= vec.z;

		return vecOut;
	},

	subSelf: function(vec) {
		this.x -= vec.x;
		this.y -= vec.y;
		this.z -= vec.z;

		return this;
	},

	multiplyByScalar: function(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;
	},

	multiply: function(vec) {
		var vecOut = new vec3();
		vecOut.copy(this);

		vecOut.x *= vec.x;
		vecOut.y *= vec.y;
		vecOut.z *= vec.z;

		return vecOut;
	},

	multiplySelf: function(vec) {
		this.x *= vec.x;
		this.y *= vec.y;
		this.z *= vec.z;

		return this;
	},

	dot: function(vec) {
		return this.x * vec.x + this.y * vec.y + this.z * vec.z;
	},

	cross: function(vec) {
		var tempVec = new vec3();

		tempVec.x = this.y * vec.z - this.z * vec.y;
		tempVec.y = this.z * vec.x - this.x * vec.z;
		tempVec.z = this.x * vec.y - this.y * vec.x;

		return tempVec;
	},

	crossSelf: function(vec) {
		this.x = this.y * vec.z - this.z * vec.y;
		this.y = this.z * vec.x - this.x * vec.z;
		this.z = this.x * vec.y - this.y * vec.x;

		return this;
	},

	getVec: function(to) {
		var vecOut = new vec3();

		vecOut.x = this.x - to.x;
		vecOut.y = this.y - to.y;
		vecOut.z = this.z - to.z;

		return vecOut;
	},

	toString: function() {
		return 'x: ' + this.x + ' y: ' + this.y + ' z: ' + this.z;
	},

	isNull: function() {
		if (this.x === 0 && this.y === 0 && this.z === 0)
			return true;
		return false;
	},

	isEqual: function(vec) {
		if (this.x === vec.x && this.y === vec.y && this.z === vec.z)
			return true;
		return false;
	},

	lerp: function(v0, v1, blend) {
		return v0.add(v1.sub(v0).multiplyByScalar(blend));
	},

	nlerp: function(v0, v1, blend) {
		return v0.add(v1.sub(v0).multiplyByScalar(blend)).normalize();
	},
};

function upVec() {
	return new vec3().make(0, 1, 0);
}

function rightVec() {
	return new vec3().make(1, 0, 0);
}

function forwardVec() {
	return new vec3().make(0, 0, 1);
}

function backwardVec() {
	return new vec3().make(0, 0, -1);
}

///////////////////////////////////////////////////////////////////////////////
// --- 4x3 MATRIX -------------------------------------------------------------

function Matrix4x3() {
	// Make fake 4x4 array matrix (we won't be using last row)
	this.element = new Float32Array(16);
	this.element[0] = 1;
	this.element[5] = 1;
	this.element[10] = 1;
	this.element[15] = 1;
}

Matrix4x3.prototype = {

	make: function(x1, x2, x3, y1, y2, y3, z1, z2, z3, t1, t2, t3) {
		// Fill every row except the fake 4th one
		this.element[0] = x1;
		this.element[1] = x2;
		this.element[2] = x3;

		this.element[4] = y1;
		this.element[5] = y2;
		this.element[6] = y3;

		this.element[8] = z1;
		this.element[9] = z2;
		this.element[10] = z3;
		
		this.element[12] = t1;
		this.element[13] = t2;
		this.element[14] = t3;

		return this;
	},

	// Make diagonal matrix, 'start at zero'
	makeIdentity: function() {
		// 16th element is always 1 cause it's a position, not a direction
		return this.make(1, 0, 0,	0, 1, 0,	0, 0, 1,	0, 0, 0);
	},

	// Rotation around axis defined by rotation vector
	makeRotate: function(angle, x, y, z) {
		var rotationVector = Math.sqrt(x*x + y*y + z*z);
		var throughAxis = {
			x: x / rotationVector,
			y: y / rotationVector,
			z: z / rotationVector
		};
		var sinA = Math.sin(angle);
		var cosA = Math.cos(angle);

		// Rodrigue's rotation formula below
		this.element[0] = cosA + throughAxis.x * throughAxis.x * (1 - cosA);
		this.element[1] = throughAxis.y * throughAxis.x * (1 - cosA) + throughAxis.z * sinA;
		this.element[2] = throughAxis.z * throughAxis.x * (1 - cosA) - throughAxis.y * sinA;
		this.element[4] = throughAxis.x * throughAxis.y * (1 - cosA) - throughAxis.z * sinA;
		this.element[5] = cosA + throughAxis.y * throughAxis.y * (1 - cosA);
		this.element[6] = throughAxis.z * throughAxis.y * (1 - cosA) + throughAxis.x * sinA;
		this.element[8] = throughAxis.x * throughAxis.z * (1 - cosA) + throughAxis.y * sinA;
		this.element[9] = throughAxis.y * throughAxis.z * (1 - cosA) - throughAxis.x * sinA;
		this.element[10] = cosA + throughAxis.z * throughAxis.z * (1 - cosA);
		this.element[12] = this.element[13] = this.element[14] = 0;

		return this;
	},

	rotate: function (angle, x, y, z) {
		this.multiply((new Matrix4x3).makeRotate(angle, x, y, z));
	},

	translateTo: function(x, y, z) {
		this.element[12] += x;
		this.element[13] += y;
		this.element[14] += z;
	},

	translateByVector: function(distance, vec) {
		this.element[12] += distance * vec.x;
		this.element[13] += distance * vec.y;
		this.element[14] += distance * vec.z;
	},

	setTranslation: function(vec) {
		this.element[12] = vec.x;
		this.element[13] = vec.y;
		this.element[14] = vec.z;		
	},

	setRotation: function(m) {
		// X rotation
		this.element[0] = m.element[0];
		this.element[1] = m.element[1];
		this.element[2] = m.element[2];
		
		// Y rotation
		this.element[4] = m.element[4];
		this.element[5] = m.element[5];
		this.element[6] = m.element[6];

		// Z rotation
		this.element[8] = m.element[8];
		this.element[9] = m.element[9];
		this.element[10] = m.element[10];
	},

	scale: function(x, y, z) {
		this.element[0] *= x;
		this.element[5] *= y;
		this.element[10] *= z;
	},

	scaleL: function(scale) {
		this.element[0] *= scale;
		this.element[5] *= scale;
		this.element[10] *= scale;
	},

	multiply: function(m) {
		this.make(	this.element[0] * m.element[0] + this.element[4] * m.element[1] + this.element[8] * m.element[2],
					this.element[1] * m.element[0] + this.element[5] * m.element[1] + this.element[9] * m.element[2],
					this.element[2] * m.element[0] + this.element[6] * m.element[1] + this.element[10] * m.element[2],

					this.element[0] * m.element[4] + this.element[4] * m.element[5] + this.element[8] * m.element[6],
					this.element[1] * m.element[4] + this.element[5] * m.element[5] + this.element[9] * m.element[6],
					this.element[2] * m.element[4] + this.element[6] * m.element[5] + this.element[10] * m.element[6],

					this.element[0] * m.element[8] + this.element[4] * m.element[9] + this.element[8] * m.element[10],
					this.element[1] * m.element[8] + this.element[5] * m.element[9] + this.element[9] * m.element[10],
					this.element[2] * m.element[8] + this.element[6] * m.element[9] + this.element[10] * m.element[10],

					this.element[0] * m.element[12 ] + this.element[4] * m.element[13 ] + this.element[8] * m.element[14 ] + this.element[12],
					this.element[1] * m.element[12 ] + this.element[5] * m.element[13 ] + this.element[9] * m.element[14 ] + this.element[13],
					this.element[2] * m.element[12 ] + this.element[6] * m.element[13 ] + this.element[10] * m.element[14 ] + this.element[14]);
	},

	makeInverseRigidBody: function(m) {
		// Invert translation
		var invTrans0 = -m.element[12];
		var invTrans1 = -m.element[13];
		var invTrans2 = -m.element[14];

		// Calculate the translation
		this.element[12] = m.element[0] * invTrans0 + m.element[1] * invTrans1 + m.element[2] * invTrans2;
		this.element[13] = m.element[4] * invTrans0 + m.element[5] * invTrans1 + m.element[6] * invTrans2;
		this.element[14] = m.element[8] * invTrans0 + m.element[9] * invTrans1 + m.element[10] * invTrans2;

		// Transpose (calculate the rotation)
		this.element[0] = m.element[0];
		this.element[1] = m.element[4];
		this.element[2] = m.element[8];
		this.element[4] = m.element[1];
		this.element[5] = m.element[5];
		this.element[6] = m.element[9];
		this.element[8] = m.element[2];
		this.element[9] = m.element[6];
		this.element[10] = m.element[10];

		return this;
	},

	add: function(m) {
		for (var i in this.element) {
			this.element[i] += m.element[i];
		}
	},

	determinant: function () {
		// TODO
	},

	transpose: function () {
		var tmp;

		tmp = this.element[4]; this.element[4] = this.element[1]; this.element[1] = tmp;
		tmp = this.element[8]; this.element[8] = this.element[2]; this.element[2] = tmp;
		tmp = this.element[9]; this.element[9] = this.element[5]; this.element[5] = tmp;

		tmp = this.element[12]; this.element[12] = this.element[3]; this.element[3] = tmp;
		tmp = this.element[13]; this.element[13] = this.element[7]; this.element[7] = tmp;
		tmp = this.element[14]; this.element[14] = this.element[11]; this.element[11] = tmp;

		return this;
	},

	getBackwardVector: function() {
		return new vec3().make(this.element[2], this.element[6], this.element[10]);
	},

	getForwardVector: function() {
		return new vec3().make(-this.element[2], -this.element[6], -this.element[10]);
	},

	getRightVector: function() {
		return new vec3().make(this.element[0], this.element[4], this.element[8]);
	},

	getLeftVector: function() {
		return new vec3().make(-this.element[0], -this.element[4], -this.element[8]);
	},

	getUpVector: function() {
		return new vec3().make(this.element[1], this.element[5], this.element[9]);
	},

	getDownVector: function() {
		return new vec3().make(-this.element[1], -this.element[5], -this.element[9]);
	},

	toString: function() {
		var e = this.element;
		return	'rXx=' + e[0] + ', rXy=' + e[1] + ', rXz=' + e[2] + ', e3=' + e[3] +
				' | rYx=' + e[4] + ', rYy=' + e[5] + ', rYz=' + e[6] + ', e7=' + e[7] +
				' | rZx=' + e[8] + ', rZy=' + e[9] + ', rZz=' + e[10] + ', e11=' + e[11] +
				' | tX=' + e[12] + ', tY=' + e[13] + ', tZ=' + e[14] + ', e15=' + e[15];
	},
};

///////////////////////////////////////////////////////////////////////////////
// --- 4x4 MATRIX -------------------------------------------------------------

function Matrix4x4() {
	this.element = new Float32Array(16);
	this.element[0] = 1;
	this.element[5] = 1;
	this.element[10] = 1;
	this.element[15] = 1;
}

Matrix4x4.prototype = {

	make: function(x1, x2, x3, x4, y1, y2, y3, y4, z1, z2, z3, z4, t1, t2, t3, t4) {
		this.element[0] = x1;
		this.element[1] = x2;
		this.element[2] = x3;
		this.element[3] = x4;
		this.element[4] = y1;
		this.element[5] = y2;
		this.element[6] = y3;
		this.element[7] = y4;
		this.element[8] = z1;
		this.element[9] = z2;
		this.element[10] = z3;
		this.element[11] = z4;
		this.element[12] = t1;
		this.element[13] = t2;
		this.element[14] = t3;
		this.element[15] = t4;

		return this;
	},

	// Make diagonal matrix, 'start at zero'
	makeIdentity: function() {
		return this.make(1, 0, 0, 0,	0, 1, 0, 0,		0, 0, 1, 0,		0, 0, 0, 1);
	},

	makePerspective: function(fovY, aspect, zNear, zFar) {
		//
		var top = zNear * Math.tan(fovY * Math.PI / 360.0);
		//
		var bottom = -top;
		//
		var left =  bottom * aspect;
		//
		var right = top * aspect;

		//
		var X = 2 * zNear / (right - left);
		//
		var Y = 2 * zNear / (top - bottom);
		//
		var A = (right + left) / (right - left);
		//
		var B = (top + bottom) / (top - bottom);
		//
		var C = -(zFar + zNear) / (zFar - zNear);
		//
		var D = -2 * zFar * zNear / (zFar - zNear);

		this.make(X, 0, 0, 0,	0, Y, 0, 0,		A, B, C, -1,	0, 0, D, 0);
		return this;
	}
};

///////////////////////////////////////////////////////////////////////////////
// --- QUATERNIONS ------------------------------------------------------------

function Quaternion() {
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.w = 1;
}

Quaternion.prototype = {
	makeIdentity: function() {
		return this.make(0, 0, 0, 1);
	},

	make: function(x, y, z, w) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;
	},

	copy: function(quat) {
		this.x = quat.x;
		this.y = quat.y;
		this.z = quat.z;
		this.w = quat.w;

		return this;
	},

	dot: function(quat) {
		return this.x * quat.x + this.y * quat.y + this.z * quat.z + this.w * quat.w;
	},

	length: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	},

	lengthSquared: function() {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	},

	conjugate: function() {
		var tempQuat = new Quaternion();
		tempQuat.x = -this.x;
		tempQuat.y = -this.y;
		tempQuat.z = -this.z;
		tempQuat.w = this.w;

		tempQuat.normalize();

		return tempQuat;
	},

	normalize: function() {
		var quatLenght = this.length();

		if (quatLenght === 0) {
			this.makeIdentity();
		}
		else {
			quatLenght = 1 / quatLenght;

			this.x *= quatLenght;
			this.y *= quatLenght;
			this.z *= quatLenght;
			this.w *= quatLenght;
		}

		return this;
	},

	multiply: function(quat) {
		this.x = this.w * quat.x + this.x * quat.w + this.y * quat.z - this.z * quat.y;
		this.y = this.w * quat.y + this.y * quat.w + this.z * quat.x - this.x * quat.z;
		this.z = this.w * quat.z + this.z * quat.w + this.x * quat.y - this.y * quat.x;
		this.w = this.w * quat.w - this.x * quat.x - this.y * quat.y - this.z * quat.z;

		return this.normalize();
	},

	divide: function(quat) {
		var d = 1 / quat.lengthSquared();

		this.x = (this.x * quat.w - this.w * quat.x - this.y * quat.z + this.z * quat.y) * d;
		this.y = (this.x * quat.z - this.w * quat.y + this.y * quat.w - this.z * quat.x) * d;
		this.z = (this.y * quat.x + this.z * quat.w - this.w * quat.z - this.x * quat.y) * d;
		this.w = (this.w * quat.w + this.x * quat.x + this.y * quat.y + this.z * quat.z) * d;

		return this;
	},

	quaternionToMatrix: function() {
		return new Matrix4x3().make(
			1 - 2 * (this.y * this.y + this.z * this.z),
			2 * (this.x * this.y + this.w * this.z),
			2 * (this.x * this.z - this.w * this.y),

			2 * (this.x * this.y - this.w * this.z),
			1 - 2 * (this.x * this.x + this.z * this.z),
			2 * (this.y * this.z + this.w * this.x),

			2 * (this.x * this.z + this.w * this.y),
			2 * (this.y * this.z - this.w * this.x),
			1 - 2 * (this.x * this.x + this.y * this.y),

			0, 0, 0);
	},

	getPitch: function() { // X, attitude
		if (this.x * this.y + this.z * this.w === 0.5)
			return 0;
		else if (this.x * this.y + this.z * this.w === -0.5)
			return 0;
		return Math.atan2(2 * (this.x * this.w - this.y * this.z), 1 - 2 * this.x * this.x - 2 * this.z * this.z);
	},

	getYaw: function() { // Y, heading
		if (this.x * this.y + this.z * this.w === 0.5)
			return 2 * Math.atan2(this.z, this.w);
		else if (this.x * this.y + this.z * this.w === -0.5)
			return 2 * Math.atan2(this.z, this.w);
		return Math.atan2(2 * (this.y * this.w - this.x * this.z), 1 - 2 * this.y * this.y - 2 * this.z * this.z);
	},

	getRoll: function() { // Z, bank
		return Math.asin(-2 * (this.x *  this.y + this.z * this.w));
	},

	returnEuler: function() {
		var vecOut = new vec3();

		vecOut.x = this.getPitch();
		vecOut.y = this.getYaw();
		vecOut.z = this.getRoll();

		return vecOut;
	},

	axisToQuaternion: function(angle, axis) {
		var sinA = Math.sin(angle/2);
		
		axis.normalize();

		this.x = (axis.x * sinA);
		this.y = (axis.y * sinA);
		this.z = (axis.z * sinA);
		this.w = Math.cos(angle/2);

		return this;
	},

	pitchYawRollToQuaternion: function(pitch, yaw, roll) {
		var hYaw = yaw * 0.5;
		var hPitch = pitch * 0.5;
		var hRoll = roll * 0.5;

		this.x = ((Math.cos(hYaw) * Math.sin(hPitch)) * Math.cos(hRoll)) + ((Math.sin(hYaw) * Math.cos(hPitch)) * Math.sin(hRoll));
		this.y = ((Math.sin(hYaw) * Math.cos(hPitch)) * Math.cos(hRoll)) - ((Math.cos(hYaw) * Math.sin(hPitch)) * Math.sin(hRoll));
		this.z = ((Math.cos(hYaw) * Math.cos(hPitch)) * Math.sin(hRoll)) - ((Math.sin(hYaw) * Math.sin(hPitch)) * Math.cos(hRoll));
		this.w = ((Math.cos(hYaw) * Math.cos(hPitch)) * Math.cos(hRoll)) + ((Math.sin(hYaw) * Math.sin(hPitch)) * Math.sin(hRoll));

		return this.normalize();
	},

	EulerToQuaternion: function(vec) {
		var hYaw = vec.x * 0.5;
		var hPitch = vec.y * 0.5;
		var hRoll = vec.z * 0.5;

		this.x = ((Math.cos(hYaw) * Math.sin(hPitch)) * Math.cos(hRoll)) + ((Math.sin(hYaw) * Math.cos(hPitch)) * Math.sin(hRoll));
		this.y = ((Math.sin(hYaw) * Math.cos(hPitch)) * Math.cos(hRoll)) - ((Math.cos(hYaw) * Math.sin(hPitch)) * Math.sin(hRoll));
		this.z = ((Math.cos(hYaw) * Math.cos(hPitch)) * Math.sin(hRoll)) - ((Math.sin(hYaw) * Math.sin(hPitch)) * Math.cos(hRoll));
		this.w = ((Math.cos(hYaw) * Math.cos(hPitch)) * Math.cos(hRoll)) + ((Math.sin(hYaw) * Math.sin(hPitch)) * Math.sin(hRoll));

		return this.normalize();
	},

	matrixToQuaternion: function(m) { // FIX IT
		this.w = Math.sqrt(Math.max(0, 1 + m.element[0] + m.element[5] + m.element[10])/2);
		this.x = Math.sqrt(Math.max(0, 1 + m.element[0] - m.element[5] - m.element[10])/2);
		this.y = Math.sqrt(Math.max(0, 1 - m.element[0] + m.element[5] - m.element[10])/2);
		this.z = Math.sqrt(Math.max(0, 1 - m.element[0] - m.element[5] + m.element[10])/2);

		this.x = (m.element[6] - m.element[9] < 0) != (this.x < 0) ? -this.x : this.x;
		this.y = (m.element[8] - m.element[2] < 0) != (this.y < 0) ? -this.y : this.y;
		this.z = (m.element[1] - m.element[4] < 0) != (this.z < 0) ? -this.z : this.z;

		return this.normalize();
	},

	// http://nic-gamedev.blogspot.com/2011/11/quaternion-math-getting-local-axis.html
	getForwardVector: function() {
		var outVector = new vec3();

		outVector.x = 2 * (this.x * this.z + this.w * this.y);
		outVector.y = 2 * (this.y * this.z - this.w * this.x);
		outVector.z = 1 - 2 * (this.x * this.x + this.y * this.y);

		return outVector.normalize();
	},

	getBackwardVector: function() {
		var tempVec = this.getForwardVector();
		return tempVec.negate();
	},

	getUpVector: function() {
		var outVector = new vec3();

		outVector.x = 2 * (this.x * this.y - this.w * this.z);
		outVector.y = 1 - 2 * (this.x * this.x + this.z * this.z);
		outVector.z = 2 * (this.y * this.z + this.w * this.x);

		return outVector.normalize();
	},

	getRightVector: function() {
		var outVector = new vec3();

		outVector.x = 1 - 2 * (this.y * this.y + this.z * this.z);
		outVector.y = 2 * (this.x * this.y + this.w * this.z);
		outVector.z = 2 * (this.x * this.z - this.w * this.y);

		return outVector.normalize();
	},

	multiplyByVector: function(vec) {
		var outVector = new vec3();
		var qtv = new Quaternion();

		qtv.x = this.w * vec.x + this.y * vec.z - this.z * vec.y;
		qtv.y = this.w * vec.y + this.z * vec.x - this.x * vec.z;
		qtv.z = this.w * vec.z + this.x * vec.y - this.y * vec.x;
		qtv.w = -this.x * vec.x - this.y * vec.y - this.z * vec.z;

		outVector.x = qtv.x * this.w + qtv.w * (-this.x) + qtv.y * (-this.z) - qtv.z * (-this.y);
		outVector.y = qtv.y * this.w + qtv.w * (-this.y) + qtv.z * (-this.x) - qtv.x * (-this.z);
		outVector.z = qtv.z * this.w + qtv.w * (-this.z) + qtv.x * (-this.y) - qtv.y * (-this.x);

		outVector.normalize();

		return outVector;
	},

	setX: function(pitch) {
		var angle = pitch * 0.5;
		this.x = Math.sin(angle);
		this.y = 0;
		this.z = 0;
		this.w = Math.cos(angle);

		return this;
	},

	setY: function(yaw) {
		var angle = yaw * 0.5;
		this.x = 0;
		this.y = Math.sin(angle);
		this.z = 0;
		this.w = Math.cos(angle);

		return this;
	},

	setZ: function(roll) {
		var angle = roll * 0.5;
		this.x = 0;
		this.y = 0;
		this.z = Math.sin(angle);
		this.w = Math.cos(angle);

		return this;
	},

	// http://physicsforgames.blogspot.com/2010/02/quaternions.html @QuatBlend()
	lerp: function(q0, q1, blend) {
		var dot = q0.dot(q1);
		var blendInv = 1 - blend;

		if (dot < 0) {
			this.x = blendInv * q0.x + blend * (-q1.x);
			this.y = blendInv * q0.y + blend * (-q1.y);
			this.z = blendInv * q0.z + blend * (-q1.z);
			this.w = blendInv * q0.w + blend * (-q1.w);
		}
		else {
			this.x = blendInv * q0.x + blend * q1.x;
			this.y = blendInv * q0.y + blend * q1.y;
			this.z = blendInv * q0.z + blend * q1.z;
			this.w = blendInv * q0.w + blend * q1.w;
		}

		return this;
	},

	nlerp: function(q0, q1, blend) {
		this.lerp(q0, q1, blend);
		return this.normalize();
	},

	slerp: function(q0, q1, blend) {
		var cosHalfTheta = q0.dot(q1);

		if (cosHalfTheta < 0) {
			this.x = -q1.x;
			this.y = -q1.y;
			this.z = -q1.z;
			this.w = -q1.w;
			cosHalfTheta = -cosHalfTheta;
		}
		else {
			this.copy(q1);
		}

		if (Math.abs(cosHalfTheta) >= 1.0) {
			this.x = q0.x;
			this.y = q0.y;
			this.z = q0.z;
			this.w = q0.w;

			return this;
		}

		var halfTheta = Math.acos(cosHalfTheta),
			sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

		if (Math.abs(sinHalfTheta) < 0.001) {

			this.w = 0.5 * (q0.w + q1.w);
			this.x = 0.5 * (q0.x + q1.x);
			this.y = 0.5 * (q0.y + q1.y);
			this.z = 0.5 * (q0.z + q1.z);

			return this;
		}

		var ratioA = Math.sin((1 - blend) * halfTheta ) / sinHalfTheta,
			ratioB = Math.sin(blend * halfTheta) / sinHalfTheta;

		this.w = (q0.w * ratioA + this.w * ratioB);
		this.x = (q0.x * ratioA + this.x * ratioB);
		this.y = (q0.y * ratioA + this.y * ratioB);
		this.z = (q0.z * ratioA + this.z * ratioB);

		return this;
	},

	// http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final
	twoVecToQuat: function(v0, v1) {
		var norm_U_norm_V = Math.sqrt(v0.dot(v0) * v1.dot(v1));
		var real_part = norm_U_norm_V + v0.dot(v1);
		var tempVec = new vec3();

		// If vectors are exactly opposite
		if (real_part < 1.0e-06 * norm_U_norm_V) {
			real_part = 0;
			tempVec = Math.abs(v0.x) > Math.abs(v0.z)	? new tempVec().make(-v0.y, v0.x, 0)
														: new tempVec().make(0, -v0.z, v0.y);
		}
		else {
			tempVec = v0.cross(v1);
		}

		this.x = tempVec.x;
		this.y = tempVec.y;
		this.z = tempVec.z;
		this.w = real_part;

		return this.normalize();
	},

	toString: function() {
		return 'x: ' + this.x + ' y: ' + this.y + ' z: ' + this.z + ' w: ' + this.w;
	},

	lookBack: function() {
		var tempQuat = new Quaternion();
		tempQuat.make(0, 1, 0, 0);

		this.copy(tempQuat.multiply(this));

		return this;
	},

	twoQuatToAngle: function(quat) {
		var v0 = new vec3().make(this.x, this.y, this.z);
		var v1 = new vec3().make(quat.x, quat.y, quat.z);
		var v0L = v0.length();
		var v1L = v1.length();

		return Math.acos((v0.dot(v1)) / v0L.multiply(v1L)) / 2;
	},
};

///////////////////////////////////////////////////////////////////////////////
// --- MATH LIBRARY EXTENSION -------------------------------------------------

(function(){
	Math.clamp = function(value, min, max) {
		return Math.min(Math.max(value, min), max);
	};
})();

(function(){
	Math.getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};
})();

(function(){
	Math.areVectorsSimilar = function(vec1, vec2) {
		var epsilon = 0.0001;

		if (vec1.x > vec2.x) {
			if (Math.abs(vec1.x - vec2.x) > epsilon)
				return false;
		}
		else {
			if (Math.abs(vec2.x - vec1.x) > epsilon)
				return false;
		}

		if (vec1.y > vec2.y) {
			if (Math.abs(vec1.y - vec2.y) > epsilon)
				return false;
		}
		else {
			if (Math.abs(vec2.y - vec1.y) > epsilon)
				return false;
		}

		if (vec1.z > vec2.z) {
			if (Math.abs(vec1.z - vec2.z) > epsilon)
				return false;
		}
		else {
			if (Math.abs(vec2.z - vec1.z) > epsilon)
				return false;
		}

		return true;
	};
})();

(function(){
	Math.areScalarsSimilar = function(n1, n2) {
		var epsilon = 0.0001;

		if (n1 > n2) {
			if (Math.abs(n1 - n2) > epsilon)
				return false;
		}
		else {
			if (Math.abs(n2 - n1) > epsilon)
				return false;
		}

		return true;
	};
})();

(function(){
	Math.degToRad = function(degrees) {
		return degrees * Math.PI / 180;
	};
})();