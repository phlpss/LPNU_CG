let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.scale(1, -1);

let x1, y1, x2, y2, m, n, k, moving = true, repaint = true;
let edgeCoordinates;
let selectedEdge;
let flipped = false;

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

document.getElementById('save').addEventListener('click', () => {
    const resultMatrix = flipMatrix(m, n, 1);
    resultMatrix[2][0] = resultMatrix[2][0] / 20;
    resultMatrix[2][1] = resultMatrix[2][1] / 20;
    resultMatrix[2][2] = resultMatrix[2][2] / 20;

    // Convert resultMatrix to a JSON string
    const jsonResult = JSON.stringify(resultMatrix);

    // Create a Blob object from the JSON string
    const blob = new Blob([jsonResult], { type: 'application/json' });

    // Create a URL for the Blob object
    const url = URL.createObjectURL(blob);

    // Create a temporary <a> element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'result.json';
    a.style.display = 'none';
    document.body.appendChild(a);

    // Click the <a> element to trigger the download
    a.click();

    // Remove the <a> element from the DOM
    document.body.removeChild(a);

    // Revoke the URL to release the resources
    URL.revokeObjectURL(url);
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

    if (!flipped) {
        const newCoords = flipSquare();
        x1 = newCoords[0][0];
        y1 = newCoords[0][1];
        x2 = newCoords[2][0];
        y2 = newCoords[2][1];
        flipped = true;
    } else {
        const newCoords = flipSquareBackwards();
        x1 = newCoords[0][0];
        y1 = newCoords[0][1];
        x2 = newCoords[2][0];
        y2 = newCoords[2][1];
        flipped = false;
    }

    edgeCoordinates = {
        a: [x1, y1],
        b: [x2, y1],
        c: [x2, y2],
        d: [x1, y2]
    };

    drawRectangle();
    setTimeout(() => requestAnimationFrame(moveRectangle), 1000); // Adjust the timeout as necessary
}

function flipSquare() {
    const coordinatesArray = Object.values(edgeCoordinates);
    const K = coordinatesArray.map(coord => [...coord, 1]);
    const M = flipMatrix(m, n, 1);
    const result = multiplyMatrices(K, M);
    return result.map(coord => [coord[0], coord[1]]);
}

function flipSquareBackwards() {
    const coordinatesArray = Object.values(edgeCoordinates);
    const K = coordinatesArray.map(coord => [...coord, 1]);
    const M = flipMatrixBackwards(m, n, 1);
    const result = multiplyMatrices(K, M);
    return result.map(coord => [coord[0], coord[1]]);
}

function flipMatrix(m, n, progress) {
    const scaleX = k;
    const scaleY = k;

    const T1 = [
        [1, 0, 0],
        [0, 1, 0],
        [-m, -n, 1]
    ];
    const S = [
        [-1 * scaleX, 0, 0],
        [0, -1 * scaleY, 0],
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

function flipMatrixBackwards(m, n, progress) {
    const scaleX = k;
    const scaleY = k;

    const T1 = [
        [1, 0, 0],
        [0, 1, 0],
        [-m, -n, 1]
    ];
    const S = [
        [-1 / scaleX, 0, 0],
        [0, -1 / scaleY, 0],
        [0, 0, 1]
    ];
    const T2 = [
        [1, 0, 0],
        [0, 1, 0],
        [m, n, 1]
    ];
    const T1S = multiplyMatrices(T1, S);
    const T1ST2 = multiplyMatrices(T1S, T2);

    return T1ST2;
}

function multiplyMatrices(A, B) {
    if (A.length === 0 || B.length === 0 || A[0].length !== B.length) {
        throw new Error("Matrices cannot be multiplied due to incompatible dimensions.");
    }

    const result = [];
    for (let i = 0; i < A.length; i++) {
        result[i] = [];
        for (let j = 0; j < B[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < B.length; k++) {
                sum += A[i][k] * B[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}