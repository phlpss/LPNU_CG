let depthSlider, colorPicker, zoomSlider, xOffsetSlider, yOffsetSlider, c;

function setup() {
    let canvas = createCanvas(800, 500);
    canvas.parent('myCanvasWrapper');
    depthSlider = select('#depthSlider');
    colorPicker = select('#colorPicker');
    zoomSlider = select('#zoomSlider');
    xOffsetSlider = select('#xOffsetSlider');
    yOffsetSlider = select('#yOffsetSlider');

    let inputConst = select('#inputConst');
    inputConst.changed(() => updateConstant(inputConst.value()));
    updateConstant(inputConst.value());

    let drawAlgebraicButton = select('#drawAlgebraicButton');
    drawAlgebraicButton.mousePressed(() => {
        let cInput

        if (inputConst.value() === 'custom') {
            cInput = select('#customC').value();
        } else {
            cInput = inputConst.value();
        }

        c = parseComplex(cInput);
        // draw();
    });

    pixelDensity(1);
    // noLoop();
}

function updateConstant(val) {
    if (val === 'custom') {
        c = parseComplex(select('#customC').value());
    } else {
        c = parseComplex(val); // val is already a string, no need for toString()
    }

    // Check if c is correctly set
    if (!c || typeof c !== 'object' || isNaN(c.re) || isNaN(c.im)) {
        c = { re: 0, im: 0 }; // Fallback to a default value if c is not set properly
    }
}

function draw() {
    clear();
    background(0);
    console.log("draw() called")

    // Use zoomSlider to adjust the zoom level
    const zoom = zoomSlider.value();
    const w = 4 / zoom; // Adjusting for zoom
    const h = (w * height) / width;

    // Use xOffsetSlider and yOffsetSlider for offsetting
    const xOffset = xOffsetSlider.value() / 100;
    const yOffset = yOffsetSlider.value() / 100;

    // Adjust starting points based on offsets
    const xmin = -w / 2 + xOffset;
    const ymin = -h / 2 + yOffset;

    // Use depthSlider to adjust the number of iterations
    const maxiterations = depthSlider.value();

    loadPixels();

    // Dynamic range adjustment based on zoom and offset
    const xmax = xmin + w;
    const ymax = ymin + h;

    // Calculate pixel increments
    const dx = (xmax - xmin) / width;
    const dy = (ymax - ymin) / height;

    // Iterate over each pixel
    for (let j = 0; j < height; j++) {
        let y = ymin + j * dy;
        for (let i = 0; i < width; i++) {
            let x = xmin + i * dx;

            let a = x;
            let b = y;
            let n = 0;

            while (n < maxiterations) {
                const aa = ch(a) + c.re;
                const bb = ch(b) + c.im;

                if (aa + bb > 16) {
                    break;
                }
                const twoab = 2.0 * a * b;
                a = aa - bb + x;
                b = twoab + y;
                n++;
            }

            // Coloring based on iterations
            const pix = (i + j * width) * 4;
            const norm = map(n, 0, maxiterations, 0, 1);
            let bright = map(Math.sqrt(norm), 0, 1, 0, 255);

            if (n === maxiterations) {
                bright = 0; // Black color for points inside the set
            } else {
                // Use colorPicker for fractal color
                let col = colorPicker.value();
                pixels[pix + 0] = red(col) * bright / 255;
                pixels[pix + 1] = green(col) * bright / 255;
                pixels[pix + 2] = blue(col) * bright / 255;
                pixels[pix + 3] = 255; // Alpha value
            }
        }
    }

    updatePixels();
}
function ch(x) {
    return (Math.exp(x) + Math.exp(-x)) / 2;
}
function parseComplex(cString) {
    console.log(cString);
    if (!cString || typeof cString !== 'string') {
        alert("Input is invalid: default values has set");
        return {re: 0, im: 0}; // Return a default value if input is invalid
    }

    let parts = cString.split('+');
    if (parts.length !== 2) {
        alert("Format is not 'a+bi': default values has set");
        return {re: 0, im: 0}; // Return a default value if format is not 'a+bi'
    }

    let re = parseFloat(parts[0]);
    let im = parseFloat(parts[1].replace('i', ''));

    if (isNaN(re) || isNaN(im)) {
        alert("Parsing failed': default values has set");
        return {re: 0, im: 0}; // Return a default value if parsing fails
    }

    return {re: re, im: im};
}