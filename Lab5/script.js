let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.scale(1, -1);

let x1, y1, x2, y2, m, n, k, moving = true, repaint = true;
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
    k = parseFloat(document.getElementById('k').value);
    repaint = document.getElementById('repaint').checked;

    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2) || isNaN(k)) {
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

    // Calculate the affine transformation matrix
    console.log("m: " + m + " n: " + n)
    const M = resultMatrix(m, n, progress);

    // Applying the transformation matrix M to the original coordinates K
    const result = K.map(coord => {
        const [x, y, z] = multiplyMatrixAndPoint(M, coord);
        return [x, y];
    });

    return result;
}

function resultMatrix(m, n, progress) {
    const scaleX = 1 + (k - 1) * progress;
    const scaleY = 1 + (k - 1) * progress;

    const mirrorX = selectedEdge === 'a' || selectedEdge === 'c' ? -1 : 1;
    const mirrorY = selectedEdge === 'a' || selectedEdge === 'b' ? -1 : 1;

    const T1 = [
        [1, 0, 0],
        [0, 1, 0],
        [-m, -n, 1]
    ];
    const S = [
        [scaleX * mirrorX, 0, 0],
        [0, scaleY * mirrorY, 0],
        [0, 0, 1]
    ];
    const T2 = [
        [1, 0, 0],
        [0, 1, 0],
        [m, n, 1]
    ];
    const T1S = multiplyMatrices(T1, S);
    return multiplyMatrices(T1S, T2);
}

function multiplyMatrixAndPoint(matrix, point) {
    const [x, y, z] = point;
    const result = [];
    for (let i = 0; i < matrix.length; i++) {
        result[i] = matrix[i][0] * x + matrix[i][1] * y + matrix[i][2] * z;
    }
    return result;
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