let depthSlider, colorPicker, zoomSlider, xOffsetSlider, yOffsetSlider, customC;
let shapeToDraw = 'triangle';

function setup() {
    let canvas = createCanvas(600, 600); // Size of the canvas
    canvas.parent('myCanvasWrapper');
    depthSlider = select('#depthSlider');
    colorPicker = select('#colorPicker');
    zoomSlider = select('#zoomSlider');
    xOffsetSlider = select('#xOffsetSlider');
    yOffsetSlider = select('#yOffsetSlider');


    // Adding listeners
    let drawTriangleButton = select('#drawTriangleButton');
    drawTriangleButton.mousePressed(() => shapeToDraw = 'triangle');

    let drawSquareButton = select('#drawSquareButton');
    drawSquareButton.mousePressed(() => shapeToDraw = 'square');

    let drawAlgebraicButton = select('#drawAlgebraicButton');
    drawAlgebraicButton.mousePressed(() => {
        let cInput;
        let selectedValue = select('#inputConst').value();

        if (selectedValue === 'custom') {
            cInput = select('#customC').value();
        } else {
            cInput = selectedValue;
        }

        shapeToDraw = 'algebraic';
        customC = parseComplex(cInput);
    });
}

function draw() {
    clear();
    resetMatrix();

    let depth = depthSlider.value();
    let color = colorPicker.value();
    let zoom = zoomSlider.value();
    let xOffset = xOffsetSlider.value();
    let yOffset = yOffsetSlider.value();

    // Apply translation and scaling to zoom and move the fractal
    push();
    translate(width / 2, height / 2);
    scale(zoom);
    translate(-width / 2 - xOffset, -height / 2 - yOffset);

    if (shapeToDraw === 'triangle') {
        drawSeirpinskiTriangle(depth, 600, color);
    } else if (shapeToDraw === 'square') {
        drawSierpinskiSquare(depth, 600, 0, 0, color);
    } else if (shapeToDraw === 'algebraic') {
        drawAlgebraicFractal(depth, customC, zoom, xOffset, yOffset, color);
        // drawJuliaSet(-0.8, 0.156, zoom, xOffset, yOffset, color);
    }
    pop();
}

function drawSeirpinskiTriangle(depth, size, color) {

    if (depth === 1) {
        push();
        translate(width / 2, height / 2);
        fill(color);
        noStroke();
        equilateralTriangle(size);
        pop();
    } else {
        let newSize = size / 2;
        push();
        translate(0, -newSize / 4);
        drawSeirpinskiTriangle(depth - 1, newSize, color);
        pop();
        push();
        translate(newSize * Math.sqrt(3) / 8, newSize / 8);
        drawSeirpinskiTriangle(depth - 1, newSize, color);
        pop();
        push();
        translate(-newSize * Math.sqrt(3) / 8, newSize / 8);
        drawSeirpinskiTriangle(depth - 1, newSize, color);
        pop();
    }
}

function equilateralTriangle(size) {
    size = size / 2;
    triangle(0, -size, size * -Math.sqrt(3) / 2, size / 2, size * Math.sqrt(3) / 2, size / 2);
}

function drawSierpinskiSquare(depth, size, x, y, color) {
    if (depth === 1) {
        fill(color);
        noStroke();
        square(x, y, size);
    } else {
        let newSize = size / 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (i !== 1 || j !== 1) {
                    drawSierpinskiSquare(depth - 1, newSize, x + i * newSize, y + j * newSize, color);
                }
            }
        }
    }
}

class Complex {
    constructor(a, b) {
        this.re = a;
        this.im = b;
    }

    add(c) {
        return new Complex(this.re + c.re, this.im + c.im);
    }

    ch() {
        // Implement the hyperbolic cosine for complex numbers
        let re = Math.cosh(this.re) * Math.cos(this.im);
        let im = Math.sinh(this.re) * Math.sin(this.im);

        return new Complex(re, im);
    }

    square() {
        return new Complex(this.re * this.re - this.im * this.im, 2 * this.re * this.im);
    }

    magnitude() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }
}

function drawAlgebraicFractal(depth, c, zoom, xOffset, yOffset) {
    let maxIterations = depth;
    loadPixels();
    let color = colorPicker.value();

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let a = map(x, 0, width, -2 / zoom - (xOffset / 100), 2 / zoom - (xOffset / 100));
            let b = map(y, 0, height, -2 / zoom - (yOffset / 100), 2 / zoom - (yOffset / 100));

            let z = new Complex(a, b);
            let n = 0;

            while (n < maxIterations) {
                z = z.ch().add(c);

                if (Math.sqrt(z.re * z.re + z.im * z.im) > 16) {
                    break;
                }
                n++;
            }

            let bright = map(n, 0, maxIterations, 0, 1);

            // bright = Math.sqrt(bright) * 255;
            // bright = bright > 255 ? 255 : bright;

            bright = map(Math.sqrt(bright)*2, 0, 1, 0, 255);

            if (n === maxIterations) {
                bright = 0;
            }

            let pix = (x + y * width) * 4;
            pixels[pix + 0] = red(color);
            pixels[pix + 1] = green(color);
            pixels[pix + 2] = blue(color);
            pixels[pix + 3] = bright;
        }
    }
    updatePixels();
    // noLoop();
}

function parseComplex(cString) {
    if (!cString || typeof cString !== 'string') {
        return {re: 0, im: 0}; // Return a default value if input is invalid
    }

    let parts = cString.split('+');
    if (parts.length !== 2) {
        return {re: 0, im: 0}; // Return a default value if format is not 'a+bi'
    }

    let re = parseFloat(parts[0]);
    let im = parseFloat(parts[1].replace('i', ''));

    if (isNaN(re) || isNaN(im)) {
        return {re: 0, im: 0}; // Return a default value if parsing fails
    }

    return {re: re, im: im};
}