let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let resolution = 1000;
ctx.canvas.width = resolution;
ctx.canvas.height = resolution;

let checkComponents = [document.getElementById("checkFirstComponent"),
    document.getElementById("checkSecondComponent"),
    document.getElementById("checkThirdComponent")];

let x1 = document.getElementById("x1");
let y1 = document.getElementById("y1");
let x2 = document.getElementById("x2");
let y2 = document.getElementById("y2");

let arrayOfPixels = null;
let rectangle = null;


class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


let width = ctx.canvas.width;
let height = ctx.canvas.height;

let currentDimension = "RGB";


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

function changeSorL() {
    if (rectangle.length != 2) {
        return;
    }
    const xMin = parseInt(rectangle[0].x);
    const yMin = parseInt(rectangle[0].y);
    const xMax = parseInt(rectangle[1].x);
    const yMax = parseInt(rectangle[1].y);
    for (let i = yMin; i <= yMax; i++) {
        for (let j = xMin; j <= xMax; j++) {
            const imageData = ctx.getImageData(j, i, 1, 1);
            const data = imageData.data;
            const red = data[0];
            const green = data[1];
            const blue = data[2];

            let hsv = rgbToHsv(red, green, blue);
            hsv.V = document.getElementById("rangeParameter").value;

            const [r, g, b] = convertFromHslToRgb(hsv.H, hsv.S, hsv.V);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(j, i, 1, 1);
        }
    }
}

// function setPixelInArray() {
//     let checkFirstComponent = checkComponents[0].checked;
//     let checkSecondComponent = checkComponents[1].checked;
//     let checkThirdComponent = checkComponents[2].checked;
//     for (let i = 0; i < height; i++) {
//         for (let j = 0; j < width; j++) {
//             const red = arrayOfPixels[i][j][0];
//             const green = arrayOfPixels[i][j][1];
//             const blue = arrayOfPixels[i][j][2];
//             if (currentDimension === "RGB") {
//                 ctx.fillStyle = `rgb(${checkFirstComponent ? red : 0}, ${checkSecondComponent ? green : 0}, ${checkThirdComponent ? blue : 0})`;
//                 ctx.fillRect(j, i, 1, 1);
//             } else if (currentDimension === "XYZ") {
//                 const [lightness, alpha, beta] = convertFromRgbToXYZ(red, green, blue);
//                 const [r, g, b] = convertFromXYZToRgb(checkFirstComponent ? lightness : 0, checkSecondComponent ? alpha : 0, checkThirdComponent ? beta : 0);
//                 ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
//                 ctx.fillRect(j, i, 1, 1);
//             } else {
//                 const [hue, saturation, lightness] = convertFromRgbToHsl(red, green, blue);
//                 const [r, g, b] = convertFromHslToRgb(checkFirstComponent ? hue : 0, checkSecondComponent ? saturation : 0, checkThirdComponent ? lightness : 0);
//                 ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
//                 ctx.fillRect(j, i, 1, 1);
//             }
//         }
//     }
//     if (rectangle) {
//         changeSorL();
//     }
// }

function setPixelInArray() {
    // Retrieve the current state of each checkbox
    let checkFirstComponent = document.getElementById('checkFirstComponent').checked;
    let checkSecondComponent = document.getElementById('checkSecondComponent').checked;
    let checkThirdComponent = document.getElementById('checkThirdComponent').checked;

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const red = arrayOfPixels[i][j][0];
            const green = arrayOfPixels[i][j][1];
            const blue = arrayOfPixels[i][j][2];

            // Apply the checkbox state to the color components
            const displayRed = checkFirstComponent ? red : 0;
            const displayGreen = checkSecondComponent ? green : 0;
            const displayBlue = checkThirdComponent ? blue : 0;

            // Set the pixel color on the canvas
            ctx.fillStyle = `rgb(${displayRed}, ${displayGreen}, ${displayBlue})`;
            ctx.fillRect(j, i, 1, 1);
        }
    }
}


document.getElementById("selectDimension").addEventListener('change', function () {
    currentDimension = parseInt(document.getElementById("selectDimension").value);
    (currentDimension == 0) ? currentDimension = "RGB" : ((currentDimension == 1) ? currentDimension = "XYZ" : currentDimension = "HSV");
    document.getElementById("paragraphSelectDimension").innerHTML = `${currentDimension} configuration`;
    if (currentDimension == "RGB") {
        components[0].innerHTML = "R";
        components[1].innerHTML = "G";
        components[2].innerHTML = "B";
    } else if (currentDimension == "XYZ") {
        components[0].innerHTML = "X";
        components[1].innerHTML = "Y";
        components[2].innerHTML = "Z";
    } else {
        components[0].innerHTML = "H";
        components[1].innerHTML = "S";
        components[2].innerHTML = "V";
    }
    if (arrayOfPixels != null) {
        setPixelInArray();
    }
});

// DONE
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
    document.getElementById("HSV-color-info").innerHTML = `HSV(${parseInt(hsv.H)}°, ${Math.round(hsv.S * 100)}%, ${Math.round(hsv.V * 100)}%)`;
}

canvas.onmousedown = function (event) {
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
                changeSorL();
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


function parameterChange() {
    if (rectangle) {
        setPixelInArray();
        changeSorL();
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
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
    document.getElementById('originalImage').src = '';  // Remove the source of the image
});
document.getElementById('buttonUpload').addEventListener('click', function () {
    document.getElementById('imageInput').click();
});

function displayImage(file) {
    if (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                // Set image for display
                document.getElementById('originalImage').src = img.src;

                // Adjust canvas size
                var canvas = document.getElementById('canvas');
                var ctx = canvas.getContext('2d');
                var containerWidth = canvas.parentElement.offsetWidth;
                var scale = Math.min(1, containerWidth / img.width); // Ensure the image fits within the container
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

window.onload = () => {
    parameterChange();
}
