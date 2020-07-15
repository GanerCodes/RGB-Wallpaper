window.onload=(e)=>{}
//window.wallpaperRegisterAudioListener(wallpaperAudioListener);

var width = window.innerWidth;
var height = window.innerHeight;
var img, img2;
var barLoc = 0, barSpeed = 1;
var mx = 0, my = 0;
var px = 0, py = 0;
var timer = 0;

var ring = {
	defaultSize: 450,
	size: 450,
	x: 0,
	xVel: 0.05,
	sizeDiff: 50,
	rotation: 0,
	rotationSpeed: 2 * Math.PI / (240 / 2),
	adj: function() {
		this.rotation += this.rotationSpeed;
		if(this.sizeDiff > 3) { 
			this.x += this.xVel / 2;
			if(this.x > Math.PI || this.x < -Math.PI) {
				this.xVel = Math.sign(-this.x) * abs(this.xVel);
			}
			this.size = this.defaultSize + this.sizeDiff / 2 * Math.cos(this.x);
		}else{
			this.size = this.defaultSize;
			this.sizeDiff = 4;
		}
		
	}
}

window.wallpaperPropertyListener = {
	applyUserProperties: function(properties) {
		if (properties.mouse) {
			mx = properties.mouse.value.x;
			my = properties.mouse.value.y;
		}
	}
}

function preload() {
	img  = loadImage("http://files.ganer.xyz/Usefull%20things/line.png");
	img2 = loadImage("http://files.ganer.xyz/Usefull%20things/ring.png");
}
function crazyLine(x1, y1, x2, y2, seg, offset) {
  for(var d = 1; d < seg + 1; d++) {
	var d1s = (d - 1) / seg;
	var ds = d / seg;
	stroke(abs(map(d, 1, seg + 1, 255, 0) + offset) % 255, 255, 255);
    line(
		lerp(x1, x2, d1s), 
		lerp(y1, y2, d1s), 
		lerp(x1, x2, ds), 
		lerp(y1, y2, ds)
	);
  }
}
function setup() {
	createCanvas(window.innerWidth, window.innerHeight, P2D);
	frameRate(240);
	colorMode(HSB, 255);
	noStroke();
}

var socket = io('http://localhost:5000');

class clickable {
	constructor(x, y, s, cmd, p) {
		this.x = x;
		this.y = y;
		this.s = s;
		this.cmd = cmd;
		this.p = p
	}
	draw(c) {
		colorMode(HSB);
		var over = false;
		if(dist(mx, my, this.x, this.y) <= this.s / 2) {
			over = true;
			if(this.p.hold && mouseIsPressed) {
				switch(this.cmd) {
					case "slow":
						ring.rotationSpeed /= 1.02;
						break;
					case "fast":
						ring.rotationSpeed *= 1.02;
						break;
					case "smaller":
						ring.defaultSize /= 1.02;
						break;
					case "bigger":
						ring.defaultSize *= 1.02;
						break;
					case "oscSmall":
						ring.sizeDiff /= 1.1;
						break;
					case "oscBig":
						ring.sizeDiff *= 1.1;
						break;
					case "oscSpeedLow":
						ring.xVel /= 1.02;
						break;
					case "oscSpeedHigh":
						ring.xVel *= 1.02;
						break;
					case "TBspeedHigh":
						barSpeed *= 1.02;
						break;
					case "TBspeedLow":
						barSpeed /= 1.02;
						break;
				}
			}
		}
		stroke(255);
		strokeWeight(3);
		if(over) {
			fill(hue(c), 52, 255);
		}else{
			fill(c);
		}
		ellipse(this.x, this.y, this.s + over * 15, this.s + over * 15);
		if(this.p.txt) {
			noStroke();
			fill((hue(c) + 128) % 255, 255, 32);
			textSize(255);
			textAlign(CENTER, CENTER);
			textFont("Verdana", 15);
			textSize(15);
			text(this.p.txt, this.x, this.y);
		}
	}
	check() {
		if(!this.p.hold && dist(mx, my, this.x, this.y) <= this.s / 2) {
			if(!this.p.notCmd) {
				runCommand(this.cmd);
			}else{
				
			}
		}
	}
}
function RCTRL(s) {
	return 'cd "C:/Users/Administrator/Desktop/RGB Stuff/RGB Wallpaper/application.windows64" & interface.exe '+s;
}

var clicks = [
	new clickable(75 , 0*100+75, 80, "some command here", {txt: "epic label"})
]

var strk = 5;

function draw() {
	timer++;
	barLoc += barSpeed;
	noStroke();
	background(0);
	strokeWeight(strk);
	var bl = map((7.5 * barLoc) % width, 0, 1920, 0, 255);
	crazyLine(width - strk / 2, strk / 2, width - strk / 2, height - 40, 50, 255 - bl);
	crazyLine(strk / 2, height - 40, strk / 2, strk / 2, 50, 255 - bl);
	crazyLine(strk / 2, strk / 2, width - strk / 2, strk / 2, 50, 255 - bl);
	noStroke();
	push();
	var nx = lerp(px, mx, 0.2)
	var ny = lerp(py, my, 0.2)
	
	px = nx
	py = ny
	
	imageMode(CENTER);
	
	translate((nx + (nx < 0 ? width : 0)) % width, ny);
	ring.adj();
	rotate(ring.rotation);
	image(img2, 0, 0, ring.size, ring.size);
	pop();
	
	imageMode(CORNER);
	
	image(img, (7.5 * barLoc) % width            , height - img.height);
	image(img, (7.5 * barLoc) % width - img.width, height - img.height);
	fill(0, 128);
	var h = 117.5;
	rect(width - h, height - img.height, h - strk, img.height);
	strokeWeight(2);
	stroke(255);
	line(strk + 1, height - img.height, width - strk - 1, height - img.height);
	noStroke();
	textSize(35);
	for(i of clicks) {
		i.draw(color((i.y + i.x + timer / 3) % 255, 255, 255));	
	}
}
function mouseClicked() {
	for(i of clicks) {
		i.check();
	}
}
function runCommand(command) {
	socket.emit("command", command);
}
