let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let resolution = 1000;

let width = resolution;
let height = resolution;
let currentDimension = "RGB";

let checkComponents = [document.getElementById("checkFirstComponent"),
    document.getElementById("checkSecondComponent"),
    document.getElementById("checkThirdComponent")];

let labelComponents = [
    document.querySelector("label[for='checkFirstComponent']"),
    document.querySelector("label[for='checkSecondComponent']"),
    document.querySelector("label[for='checkThirdComponent']")
];

let x1 = document.getElementById("x1");
let y1 = document.getElementById("y1");
let x2 = document.getElementById("width");
let y2 = document.getElementById("height");

let arrayOfPixels = null;
let rectangle = null;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function displayImage(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                document.getElementById('originalImage').src = img.src;

                const canvas = document.getElementById('canvas');
                const ctx = canvas.getContext('2d');
                const containerWidth = canvas.parentElement.offsetWidth;
                const scale = Math.min(1, containerWidth / img.width);

                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                getPixelInArray();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function getPixelInArray() {
    arrayOfPixels = [];
    for (let i = 0; i < height; i++) {
        arrayOfPixels[i] = [];
        for (let j = 0; j < width; j++) {
            arrayOfPixels[i][j] = [];
            const imageData = ctx.getImageData(j, i, 1, 1);
            const data = imageData.data;
            const red = data[0];
            const green = data[1];
            const blue = data[2];
            arrayOfPixels[i][j][0] = red;
            arrayOfPixels[i][j][1] = green;
            arrayOfPixels[i][j][2] = blue;
        }
    }
}

function setPixelInArray() {
    let checkComponents = [
        document.getElementById('checkFirstComponent').checked,
        document.getElementById('checkSecondComponent').checked,
        document.getElementById('checkThirdComponent').checked
    ];

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const pixel = arrayOfPixels[i][j];
            let finalRGB = pixel.map((value, index) => checkComponents[index] ? value : 0);
            ctx.fillStyle = `rgb(${finalRGB[0]}, ${finalRGB[1]}, ${finalRGB[2]})`;
            ctx.fillRect(j, i, 1, 1);
        }
    }
}

function changeDarkGreenValue() {
    const img = new Image();
    const xMin = parseInt(rectangle[0].x);
    const yMin = parseInt(rectangle[0].y);
    const xMax = parseInt(rectangle[1].x);
    const yMax = parseInt(rectangle[1].y);
    let rangeValue = parseFloat(document.getElementById("rangeParameter").value);
    if (isNaN(rangeValue) || rangeValue < 0 || rangeValue > 100) {
        console.error('Invalid value for V in HSV:', rangeValue);
        alert('Please enter a valid value for V in HSV. It must be between 0 and 1.');
        return;
    }

    ctx.drawImage(img, xMin, yMin, xMax, yMax);
    let imgData = ctx.getImageData(xMin, yMin, xMax, yMax);

    let hsv = [];
    for (let i = 0; i < imgData.data.length; i += 4) {
        hsv.push(rgbToHsv(imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]));
    }

    hsv.forEach(element => {
        if (element.H >= 100 && element.H <= 140) {
            element.V = rangeValue;
        }
    });

    for (let i = 0, j = 0; j < hsv.length, i < imgData.data.length; i += 4, j += 1) {
        let rgb = hsvToRgb(hsv[j].H, hsv[j].S, hsv[j].V);
        imgData.data[i] = rgb.R;
        imgData.data[i + 1] = rgb.G;
        imgData.data[i + 2] = rgb.B;
    }

    console.log(hsv);
    ctx.putImageData(imgData, xMin, yMin);
}

function updateCanvasAccordingToColorModel(dimension) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        let converted;

        if (dimension === "RGB") {
        } else if (dimension === "XYZ") {
            converted = rgbToXyz(red, green, blue);
            const rgb = xyzToRgb(converted.X, converted.Y, converted.Z);
            data[i] = rgb.R;
            data[i + 1] = rgb.G;
            data[i + 2] = rgb.B;
        } else if (dimension === "HSV") {
            converted = rgbToHsv(red, green, blue);
            const rgb = hsvToRgb(converted.H, converted.S, converted.V);
            data[i] = rgb.R;
            data[i + 1] = rgb.G;
            data[i + 2] = rgb.B;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function parameterChange() {
    if (rectangle) {
        setPixelInArray();
    }
}

document.getElementById("rangeParameter").oninput = parameterChange;

document.getElementById("buttonDownload").addEventListener('click', function () {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    link.download = `${currentDimension}.png`;
    link.click();
});

document.getElementById('buttonClear').addEventListener('click', function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image()

    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = document.getElementById('originalImage').src;

    document.getElementById('checkFirstComponent').checked = true;
    document.getElementById('checkSecondComponent').checked = true;
    document.getElementById('checkThirdComponent').checked = true;
    3

    rectangle = null;
    x1.innerHTML = "X1: ";
    y1.innerHTML = "Y1: ";
    x2.innerHTML = "X2: ";
    y2.innerHTML = "Y2: ";
});

