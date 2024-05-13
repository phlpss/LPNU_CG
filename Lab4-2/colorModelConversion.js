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

    hue = parseInt(hue);
    saturation = Math.round(saturation * 100);
    max = Math.round(max * 100);

    return {H: hue, S: saturation, V: max};
}

function hsvToRgb(h, s, v) {
    s = s / 100;
    v = v / 100;

    if (h < 0 || h >= 360 || s < 0 || s > 1 || v < 0 || v > 1) {
        console.error("Invalid HSV parameters");
        console.error("hsv:" + h + " " + s + ' ' + v);
        return {R: 0, G: 0, B: 0};
    }

    let chroma = v * s;
    let x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = v - chroma;
    let r, g, b;

    if (h < 60) {
        r = chroma; g = x; b = 0;
    } else if (h < 120) {
        r = x; g = chroma; b = 0;
    } else if (h < 180) {
        r = 0; g = chroma; b = x;
    } else if (h < 240) {
        r = 0; g = x; b = chroma;
    } else if (h < 300) {
        r = x; g = 0; b = chroma;
    } else {
        r = chroma; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return {R: r, G: g, B: b};
}


/** TEMPORARY */
function convertFromRgbToHsl(red, green, blue) {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    let hue, saturation;
    if (max == min) {
        hue = 0;
        saturation = 0;
    } else {
        const delta = max - min;
        saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
        switch (max) {
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

function convertFromHslToRgb(hue, saturation, lightness) {
    const h = hue / 360;
    const s = saturation / 100;
    const l = lightness / 100;
    let r, g, b;
    if (s == 0) {
        r = g = b = l;
    } else {
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

function convertFromRgbToXYZ(red, green, blue) {
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

function convertFromXYZToRgb(lightness, alpha, beta) {
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