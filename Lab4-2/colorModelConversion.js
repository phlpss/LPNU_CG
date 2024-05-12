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

    return {
        X: x.toFixed(4),
        Y: y.toFixed(4),
        Z: z.toFixed(4)
    };
}

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

    return {R: r, G: g, B: b};
}

function rgbToHsv(r, g, b) {
    r = r / 255
    g = g / 255
    b = b / 255

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let delta = max - min;
    let saturation = max === 0 ? 0 : delta / max;
    let hue;

    if (delta === 0) {
        hue = 0;
    } else if (max === r) {
        hue = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
        hue = 60 * ((b - r) / delta + 2);
    } else {
        hue = 60 * ((r - g) / delta + 4);
    }

    return {H: hue, S: saturation, V: max};
}

function hsvToRgb(pixels) {
    let [hue, saturation, value] = pixels;
    let chroma = value * saturation;
    let x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
    let m = value - chroma;
    let r, g, b;

    if (hue >= 0 && hue < 60) {
        [r, g, b] = [chroma, x, 0];
    } else if (hue < 120) {
        [r, g, b] = [x, chroma, 0];
    } else if (hue < 180) {
        [r, g, b] = [0, chroma, x];
    } else if (hue < 240) {
        [r, g, b] = [0, x, chroma];
    } else if (hue < 300) {
        [r, g, b] = [x, 0, chroma];
    } else {
        [r, g, b] = [chroma, 0, x];
    }

    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255), 255];
}

function matrixMultiply(a, v) {
    let result = [];
    for (let i = 0; i < a.length; i++) {
        let sum = 0;
        for (let j = 0; j < v.length; j++) {
            sum += a[i][j] * v[j];
        }
        result.push(sum);
    }
    return result;
}