document.getElementById('buttonUpload').addEventListener('click', function () {
    document.getElementById('imageInput').click();
});

document.getElementById('selectDimension').addEventListener('change', function () {
    currentDimension = this.value;
    document.getElementById("paragraphSelectDimension").innerHTML = `${currentDimension} configuration`;
    if (currentDimension === "RGB") {
        labelComponents[0].innerHTML = "R";
        labelComponents[1].innerHTML = "G";
        labelComponents[2].innerHTML = "B";
    } else if (currentDimension === "XYZ") {
        labelComponents[0].innerHTML = "X";
        labelComponents[1].innerHTML = "Y";
        labelComponents[2].innerHTML = "Z";
    } else {
        labelComponents[0].innerHTML = "H";
        labelComponents[1].innerHTML = "S";
        labelComponents[2].innerHTML = "V";
    }
    updateCanvasAccordingToColorModel(currentDimension);
});

checkComponents.forEach((checkbox, index) => {
    checkbox.onchange = () => {
        if (arrayOfPixels !== null) {
            console.log(`Component ${index} changed`);
            setPixelInArray();
        } else {
            console.log("Pixel data not loaded.");
        }
    };
});

canvas.onmousemove = function (event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const pixelX = Math.floor(x * (canvas.width / rect.width));
    const pixelY = Math.floor(y * (canvas.height / rect.height));
    const imageData = ctx.getImageData(pixelX, pixelY, 1, 1);
    const data = imageData.data;
    const red = data[0];
    const green = data[1];
    const blue = data[2];
    const xyz = rgbToXyz(red, green, blue);
    const hsv = rgbToHsv(red, green, blue);
    document.getElementById("RGB-color-info").innerHTML = `RGB(${red}, ${green}, ${blue})`;
    document.getElementById("XYZ-color-info").innerHTML = `XYZ(${xyz.X}, ${xyz.Y}, ${xyz.Z})`;
    document.getElementById("HSV-color-info").innerHTML = `HSV(${hsv.H}°, ${hsv.S}%, ${hsv.V}%)`;
}

canvas.onmousedown = function (event) {
    console.log(`canvas.onmousedown`);

    rectangle = [];
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const pixelX = Math.floor(x * (canvas.width / rect.width));
    const pixelY = Math.floor(y * (canvas.height / rect.height));
    let point = new Point(pixelX, pixelY);
    rectangle.push(point);
    canvas.onmouseout = canvas.onmouseup = function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const pixelX = Math.floor(x * (canvas.width / rect.width));
        const pixelY = Math.floor(y * (canvas.height / rect.height));
        let point = new Point(pixelX, pixelY);

        rectangle.push(point);
        let tempXMin = Math.min(parseInt(rectangle[0].x), parseInt(rectangle[1].x));
        let tempXMax = Math.max(parseInt(rectangle[0].x), parseInt(rectangle[1].x));
        let tempYMin = Math.min(parseInt(rectangle[0].y), parseInt(rectangle[1].y));
        let tempYMax = Math.max(parseInt(rectangle[0].y), parseInt(rectangle[1].y));
        if (tempXMin < 0) {
            tempXMin = 0;
        }
        if (tempXMax > resolution - 1) {
            tempXMax = resolution - 1;
        }
        if (tempYMin < 0) {
            tempYMin = 0;
        }
        if (tempYMax > resolution - 1) {
            tempYMax = resolution - 1;
        }
        rectangle = null;
        if (arrayOfPixels != null) {
            setPixelInArray();
        }
        rectangle = [];
        if (tempXMin !== tempXMax && tempYMin !== tempYMax) {
            rectangle.push(new Point(tempXMin, tempYMin));
            rectangle.push(new Point(tempXMax, tempYMax));
            x1.innerHTML = `X1: ${tempXMin}`;
            y1.innerHTML = `Y1: ${tempYMin}`;
            x2.innerHTML = `X2: ${tempXMax}`;
            y2.innerHTML = `Y2: ${tempYMax}`;
            if (arrayOfPixels != null) {
                changeDarkGreenValue();
            }
        } else {
            rectangle = null;
            x1.innerHTML = "X1: ";
            y1.innerHTML = "Y1: ";
            x2.innerHTML = "X2: ";
            y2.innerHTML = "Y2: ";
        }
    }
}

window.onload = () => {
    console.log(hsvToRgb(0, 100, 50))
    parameterChange();
}