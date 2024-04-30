// Declare variables to hold your image and canvas
let img, canvas, ctx;
// є все + інтернет всюди
// тариф за рік: лайф + воля -- 125 грн за місяць Андрій

function setup() {
    canvas = document.getElementById('canvasContainer');
    ctx = canvas.getContext("2d");
}

function getRgbish(c) {
    let i = 0, itm,
        M = c.replace(/ +/g, '').match(/(rgba?)|(\d+(\.\d+)?%?)|(\.\d+)/g);
    if (M && M.length > 3) {
        while (i < 3) {
            itm = M[++i];
            if (itm.indexOf('%') !== -1) {
                itm = Math.round(parseFloat(itm) * 2.55);
            } else itm = parseInt(itm);
            if (itm < 0 || itm > 255) return NaN;
            M[i] = itm;
        }
        if (c.indexOf('rgba') === 0) {
            if (M[4] === undefined || M[4] < 0 || M[4] > 1) return NaN;
        } else if (M[4]) return NaN;
        return M[0] + '(' + M.slice(1).join(',') + ')';
    }
    return NaN;
}

function applyRGBtoXYZ() {
    for (let i = 0; i < ctx.length; i++) {
        for (let j = 0; j < ctx[i].length; j++) {
            ctx[i][j] = rgbToXyz(ctx[i][j]);
        }
    }
    applyColorChanges();
}

function applyXYZtoRGB() {
    for (let i = 0; i < ctx.length; i++) {
        for (let j = 0; j < ctx[i].length; j++) {
            ctx[i][j] = xyzToRgb(ctx[i][j]);
        }
    }
    applyColorChanges();
}

// TODO: get value from 'colorModifier' and apply dark green color changes
function applyColorChanges() {
    if (img) {
        console.log("Застосування змін кольору...");
        img.loadPixels();
        let value = parseInt(document.getElementById('colorModifier').value, 10);

        for (let i = 0; i < img.pixels.length; i += 4) {
            img.pixels[i + 1] = Math.max(0, img.pixels[i + 1] + value);
        }
        img.updatePixels();
        image(img, 0, 0);
    }
}

// TODO: get color info and display it
function displayColorInfo() {
    const data = ctx.getImageData(250, 200, 1, 1).data
    console.log(data.toString());

    /** sanity check */
    // const index = (Math.floor(0) * canvas.width + Math.floor(0)) * 4
    // const r = data[index]
    // const g = data[index + 1]
    // const b = data[index + 2]
    //
    // const xyz = rgbToXyz(r, g, b);
    // console.log("X: " + xyz.X + ", Y: " + xyz.Y + ", Z: " + xyz.Z);
    //
    // const rgb = xyzToRgb(xyz.X, xyz.Y, xyz.Z);
    // console.log("R: " + rgb.R + ", G: " + rgb.G + ", B: " + rgb.B);
}

// DONE
function displayImage(input) {
    if (input && input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            const canvas = document.getElementById('canvasContainer');
            const ctx = canvas.getContext('2d');

            img.onload = function () {
                const scaleFactor = 400 / img.height;
                const scaledWidth = img.width * scaleFactor;
                const scaledHeight = img.height * scaleFactor;

                canvas.width = scaledWidth;
                canvas.height = scaledHeight;

                ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

                // Display original image
                const originalImage = document.getElementById('originalImage');
                originalImage.style.height = scaledHeight + "px";
                originalImage.src = e.target.result;
            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(input.files[0]);
    }
}

// DONE
function saveCanvasImage() {
    let canvasUrl = canvas.toDataURL();
    const createEl = document.createElement('a');
    createEl.href = canvasUrl;

    createEl.download = "download-this-canvas";

    createEl.click();
    createEl.remove();
}

// DONE
function rgbToXyz(r, g, b) {
    r = r / 255
    g = g / 255
    b = b / 255

    // Convert to a sRGB form
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Apply the RGB to XYZ conversion matrix
    const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100;
    const y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100;
    const z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100;

    return {X: x, Y: y, Z: z};
}

// DONE
function xyzToRgb(x, y, z) {
    // Observer = 2°, Illuminant = D65
    x = x / 100; // Normalize X from 0 to 95.047
    y = y / 100; // Normalize Y from 0 to 100.000
    z = z / 100; // Normalize Z from 0 to 108.883

    // Convert XYZ to linear RGB
    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let b = x * 0.0557 + y * -0.2040 + z * 1.0570;

    // Apply sRGB gamma correction
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 0.41666667) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 0.41666667) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 0.41666667) - 0.055 : 12.92 * b;

    // Scale RGB to the range 0-255
    r = Math.round(Math.max(0, Math.min(255, r * 255)));
    g = Math.round(Math.max(0, Math.min(255, g * 255)));
    b = Math.round(Math.max(0, Math.min(255, b * 255)));

    return { R: r, G: g, B: b };
}