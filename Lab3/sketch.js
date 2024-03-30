let depthSlider, colorPicker, zoomSlider;
let shapeToDraw = 'triangle'; // Default shape


function setup() {
    let canvas = createCanvas(600, 600); // Size of the canvas
    canvas.parent('myCanvasWrapper');
    depthSlider = select('#depthSlider');
    colorPicker = select('#colorPicker');
    zoomSlider = select('#zoomSlider');

    // Adding listeners
    let drawTriangleButton = select('#drawTriangleButton');
    drawTriangleButton.mousePressed(() => shapeToDraw = 'triangle');

    let drawSquareButton = select('#drawSquareButton');
    drawSquareButton.mousePressed(() => shapeToDraw = 'square');
}

function draw() {
    clear();
    let depth = depthSlider.value();
    let color = colorPicker.value();
    let zoom = zoomSlider.value();

    // Apply zoom by scaling the canvas
    push();
    translate(width / 2, height / 2); // Move to center of canvas
    scale(zoom); // Scale the drawing
    translate(-width / 2, -height / 2); // Move back to top left corner

    // drawSeirpinskiTriangle(depth, 600, color);
    if (shapeToDraw === 'triangle') {
        drawSeirpinskiTriangle(depth, 600, color);
    } else if (shapeToDraw === 'square') {
        drawSierpinskiSquare(depth, 600, 0, 0, color);
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
        fill(color); // Use the passed color
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