let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let paragraphResolution = document.getElementById("paragraphResolution");
let rangeResolution = document.getElementById("rangeResolution");

let paragraphScale = document.getElementById("paragraphScale");
let rangeScale = document.getElementById("rangeScale");

let paragraphDepth = document.getElementById("paragraphDepth");
let rangeDepth = document.getElementById("rangeDepth");

let offsetXEnter = document.getElementById("offsetXEnter");
let offsetYEnter = document.getElementById("offsetYEnter");

let selectFractal = document.getElementById("selectFractal");

let enterRadius = document.getElementById("enterRadius");
let cEnterReal = document.getElementById("cEnterReal");
let cEnterImaginary = document.getElementById("cEnterImaginary");

let startColor = document.getElementById("startColor");
let endColor = document.getElementById("endColor");

let strokeColor = document.getElementById("strokeColor");
let strokeWidth = document.getElementById("strokeWidth");

let buttonApply = document.getElementById("buttonApply");
let buttonClear = document.getElementById("buttonClear");
let buttonDownload = document.getElementById("buttonDownload");

let side = document.getElementById("side");

let resolution;
let scale;
let depth;
let offsetX = 0;
let offsetY = 0;
let colors;
let radius;
let constantReal = 0;
let constantImaginary = 0;

let currentFractal = 0;

ctx.lineCap = "round";

function decimalToRGBString(decimalColor) {
    const r = (decimalColor >> 16) & 255;
    const g = (decimalColor >> 8) & 255;
    const b = decimalColor & 255;
    return `rgb(${r}, ${g}, ${b})`;
}

function getColors() {
    let colorsArray = [];
    let firstColor = parseInt(startColor.value.substring(1), 16);
    let lastColor = parseInt(endColor.value.substring(1), 16);
    let step = Math.floor(Math.abs(lastColor - firstColor) / depth);
    for (let i = 0; i <= depth; i++) {
        colorsArray.push(decimalToRGBString(firstColor));
        if (firstColor > lastColor) {
            firstColor -= step;
        } else {
            firstColor += step;
        }
    }
    return colorsArray;
}

function calculatePixel(x, y) {
    let zx = ((x + offsetX) - resolution / 2) / resolution / scale;
    let zy = ((y - offsetY) - resolution / 2) / resolution / scale * (-1);
    let iteration = 0;
    let tempX;
    while ((zx * zx + zy * zy) < Math.pow(parseFloat(radius), 2) && iteration < depth) {
        tempX = zx;
        zx = Math.sinh(zx) * Math.cos(zy) + constantReal;
        zy = Math.cosh(tempX) * Math.sin(zy) + constantImaginary;
        iteration++;
    }
    return colors[iteration];
}

