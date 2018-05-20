const fps = 60;
const _width = 400;
const _height = 300;
const firePixelChance = 1;
const coolingRate = 1;
const heatSourceSize = 10;
const noiseIncrement = 0.02;
const fireColor = [255, 100, 0, 255];

const bufferWidth = _width;
const bufferHeight = _height;

let buffer1;
let buffer2;
let coolingBuffer;

let ystart = 0.0;

function setup() {
    createCanvas(_width, _height);
    frameRate(fps);

    buffer1 = createGraphics(bufferWidth, bufferHeight);
    buffer2 = createGraphics(bufferWidth, bufferHeight);
    coolingBuffer = createGraphics(bufferWidth, bufferHeight);
}

// Draw a line at the bottom
function heatSource(buffer, rows, _color) {
    const start = bufferHeight - rows;
    for (let x = 0; x < bufferWidth; x++) {
        for (let y = start; y < bufferHeight; y++) {
            if(Math.random() >= firePixelChance)
                continue;

            buffer.pixels[(x + (y * bufferWidth)) * 4] = _color[0];    // Red
            buffer.pixels[(x + (y * bufferWidth)) * 4 +1] = _color[1]; // Green
            buffer.pixels[(x + (y * bufferWidth)) * 4 +2] = _color[2]; // Blue
            buffer.pixels[(x + (y * bufferWidth)) * 4 +3] = 255;       // Alpha
        }
    }
}

// Produces the 'smoke'
function coolingMap(buffer){
    let xoff = 0.0;
    for(x = 0; x < bufferWidth; x++){
        xoff += noiseIncrement;
        yoff = ystart;
        for(y = 0; y < bufferHeight; y++){
            yoff += noiseIncrement;
            n = noise(xoff, yoff);
            bright = pow(n, 3) * 20;
            buffer.pixels[(x + (y * bufferWidth)) * 4] = bright;
            buffer.pixels[(x + (y * bufferWidth)) * 4 +1] = bright;
            buffer.pixels[(x + (y * bufferWidth)) * 4 +2] = bright;
            buffer.pixels[(x + (y * bufferWidth)) * 4 +3] = bright;
        }
    }

    ystart += noiseIncrement;
}

// Change color of a pixel so it looks like its smooth
function smoothing(buffer, _buffer2, _coolingBuffer) {
    for (let x = 0; x < bufferWidth; x++) {
        for (let y = 0; y < bufferHeight; y++) {
            // Get all 4 neighbouring pixels
            const left = getColorFromPixelPosition(x+1,y,buffer.pixels);
            const right = getColorFromPixelPosition(x-1,y,buffer.pixels);
            const bottom = getColorFromPixelPosition(x,y+1,buffer.pixels);
            const top = getColorFromPixelPosition(x,y-1,buffer.pixels);

            // Set this pixel to the average of those neighbours
            let sumRed = left[0] + right[0] + bottom[0] + top[0];
            let sumGreen = left[1] + right[1] + bottom[1] + top[1];
            let sumBlue = left[2] + right[2] + bottom[2] + top[2];
            let sumAlpha = left[3] + right[3] + bottom[3] + top[3];

            // "Cool down" color
            const coolingMapColor = getColorFromPixelPosition(x,y,_coolingBuffer.pixels)
            sumRed = (sumRed / 4) - (Math.random() * coolingRate) - coolingMapColor[0];
            sumGreen = (sumGreen / 4) - (Math.random() * coolingRate) - coolingMapColor[1];
            sumBlue = (sumBlue / 4) - (Math.random() * coolingRate) - coolingMapColor[2];
            sumAlpha = (sumAlpha / 4) - (Math.random() * coolingRate) - coolingMapColor[3];

            // Make sure we dont get negative numbers
            sumRed = sumRed > 0 ? sumRed : 0;
            sumGreen = sumGreen > 0 ? sumGreen : 0;
            sumBlue = sumBlue > 0 ? sumBlue : 0;
            sumAlpha = sumAlpha > 0 ? sumAlpha : 0;
            
            // Update this pixel
            _buffer2.pixels[(x + ((y-1) * bufferWidth)) * 4] = sumRed;         // Red
            _buffer2.pixels[(x + ((y-1) * bufferWidth)) * 4 +1] = sumGreen;    // Green
            _buffer2.pixels[(x + ((y-1) * bufferWidth)) * 4 +2] = sumBlue;     // Blue
            _buffer2.pixels[(x + ((y-1) * bufferWidth)) * 4 +3] = sumAlpha;    // Alpha
        }
    }
}

function draw() {
    background(0);
    text("FPS: "+Math.floor(frameRate()), 10, 20);
    fill(0,255,0,255);

    buffer1.loadPixels();
    buffer2.loadPixels();
    coolingBuffer.loadPixels();

    heatSource(buffer1, heatSourceSize, fireColor);
    coolingMap(coolingBuffer);
    smoothing(buffer1, buffer2, coolingBuffer);

    buffer1.updatePixels();
    buffer2.updatePixels();
    coolingBuffer.updatePixels();

    let temp = buffer1;
    buffer1 = buffer2;
    buffer2 = temp;

    image(buffer2, 0, 0); // Draw buffer to screen
    // image(coolingBuffer, 0, bufferHeight); // Draw buffer to screen
}

function mousePressed() {
    buffer1.fill(fireColor);
    buffer1.noStroke();
    buffer1.ellipse(mouseX, mouseY, 100, 100); 
}

function getColorFromPixelPosition(x, y, pixels) {
    let _color = [];
    for (let i = 0; i < 4; i++)
        _color[i] = pixels[(x + (y * bufferWidth)) * 4 + i];
    return _color;
}

function getRandomColorValue() {
    return Math.floor(Math.random() * 255);
}