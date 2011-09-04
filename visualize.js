var plask = require('plask');

plask.simpleWindow({
	settings: {
		width: 800,
		height: 800
	},
	
	init: function() {
		this.framerate(60);
		
		this.center = {
			x: this.canvas.width/2, 
			y: this.canvas.height/2
		};
		
		// Information about what notes have been pressed and at what intensity
		this.keysPressed = {};
		
		// These are kind of arbitrary based on the keyboard you are using
		this.startKey = 36; // The value the keyboard sends when you press the first note
		this.numKeys = 61; // The total number of keys on the keyboard
		
		this.paint.setStyle(this.paint.kFillStyle);
		this.paint.setFlags(this.paint.kAntiAliasFlag);
		
		// Configure keyboard events
		var midi = new plask.MidiIn(),
		    sources = midi.sources();
		
		midi.openSource(0);  // Connect to the first MIDI source
		
		/*
		 * We want to alter the this.keysPressed object inside the noteOn event.
		 * But this.keysPressed will refer to midi.keysPressed instead of 
		 * plask.keysPressed, so we have to introduce a new scope.
		 */
		(function(keysPressed) {
			midi.on('noteOn', function(keyEvent) {
				// My keyboard doesn't send a noteOff event,
				// instead it sends a noteOn event with velocity = 0
				if (keyEvent.vel == 0) {
					delete keysPressed[keyEvent.note];
				}
				else {
					keysPressed[keyEvent.note] = {
						'note': keyEvent.note,
						'vel': keyEvent.vel,
						'frames': 0
					};
				}
			});
		})(this.keysPressed);
	},
	
	draw: function() {
		// Clear the canvas with a less then full opacity to give drawings a fading effect
		this.canvas.drawColor(230, 230, 230, 100);
		
		// We'll use the number of frames a key has been pressed in animations
		for (var key in this.keysPressed)
			this.keysPressed[key].frames++;
		
		// Configure the polygon
		var radius = 100 + Math.sin(this.frametime/2) * 5,
		    path = new plask.SkPath();
		
		path.moveTo(this.center.x + radius, this.center.y);
		
		var rotationAngle = plask.k2PI / this.numKeys, 
		    currentAngle = 0, 
		    spikeHeight = 0;
		
		// Calculate polygon geometry
		for (var i = 0; i < this.numKeys; i++) {
			var key = this.keysPressed[36 + i];
			
			if (key)
				spikeHeight = key.vel + 100 - key.frames / 2;
			
			if (!key || spikeHeight < 0)
				spikeHeight = 0;
				
			currentAngle = i * rotationAngle;
			
			path.lineTo(this.center.x + Math.cos(currentAngle)*(radius+spikeHeight),
						this.center.y + Math.sin(currentAngle)*(radius+spikeHeight));
		}
		
		path.close();
		
		// Draw polygon
		this.paint.setColor(200, 50, 50, 200 + Math.sin(this.frametime/2) * 10);
		this.canvas.drawPath(this.paint, path);
	}
});