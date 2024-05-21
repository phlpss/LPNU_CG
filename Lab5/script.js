// let canvas = document.getElementById("canvas");
// let ctx = canvas.getContext("2d");
// ctx.translate(canvas.width / 2, canvas.height / 2);
// ctx.scale(1, -1);
//
// let x1, y1, x2, y2, m, n, moving = true, repaint = true;
// let k1, k2;
// let edgeCoordinates;
// let progress = 0;
// let direction = 1;
// let selectedEdge;
//
// document.getElementById('form').addEventListener('submit', (e) => {
//     e.preventDefault();
//
//     x1 = parseInt(document.getElementById('x1').value) * 20;
//     y1 = parseInt(document.getElementById('y1').value) * 20;
//     const squareSize = parseInt(document.getElementById('square-size').value) * 20;
//     x2 = squareSize + x1;
//     y2 = squareSize + y1;
//     k1 = parseFloat(document.getElementById('k1').value);
//     k2 = parseFloat(document.getElementById('k2').value);
//     repaint = document.getElementById('repaint').checked;
//
//     if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2) || isNaN(k1) || isNaN(k2)) {
//         alert('Please enter numerical values for coordinates and scaling factor.');
//         return;
//     }
//
//     selectedEdge = document.getElementById('selectEdge').value;
//
//     edgeCoordinates = {
//         a: [x1, y1],
//         b: [x2, y1],
//         c: [x2, y2],
//         d: [x1, y2]
//     };
//
//     const coordinates = edgeCoordinates[selectedEdge];
//     if (coordinates) {
//         m = coordinates[0];
//         n = coordinates[1];
//     }
//
//     drawCoordinateSystem();
//     drawRectangle();
//     moveRectangle();
// });
//
// document.getElementById('stop').addEventListener('click', () => {
//     moving = false;
// });
//
// document.getElementById('resume').addEventListener('click', () => {
//     moving = true;
//     moveRectangle();
// });
//
// function drawCoordinateSystem() {
//     ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
//
//     // Draw grid lines
//     ctx.beginPath();
//     for (let x = -canvas.width / 2 + 20; x <= canvas.width / 2; x += 20) {
//         ctx.moveTo(x, -canvas.height / 2);
//         ctx.lineTo(x, canvas.height / 2);
//     }
//     for (let y = -canvas.height / 2 + 20; y <= canvas.height / 2; y += 20) {
//         ctx.moveTo(-canvas.width / 2, y);
//         ctx.lineTo(canvas.width / 2, y);
//     }
//     ctx.strokeStyle = '#ccc';
//     ctx.stroke();
//
//     // Draw axes
//     ctx.beginPath();
//     ctx.moveTo(-canvas.width / 2, 0);
//     ctx.lineTo(canvas.width / 2, 0);
//     ctx.moveTo(0, -canvas.height / 2);
//     ctx.lineTo(0, canvas.height / 2);
//     ctx.strokeStyle = 'black';
//     ctx.stroke();
//
//     // Draw arrows
//     ctx.beginPath();
//     ctx.moveTo(canvas.width / 2 - 10, -5);
//     ctx.lineTo(canvas.width / 2, 0);
//     ctx.lineTo(canvas.width / 2 - 10, 5);
//     ctx.moveTo(-5, canvas.height / 2 - 10);
//     ctx.lineTo(0, canvas.height / 2);
//     ctx.lineTo(5, canvas.height / 2 - 10);
//     ctx.strokeStyle = 'black';
//     ctx.stroke();
//
//     // Draw axis labels
//     ctx.font = '12px Arial';
//     ctx.fillStyle = 'black';
//     // ctx.fillText('Y', 5, canvas.height / 2 - 15);
//     // ctx.fillText('X', canvas.width / 2 - 15, -5);
// }
//
//
// function drawRectangle() {
//     if (repaint) {
//         ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
//         drawCoordinateSystem();
//     }
//     ctx.beginPath();
//     ctx.rect(x1, y1, x2 - x1, y2 - y1);
//     ctx.fillStyle = '#85b0d1';
//     ctx.fill();
// }
//
// function moveRectangle() {
//     if (!moving) return;
//
//     // Calculate progress incrementally
//     progress += 0.01 * direction;
//
//     // Reverse direction if progress is at the limits
//     if (progress >= 1) {
//         direction = -1;
//         progress = 1;
//     } else if (progress <= 0.5) {
//         direction = 1;
//         progress = 0.5;
//     }
//
//     // Calculate new position and scale of the rectangle
//     const newCoords = newSquarePosition(progress);
//
//     // Update the coordinates
//     x1 = newCoords[0][0];
//     y1 = newCoords[0][1];
//     x2 = newCoords[2][0];
//     y2 = newCoords[2][1];
//
//     drawRectangle();
//     requestAnimationFrame(moveRectangle);
// }
//
// function newSquarePosition(progress) {
//     const coordinatesArray = Object.values(edgeCoordinates);
//     const K = coordinatesArray.map(coord => [...coord, 1]);
//     const M = resultMatrix(m, n, k1 * progress, k2 * progress);
//
//     // Applying the transformation matrix M to the original coordinates K
//     const result = multiplyMatrices(K, M);
//     return result;
// }
//
// function resultMatrix(m, n, a, d) {
//     const T1 = [
//         [1, 0, 0],
//         [0, 1, 0],
//         [-m, -n, 1]
//     ];
//     const T2 = [
//         [1, 0, 0],
//         [0, 1, 0],
//         [m, n, 1]
//     ];
//     const D1 = [
//         [-1, 0, 0],
//         [0, -1, 0],
//         [0, 0, 1]
//     ];
//     const D2 = [
//         [a, 0, 0],
//         [0, d, 0],
//         [0, 0, 1]
//     ];
//
//     const T1D1 = multiplyMatrices(T1, D1);
//     const T1D1T2 = multiplyMatrices(T1D1, T2);
//     return multiplyMatrices(T1D1T2, D2);
// }
//
// function multiplyMatrices(A, B) {
//     const result = [];
//
//     for (let i = 0; i < A.length; i++) {
//         result[i] = [];
//         for (let j = 0; j < B[0].length; j++) {
//             let sum = 0;
//             for (let k = 0; k < A[0].length; k++) {
//                 sum += A[i][k] * B[k][j];
//             }
//             result[i][j] = sum;
//         }
//     }
//     return result;
// }


