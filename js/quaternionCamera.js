///////////////////////////////////////////////////////////////////////////////
// --- QUATERNION CAMERA CLASS ------------------------------------------------

function QuaternionCamera() {
	this.position = new vec3();
	this.rotation = new Quaternion();

	this.yaw = 0;
	this.pitch = 0;

	this.tempVec = new vec3();
	this.tempQuat = new Quaternion();

	this.useQuaternions = true;
	this.FPSmode = true;

	this.t1 = 0.0;
	this.t2 = 0.0;

	document.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
}

QuaternionCamera.prototype = {
	moveCamera: function(elapsed) {
		if (keypad.panup) {
			this.tempVec = this.rotation.getForwardVector();
			this.position.addSelf(this.tempVec.multiplyByScalar(-elapsed));
			MVMatrix.setTranslation(this.position);
		}
		if (keypad.pandown) {
			this.tempVec = this.rotation.getForwardVector();
			this.position.addSelf(this.tempVec.multiplyByScalar(elapsed));
			MVMatrix.setTranslation(this.position);
		}
		if (keypad.panleft) {
			this.tempVec = this.rotation.getRightVector();
			this.position.addSelf(this.tempVec.multiplyByScalar(-elapsed));
			MVMatrix.setTranslation(this.position);
		}
		if (keypad.panright) {
			this.tempVec = this.rotation.getRightVector();
			this.position.addSelf(this.tempVec.multiplyByScalar(elapsed));
			MVMatrix.setTranslation(this.position);
		}
		if (keypad.pgdown) {
			this.tempVec = this.rotation.getUpVector();
			this.position.addSelf(this.tempVec.multiplyByScalar(-elapsed));
			MVMatrix.setTranslation(this.position);
		}
		if (keypad.pgup) {
			this.tempVec = this.rotation.getUpVector();
			this.position.addSelf(this.tempVec.multiplyByScalar(elapsed));
			MVMatrix.setTranslation(this.position);
		}
	},

	rotateCamera: function(radX, radY) {
		if (this.FPSmode === true) {
			if (radY !== 0) {
				this.pitch += radY;
				// Prevent camera from flipping upside-down (constrained by vertical "plane")
				this.pitch = Math.clamp(this.pitch, -Math.PI/2, Math.PI/2);
			}
			if (radX !== 0) {
				this.yaw += radX;
				// Cancel unnecessary looping rotation degree
				if (this.yaw <= -2 * Math.PI)
					this.yaw = 0;
				else if (this.yaw >= 2 * Math.PI)
					this.yaw = 0;
			}

			this.rotation.pitchYawRollToQuaternion(this.pitch, this.yaw, 0);
		}
		else {
			if (radY !== 0) {
				this.rotation.multiply(this.tempQuat.axisToQuaternion(radY, rightVec()));
			}
			if (radX !== 0) {
				this.rotation.multiply(this.tempQuat.axisToQuaternion(radX, upVec()));
			}
		}

		MVMatrix.setRotation(this.rotation.quaternionToMatrix());
	},

	rotateTowards: function(target, angularSpeed) { // TODO
		// If is on the same position
		if (this.position.isEqual(target)) {
			return;
		}

		var vecStart = this.rotation.getForwardVector();
		var vecTarget = this.position.sub(target).normalize();
		var angleLeft = Math.acos(vecStart.dot(vecTarget));
		var fullAngle = angularSpeed * deltaT;

		// If already rotated towards the target
		if (Math.areScalarsSimilar(angleLeft, 0)) {
			return;
		}
		// If vectors are opposite
		else if (Math.areScalarsSimilar(angleLeft, Math.PI)) {
			// Turn around up-axis
			this.rotation.multiply(new Quaternion().axisToQuaternion(fullAngle, upVec()));
		}
		// If vectors casually differs
		else {
			var rotAxis = vecStart.cross(vecTarget);

			// If able to make another full rotation step
			if (angleLeft > fullAngle) {
				this.tempQuat.axisToQuaternion(fullAngle, rotAxis);
				this.pitch += this.tempQuat.getPitch();
				this.yaw += this.tempQuat.getYaw();
				this.adjustAngles();
				this.rotation.pitchYawRollToQuaternion(this.pitch, this.yaw, 0);
				log(vecStart.toString());
			}
			// If the angle left is smaller than the angular speed
			else {
				// Set the final rotation
				this.tempQuat.axisToQuaternion(angleLeft, rotAxis);
				this.pitch += this.tempQuat.getPitch();
				this.yaw += this.tempQuat.getYaw();
				this.adjustAngles();
				this.rotation.pitchYawRollToQuaternion(this.pitch, this.yaw, 0);
			}
		}

		MVMatrix.setRotation(this.rotation.quaternionToMatrix());
	},

	adjustAngles: function() {
		this.pitch = Math.clamp(this.pitch, -Math.PI/2, Math.PI/2);

		if (this.yaw <= -2 * Math.PI)
			this.yaw = 0;
		else if (this.yaw >= 2 * Math.PI)
			this.yaw = 0;
	},

	lookAt: function(at) {
		if (this.position.isEqual(at)) {
			return;
		}
		var zAxis = this.position.sub(at).normalize();
		var up = upVec(); // World's up vector will unroll the camera by itself
		var xAxis = up.cross(zAxis).normalize();
		var yAxis = zAxis.cross(xAxis);
		MVMatrix.make(
			xAxis.x,			xAxis.y,			xAxis.z,
			yAxis.x,			yAxis.y,			yAxis.z,
			zAxis.x,			zAxis.y,			zAxis.z,
			this.position.x,	this.position.y,	this.position.z);

		this.rotation.matrixToQuaternion(MVMatrix);
		this.pitch = this.rotation.getPitch();
		this.yaw = this.rotation.getYaw();
		this.adjustAngles();
	},
};