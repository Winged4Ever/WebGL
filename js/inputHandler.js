///////////////////////////////////////////////////////////////////////////////
// --- MOUSE HANDLER ----------------------------------------------------------

var mouseDown = false,
	lastMouseX = 0,
	lastMouseY = 0;

function handleMouseDown(event) {

	mouseDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;

}

function handleMouseUp(event) {

	mouseDown = false;
}

var sensitivity = 5;
function handleMouseMove(event) {

	if (!mouseDown) {
		return;
	}

	var deltaX = event.clientX - lastMouseX,
		deltaY = event.clientY - lastMouseY;

		deltaX = Math.degToRad(deltaX * sensitivity * deltaT);
		deltaY = Math.degToRad(deltaY * sensitivity * deltaT);
	
	if (deltaX !== 0 || deltaY !== 0) {
		if (camera.useQuaternions) {
			camera.rotateCamera(deltaX, deltaY);
		}
	}

	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}

///////////////////////////////////////////////////////////////////////////////
// --- KEYBOARD HANDLER -------------------------------------------------------

handleKeypad = function() {

	var activeActions = {};
	var keyMappings = {	'37' : 'panleft',	// Left arrow
						'65' : 'panleft',	// A
						'38' : 'panup',		// Up arrow
						'87' : 'panup',		// W
						'39' : 'panright',	// Right arrow
						'68' : 'panright',	// D
						'40' : 'pandown',	// Down arrow
						'83' : 'pandown',	// S
						'16' : 'shift',		// Shift
						'33' : 'pgup',		// Page UP
						'34' : 'pgdown',	// Page DOWN
						'49' : 'one',		// 1
						'97' : 'one',		// numpad 1
						'50' : 'two',		// 2
						'98' : 'two',		// numpad 2
						'51' : 'three',		// 3
						'99' : 'three',		// numpad 3
						'52' : 'four',		// 4
						'100': 'four',		// numpad 4
						'53' : 'five',		// 5
						'101': 'five',		// numpad 5
						'54' : 'six',		// 6
						'102': 'six',		// numpad 6
						'55' : 'seven',		// 7
						'103': 'seven',	// numpad 7
						'56' : 'eight',		// 8
						'104': 'eight',	// numpad 8
						'57' : 'nine',		// 9
						'05' : 'nine',		// numpad 9
						'58' : 'zero',		// 0
						'106': 'zero'		// numpad 0

	};
	// Turn of all active keypress actions
	for (var k in keyMappings) {
		activeActions[keyMappings[k]] = false;
	}

	// What to do when a key is pressed
	window.onkeydown = function(event) {
		var keyCode = event.keyCode.toString();
		// If found a proper key pressed
		if (keyMappings.hasOwnProperty(keyCode)) {
			// Turn on pertaining action
			activeActions[keyMappings[keyCode]] = true;
			// If not already performing an action
		}
	};

	// What to do if key is released
	window.onkeyup = function(event) {
		var keyCode = event.keyCode.toString();
		// If found a proper key pressed
		if (keyMappings.hasOwnProperty(keyCode)) {
			// Turn off action performing
			activeActions[keyMappings[keyCode]] = false;
		}
		// Check if there are any active actions
		for (var j in keyMappings) {
			// If any action is still active, keep going
			if (activeActions[keyMappings[j]]) {
				return;
			}
		}
	};

	return activeActions;
};