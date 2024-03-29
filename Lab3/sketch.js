function setup() {
    let canvas = createCanvas(600,600);
    background('blue');
    drawSeirpinskiTriangle(5, 600);
}

function drawSeirpinskiTriangle(depth, size) {
    if(depth === 1) {
        push();
        translate(width/2, height/2);
        fill('pink');
        noStroke();
        equilateralTriangle(size);
        pop();
    } else {
        push();
        translate(0, -size/4);
        drawSeirpinskiTriangle(depth-1, size/2);
        pop();
        push();
        translate(size * Math.sqrt(3)/8, size/8);
        drawSeirpinskiTriangle(depth-1, size/2);
        pop();
        push();
        translate(-size * Math.sqrt(3)/8, size/8);
        drawSeirpinskiTriangle(depth-1, size/2);
        pop();
    }
}

function equilateralTriangle(size) {
    size = size / 2;
    triangle(0, -size, size * -Math.sqrt(3)/2, size/2, size * Math.sqrt(3)/2, size/2);
}