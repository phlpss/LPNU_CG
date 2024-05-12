let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let resolution = 1000;
ctx.canvas.width = resolution;
ctx.canvas.height = resolution;


let selectDimension = document.getElementById("selectDimension");
let paragraphSelectDimension = document.getElementById("paragraphSelectDimension");


let components = [document.getElementById("firstComponent"), document.getElementById("secondComponent"), document.getElementById("thirdComponent")];
let checkComponents = [document.getElementById("checkFirstComponent"), document.getElementById("checkSecondComponent"), document.getElementById("checkThirdComponent")];


let paragraphRGB = document.getElementById("RGB-color-info");
let paragraphXYZ = document.getElementById("XYZ-color-info");
let paragraphHSV = document.getElementById("HSV-color-info");


let colorToChange = document.getElementById("colorToChange");
let parameterToChange = document.getElementById("parameterToChange");
let paragraphParameter = document.getElementById("paragraphParameter");
let rangeParameter = document.getElementById("rangeParameter");


let x1 = document.getElementById("x1");
let y1 = document.getElementById("y1");
let x2 = document.getElementById("x2");
let y2 = document.getElementById("y2");


// let buttonClear = document.getElementById("buttonClear");
let buttonUpload = document.getElementById("buttonUpload");
let uploadImage = document.getElementById("uploadImage");
let buttonDownload = document.getElementById("buttonDownload");


let arrayOfPixels = null;
let rectangle = null;


class Point{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}


let width = ctx.canvas.width;
let height = ctx.canvas.height;


let currentDimension = "RGB";