let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.scale(1, -1);

let x1, y1, x2, y2, m, n, moving = true, repaint = true;
let k1, k2;
let edgeCoordinates;
let progress = 0;
let direction = 1;
let selectedEdge;

document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault();

    x1 = parseInt(document.getElementById('x1').value) * 20;
    y1 = parseInt(document.getElementById('y1').value) * 20;
    const squareSize = parseInt(document.getElementById('square-size').value) * 20;
    x2 = squareSize + x1;
    y2 = squareSize + y1;
    k1 = parseFloat(document.getElementById('k1').value);
    k2 = parseFloat(document.getElementById('k2').value);
    repaint = document.getElementById('repaint').checked;

    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2) || isNaN(k1) || isNaN(k2)) {
        alert('Please enter numerical values for coordinates and scaling factor.');
        return;
    }

    selectedEdge = document.getElementById('selectEdge').value;

    edgeCoordinates = {
        a: [x1, y1],
        b: [x2, y1],
        c: [x2, y2],
        d: [x1, y2]
    };

    const coordinates = edgeCoordinates[selectedEdge];
    if (coordinates) {
        m = coordinates[0];
        n = coordinates[1];
    }

    drawCoordinateSystem();
    drawRectangle();
    moveRectangle();
});

document.getElementById('stop').addEventListener('click', () => {
    moving = false;
});

document.getElementById('resume').addEventListener('click', () => {
    moving = true;
    moveRectangle();
});

function drawCoordinateSystem() {
    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    // Draw grid lines
    ctx.beginPath();
    for (let x = -canvas.width / 2 + 20; x <= canvas.width / 2; x += 20) {
        ctx.moveTo(x, -canvas.height / 2);
        ctx.lineTo(x, canvas.height / 2);
    }
    for (let y = -canvas.height / 2 + 20; y <= canvas.height / 2; y += 20) {
        ctx.moveTo(-canvas.width / 2, y);
        ctx.lineTo(canvas.width / 2, y);
    }
    ctx.strokeStyle = '#ccc';
    ctx.stroke();

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(-canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, 0);
    ctx.moveTo(0, -canvas.height / 2);
    ctx.lineTo(0, canvas.height / 2);
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Draw arrows
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 10, -5);
    ctx.lineTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2 - 10, 5);
    ctx.moveTo(-5, canvas.height / 2 - 10);
    ctx.lineTo(0, canvas.height / 2);
    ctx.lineTo(5, canvas.height / 2 - 10);
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Draw axis labels
    ctx.font = '12px Arial';
    ctx.fillStyle = 'black';
}

function drawRectangle() {
    if (repaint) {
        ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        drawCoordinateSystem();
    }
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.fillStyle = '#85b0d1';
    ctx.fill();
}

function moveRectangle() {
    if (!moving) return;

    // Calculate progress incrementally
    progress += 0.01 * direction;

    // Reverse direction if progress is at the limits
    if (progress >= 1) {
        direction = -1;
        progress = 1;
    } else if (progress <= 0) {
        direction = 1;
        progress = 0;
    }

    // Calculate new position and scale of the rectangle
    const newCoords = newSquarePosition(progress);

    // Update the coordinates
    x1 = newCoords[0][0];
    y1 = newCoords[0][1];
    x2 = newCoords[2][0];
    y2 = newCoords[2][1];

    drawRectangle();
    requestAnimationFrame(moveRectangle);
}

function newSquarePosition(progress) {
    const coordinatesArray = Object.values(edgeCoordinates);
    const K = coordinatesArray.map(coord => [...coord, 1]);

    // Calculate scaling factors
    const scaleProgress = 1 + (k1 - 1) * progress;
    const scaleX = m * (1 - progress) + (m * k1) * progress;
    const scaleY = n * (1 - progress) + (n * k2) * progress;

    // Apply the transformation matrix to the original coordinates K
    const result = K.map(coord => [
        (coord[0] - m) * scaleProgress + m,
        (coord[1] - n) * scaleProgress + n,
        1
    ]);
    return result;
}

function resultMatrix(m, n, a, d) {
    const T1 = [
        [1, 0, 0],
        [0, 1, 0],
        [-m, -n, 1]
    ];
    const T2 = [
        [1, 0, 0],
        [0, 1, 0],
        [m, n, 1]
    ];
    const D1 = [
        [-1, 0, 0],
        [0, -1, 0],
        [0, 0, 1]
    ];
    const D2 = [
        [a, 0, 0],
        [0, d, 0],
        [0, 0, 1]
    ];

    const T1D1 = multiplyMatrices(T1, D1);
    const T1D1T2 = multiplyMatrices(T1D1, T2);
    return multiplyMatrices(T1D1T2, D2);
}

function multiplyMatrices(A, B) {
    const result = [];

    for (let i = 0; i < A.length; i++) {
        result[i] = [];
        for (let j = 0; j < B[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < A[0].length; k++) {
                sum += A[i][k] * B[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}