function drawShFractal() {
    colors = getColors();
    for (let y = 0; y < ctx.canvas.height; y++) {
        for (let x = 0; x < ctx.canvas.width; x++) {
            let p = calculatePixel(x + 0.5, y + 0.5);
            ctx.fillStyle = p;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

function calculateHilbertPeano(x, y, xi, yi, xj, yj, n) {
    if (n <= 0) {
        var xf = (x + (xi + xj) / 2);
        var yf = (y + (yi + yj) / 2);
        ctx.lineTo(xf, yf);
    } else {
        calculateHilbertPeano(x, y, xj / 2, yj / 2, xi / 2, yi / 2, n - 1);

        calculateHilbertPeano(x + xi / 2, y + yi / 2, xi / 2, yi / 2, xj / 2, yj / 2, n - 1);

        calculateHilbertPeano(x + xi / 2 + xj / 2, y + yi / 2 + yj / 2, xi / 2, yi / 2, xj / 2, yj / 2, n - 1);

        calculateHilbertPeano(x + xi / 2 + xj, y + yi / 2 + yj, (-1) * xj / 2, (-1) * yj / 2, (-1) * xi / 2, (-1) * yi / 2, n - 1);
    }
}

function drawHilbertPeanoCurve() {
    ctx.strokeStyle = strokeColor.value;
    ctx.lineWidth = strokeWidth.value * scale;
    let size = resolution * sc
    let startX = (resolution - size) / 2;
    let startY = (resolution - size) / 2 + size;
    ctx.beginPath();
    calculateHilbertPeano(startX - offsetX, startY + offsetY, 0, (-1) * size, size, 0, depth);
    ctx.stroke();
    ctx.closePath();
}

function cleanMain() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    currentFractal = 0;
}

function drawMain() {
    cleanMain();
    currentFractal = parseInt(selectFractal.value);
    if (currentFractal === 1) {
        drawShFractal();
    }
else
    if (currentFractal === 2) {
        drawHilbertPeanoCurve();
    }
}

function resolutionChange() {
    paragraphResolution.innerHTML = "Resolution: " + rangeResolution.value;
    ctx.canvas.width = rangeResolution.value;
    ctx.canvas.height = rangeResolution.value;
    resolution = rangeResolution.value;
    if (currentFractal !== 0) {
        drawMain();
    }
}

function scaleChange() {
    paragraphScale.innerHTML = "Scale: " + rangeScale.value;
    scale = rangeScale.value;
    if (currentFractal !== 0) {
        drawMain();
    }
}

function depthChange() {
    paragraphDepth.innerHTML = "Depth: " + rangeDepth.value;
    depth = rangeDepth.value;
    if (currentFractal !== 0) {
        drawMain();
    }
}

function radiusChange() {
    let check = parseFloat(enterRadius.value);
    if (isNaN(check) || check === "") {
        return;
    }
    radius = check;
    if (currentFractal === 1) {
        drawMain();
    }
}

function constantRealChange() {
    let check = parseFloat(cEnterReal.value);
    if (isNaN(check) || check === "") {
        return;
    }
    constantReal = check;
    if (currentFractal === 1) {
        drawMain();
    }
}

function constantImaginaryChange() {
    let check = parseFloat(cEnterImaginary.value);
    if (isNaN(check) || check === "") {
        return;
    }
    constantImaginary = check;
    if (currentFractal === 1) {
        drawMain();
    }
}

function startColorChange() {
    if (currentFractal === 1) {
        drawMain();
    }
}

function endColorChange() {
    if (currentFractal === 1) {
        drawMain();
    }
}

function strokeColorChange() {
    if (currentFractal === 2) {
        drawMain();
    }
}

function strokeWidthChange() {
    paragraphStrokeWidth.innerHTML = "Stroke width: " + strokeWidth.value;
    if (currentFractal === 2) {
        drawMain();
    }
}

rangeResolution.oninput = resolutionChange;
rangeScale.oninput = scaleChange;
rangeDepth.oninput = depthChange;

function offsetXChange() {
    let check = parseFloat(offsetXEnter.value);
    if (isNaN(check) || check === "") {
        return;
    }
    offsetX = check;
    if (currentFractal != 0) {
        drawMain();
    }
}

function offsetYChange() {
    let check = parseFloat(offsetYEnter.value);
    if (isNaN(check) || check === "") {
        return;
    }
    offsetY = check;
    if (currentFractal != 0) {
        drawMain();
    }
}

offsetXEnter.oninput = offsetXChange;
offsetYEnter.oninput = offsetYChange;

enterRadius.oninput = radiusChange;
cEnterReal.oninput = constantRealChange;
cEnterImaginary.oninput = constantImaginaryChange;
startColor.oninput = startColorChange;
endColor.oninput = endColorChange;

strokeColor.oninput = strokeColorChange;
strokeWidth.oninput = strokeWidthChange;

buttonApply.onclick = drawMain;
buttonClear.onclick = cleanMain;
buttonDownload.onclick = () => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "fractal.png";
    link.click();
};

function loadSettings() {
    resolutionChange();
    scaleChange();
    depthChange();
    strokeWidthChange();
}

window.onload = loadSettings;