function getPixelInArray(){
    arrayOfPixels = [];
    for(let i = 0; i < height; i++){
        arrayOfPixels[i] = [];
        for(let j = 0; j < width; j++){
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


function convertFromRgbToHsl(red, green, blue){
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    let hue, saturation;
    if(max == min){
        hue = 0;
        saturation = 0;
    }else{
        const delta = max - min;
        saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
        switch(max){
            case r:
                hue = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
                break;
            case g:
                hue = ((b - r) / delta + 2) * 60;
                break;
            case b:
                hue = ((r - g) / delta + 4) * 60;
                break;
        }
    }
    return [hue, saturation * 100, lightness * 100];
}


function convertFromHslToRgb(hue, saturation, lightness){
    const h = hue / 360;
    const s = saturation / 100;
    const l = lightness / 100;
    let r, g, b;
    if(s == 0){
        r = g = b = l;
    }else{
        const hueToRgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1 / 3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


function convertFromRgbToXYZ(red, green, blue){
    const rLinear = red / 255;
    const gLinear = green / 255;
    const bLinear = blue / 255;
    const gammaCorrect = (val) => val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    const r = gammaCorrect(rLinear);
    const g = gammaCorrect(gLinear);
    const b = gammaCorrect(bLinear);
    const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
    const xRef = 0.95047;
    const yRef = 1.00000;
    const zRef = 1.08883;
    const epsilon = 0.008856;
    const kappa = 903.3;
    const xr = x / xRef;
    const yr = y / yRef;
    const zr = z / zRef;
    const fx = xr > epsilon ? Math.pow(xr, 1 / 3) : (kappa * xr + 16) / 116;
    const fy = yr > epsilon ? Math.pow(yr, 1 / 3) : (kappa * yr + 16) / 116;
    const fz = zr > epsilon ? Math.pow(zr, 1 / 3) : (kappa * zr + 16) / 116;
    const lightness = 116 * fy - 16;
    const alpha = 500 * (fx - fy);
    const beta = 200 * (fy - fz);
    return [lightness, alpha, beta];
}


function convertFromXYZToRgb(lightness, alpha, beta){
    const xRef = 0.95047;
    const yRef = 1.00000;
    const zRef = 1.08883;
    const epsilon = 0.008856;
    const kappa = 903.3;
    const fy = (lightness + 16) / 116;
    const fx = alpha / 500 + fy;
    const fz = fy - beta / 200;
    const xyz = {
        x: (fx ** 3 > epsilon) ? fx ** 3 : (116 * fx - 16) / kappa,
        y: (fy ** 3 > epsilon) ? fy ** 3 : (116 * fy - 16) / kappa,
        z: (fz ** 3 > epsilon) ? fz ** 3 : (116 * fz - 16) / kappa
    };
    const xr = xyz.x * xRef;
    const yr = xyz.y * yRef;
    const zr = xyz.z * zRef;
    const rLinear = xr * 3.2404542 - yr * 1.5371385 - zr * 0.4985314;
    const gLinear = -xr * 0.9692660 + yr * 1.8760108 + zr * 0.0415560;
    const bLinear = xr * 0.0556434 - yr * 0.2040259 + zr * 1.0572252;
    const gammaCorrect = (val) => val <= 0.0031308 ? 12.92 * val : (1 + 0.055) * Math.pow(val, 1 / 2.4) - 0.055;
    const gammaCorrected = (val) => Math.max(0, Math.min(1, gammaCorrect(val)));
    const red = gammaCorrected(rLinear);
    const green = gammaCorrected(gLinear);
    const blue = gammaCorrected(bLinear);
    return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];
}


function changeSorL(){
    if(rectangle.length != 2){
        return;
    }
    const xMin = parseInt(rectangle[0].x);
    const yMin = parseInt(rectangle[0].y);
    const xMax = parseInt(rectangle[1].x);
    const yMax = parseInt(rectangle[1].y);
    for(let i = yMin; i <= yMax; i++){
        for(let j = xMin; j <= xMax; j++){
            const imageData = ctx.getImageData(j, i, 1, 1);
            const data = imageData.data;
            const red = data[0];
            const green = data[1];
            const blue = data[2];
            if((colorToChange.value == "0" && parseInt(red) == 255 && parseInt(green) == 0 && parseInt(blue) == 0) || 
            (colorToChange.value == "1" && parseInt(red) == 255 && parseInt(green) == 255 && parseInt(blue) == 0) ||
            (colorToChange.value == "2" && parseInt(red) == 0 && parseInt(green) == 255 && parseInt(blue) == 0) ||
            (colorToChange.value == "3" && parseInt(red) == 0 && parseInt(green) == 255 && parseInt(blue) == 255) ||
            (colorToChange.value == "4" && parseInt(red) == 0 && parseInt(green) == 0 && parseInt(blue) == 255) ||
            (colorToChange.value == "5" && parseInt(red) == 255 && parseInt(green) == 0 && parseInt(blue) == 255)
            ){
                let [hue, saturation, lightness] = convertFromRgbToHsl(red, green, blue);
                if(parameterToChange == "0"){
                    saturation = rangeParameter.value;
                }
                else{
                    lightness = rangeParameter.value;
                }
                const [r, g, b] = convertFromHslToRgb(hue, saturation, lightness);
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(j, i, 1, 1);
            }
        }
    }
}


function setPixelInArray(){
    let checkFirstComponent = checkComponents[0].checked;
    let checkSecondComponent = checkComponents[1].checked;
    let checkThirdComponent = checkComponents[2].checked;
    for(let i = 0; i < height; i++){
        for(let j = 0; j < width; j++){
            const red = arrayOfPixels[i][j][0];
            const green = arrayOfPixels[i][j][1];
            const blue = arrayOfPixels[i][j][2];
            if(currentDimension === "RGB"){
                ctx.fillStyle = `rgb(${checkFirstComponent ? red : 0}, ${checkSecondComponent ? green : 0}, ${checkThirdComponent ? blue : 0})`;
                ctx.fillRect(j, i, 1, 1);
            }
            else if(currentDimension === "XYZ"){
                const [lightness, alpha, beta] = convertFromRgbToXYZ(red, green, blue);
                const [r, g, b] = convertFromXYZToRgb(checkFirstComponent ? lightness : 0, checkSecondComponent ? alpha : 0, checkThirdComponent ? beta : 0);
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(j, i, 1, 1);
            }
            else{
                const [hue, saturation, lightness] = convertFromRgbToHsl(red, green, blue);
                const [r, g, b] = convertFromHslToRgb(checkFirstComponent ? hue : 0, checkSecondComponent ? saturation : 0, checkThirdComponent ? lightness : 0);
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(j, i, 1, 1);
            }
        }
    }
    if(rectangle){
        changeSorL();
    }
}


document.getElementById('buttonClear').addEventListener('click', function() {
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
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}


selectDimension.onchange = () =>{
    currentDimension = parseInt(selectDimension.value);
    (currentDimension == 0) ? currentDimension = "RGB" : ((currentDimension == 1) ? currentDimension = "XYZ" : currentDimension = "HSV");
    paragraphSelectDimension.innerHTML = `${currentDimension} configuration`;
    if(currentDimension == "RGB"){
        components[0].innerHTML = "R";
        components[1].innerHTML = "G";
        components[2].innerHTML = "B";
    }
    else if(currentDimension == "XYZ"){
        components[0].innerHTML = "L";
        components[1].innerHTML = "a";
        components[2].innerHTML = "b";
    }
    else{
        components[0].innerHTML = "H";
        components[1].innerHTML = "S";
        components[2].innerHTML = "L";
    }
    if(arrayOfPixels != null){
        setPixelInArray();
    }
}


canvas.onmousemove = function(event){
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
    const [l, alpha, beta] = convertFromRgbToXYZ(red, green, blue);
    const [hue, saturation, lightness] = convertFromRgbToHsl(red, green, blue);
    paragraphRGB.innerHTML = `RGB: ${red}; ${green}; ${blue}`;
    paragraphXYZ.innerHTML = `XYZ: ${parseInt(l)}; ${parseInt(alpha)}; ${parseInt(beta)}`;
    paragraphHSV.innerHTML = `HSV: ${parseInt(hue)}; ${parseInt(saturation)}; ${parseInt(lightness)}`;
}


canvas.onmousedown = function(event){
    rectangle = [];
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const pixelX = Math.floor(x * (canvas.width / rect.width));
    const pixelY = Math.floor(y * (canvas.height / rect.height));
    let point = new Point(pixelX, pixelY);
    rectangle.push(point);
    canvas.onmouseout = canvas.onmouseup = function(event){
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
        if(tempXMin < 0){
            tempXMin = 0;
        }
        if(tempXMax > resolution - 1){
            tempXMax = resolution - 1;
        }
        if(tempYMin < 0){
            tempYMin = 0;
        }
        if(tempYMax > resolution - 1){
            tempYMax = resolution - 1;
        }
        rectangle = null;
        if(arrayOfPixels != null){
            setPixelInArray();
        }
        rectangle = [];
        if(tempXMin != tempXMax && tempYMin != tempYMax){
            rectangle.push(new Point(tempXMin, tempYMin));
            rectangle.push(new Point(tempXMax, tempYMax));
            x1.innerHTML = `X1: ${tempXMin}`;
            y1.innerHTML = `Y1: ${tempYMin}`;
            x2.innerHTML = `X2: ${tempXMax}`;
            y2.innerHTML = `Y2: ${tempYMax}`;
            if(arrayOfPixels != null){
                changeSorL();
            }
        }
        else{
            rectangle = null;
            x1.innerHTML = "X1: ";
            y1.innerHTML = "Y1: ";
            x2.innerHTML = "X2: ";
            y2.innerHTML = "Y2: ";
        }
    }
}


checkComponents[0].onchange = () =>{
    if(arrayOfPixels != null){
        setPixelInArray();
    }
}


checkComponents[1].onchange = () =>{
    if(arrayOfPixels != null){
        setPixelInArray();
    }
}


checkComponents[2].onchange = () =>{
    if(arrayOfPixels != null){
        setPixelInArray();
    }
}

//
// buttonClear.onclick = () =>{
//     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//     arrayOfPixels = null;
// }


uploadImage.onchange = function(){
    let file = this.files[0];
    const allowedTypes = ["image/png", "image/jpeg"];
    if(!allowedTypes.includes(file.type)){
        uploadImage.value = "";
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event){
        const img = new Image();
        img.onload = () =>{
            ctx.drawImage(img, 0, 0, width, height);
            getPixelInArray();
            if(currentDimension != "RGB" || !checkComponents[0].checked || !checkComponents[1].checked || !checkComponents[2].checked){
                setPixelInArray();
            }
            else if(rectangle){
                changeSorL();
            }
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
    uploadImage.value = "";
}


buttonUpload.onclick = () =>{
    uploadImage.click();
}


buttonDownload.onclick = () =>{
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    link.download = `${currentDimension}.png`;
    link.click();
}


function parameterChange(){
    paragraphParameter.innerHTML = `${parameterToChange.value == 0 ? "Saturation" : "Lightness"}: ${rangeParameter.value}`
    if(rectangle){
        setPixelInArray();
        changeSorL();
    }
}


parameterToChange.onchange = parameterChange;
rangeParameter.oninput = parameterChange;


window.onload = () =>{
    parameterChange();
}
