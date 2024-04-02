let depthSlider, colorPicker, zoomSlider, xOffsetSlider, yOffsetSlider;
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
    drawAlgebraicButton.mousePressed(() => shapeToDraw = 'algebraic');
}

function draw() {
    clear();
    let depth = depthSlider.value();
    let color = colorPicker.value();
    let zoom = zoomSlider.value();
    let xOffset = xOffsetSlider.value();
    let yOffset = yOffsetSlider.value();

    push();
    translate(width / 2 + xOffset, height / 2 + yOffset);
    scale(zoom);
    translate(-width / 2, -height / 2);

    if (shapeToDraw === 'triangle') {
        drawSeirpinskiTriangle(depth, 600, color);
    } else if (shapeToDraw === 'square') {
        drawSierpinskiSquare(depth, 600, 0, 0, color);
    } else if (shapeToDraw === 'algebraic') {
        drawAlgebraicFractal(depth, 200); // max iterations and escape radius
    }
    pop();
}
function drawAlgebraicFractal(maxIter, escapeRadius) {
    let zoom = zoomSlider.value();
    let xOffset = xOffsetSlider.value();
    let yOffset = yOffsetSlider.value();
    let colorValue = colorPicker.value();
    let r = red(colorValue);
    let g = green(colorValue);
    let b = blue(colorValue);
    let col = createVector(r / 255, g / 255, b / 255);

    loadPixels();
    for (let px = 0; px < width; px++) {
        for (let py = 0; py < height; py++) {
            let x = (px - width / 2) / (width / 4) * zoom - xOffset;
            let y = (py - height / 2) / (height / 4) * zoom - yOffset;
            let z = createVector(x, y);
            let c = z.copy();
            let iter = 0;

            while (iter < maxIter) {
                z = complex_cosh(z).add(c);
                if (z.mag() > escapeRadius) break;
                iter++;
            }

            let f = iter / maxIter;
            let colVec = createVector(col.x * f, col.y * f, col.z * f);

            let pix = (px + py * width) * 4;
            pixels[pix + 0] = colVec.x * 255;
            pixels[pix + 1] = colVec.y * 255;
            pixels[pix + 2] = colVec.z * 255;
            pixels[pix + 3] = 255;
        }
    }
    updatePixels();
}

function complex_cosh(z) {
    let real = cosh(z.x) * cos(z.y);
    let imag = sinh(z.x) * sin(z.y);
    return createVector(real, imag);
}

function cosh(val) {
    let tmp = Math.exp(val);
    return (tmp + 1.0 / tmp) / 2.0;
}

function sinh(val) {
    let tmp = Math.exp(val);
    return (tmp - 1.0 / tmp) / 2.0;
}

function drawSeirpinskiTriangle(depth, size, color) {
    console.log("drawSeirpinskiTriangle called")

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
    console.log("drawSeirpinskiTriangle exit")
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