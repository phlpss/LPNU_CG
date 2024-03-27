window.onload = function () {
    const canvas = document.getElementById('bezierCanvas');
    const ctx = canvas.getContext('2d');
    let points = [], matrixBezierPoints = [];

    const bgColor = "#FFFFFF";
    const axisColor = "#121212";
    const gridColor = "#ccc";
    const fontColor = "#555";

    const scale = 20;
    const width = canvas.width;
    const height = canvas.height;

    const pixelOrigin = {
        x: width / 2,
        y: height / 2
    };

    drawScreen();

    document.getElementById('addBtn').addEventListener('click', function () {
        const input = document.getElementById('pointsInput').value;
        const newPoint = validateAndTransformPoints(input);
        points = points.concat(newPoint);

        updateCanvas();
    });

    document.getElementById('drawBtn').addEventListener('click', function () {
        const input = document.getElementById('pointsInput').value;
        points = validateAndTransformPoints(input);

        updateCanvas();
    });

    document.getElementById('clearBtn').addEventListener('click', function () {
        points = [];
        drawScreen(ctx);
    });

    document.getElementById('setGap').addEventListener('click', function () {
        const n = parseInt(document.getElementById('pointCount').value);
        const a = parseFloat(document.getElementById('rangeStart').value);
        const b = parseFloat(document.getElementById('rangeEnd').value);

        const gapPoints = getEquidistantPointsOnCurve(n, a, b);

        drawPoints(gapPoints);
    });

    document.getElementById('setCol').addEventListener('click', function () {
        const matrixColumn = parseInt(document.getElementById('matrixColumn').value);
        const bezierMatrix = calculateCreatorMatrix(points);
        // Function to count zeros in the matrix
        function countZeros(matrix) {
            return matrix.reduce((count, row) =>
                count + row.filter(element => element === 0).length, 0);
        }

        const zeroCount = countZeros(bezierMatrix);

        if (matrixColumn >= 0 && matrixColumn < bezierMatrix.length) {
            const columnToShow = bezierMatrix.map(row => row[matrixColumn]).reverse();
            console.log(columnToShow);
            displayCuteMessage(`${matrixColumn} Column in matrix: ${columnToShow.join(', ')}\n\nNumber of '0' in matrix: ${zeroCount}`);
        } else {
            displayCuteMessage("Matrix column out of range.");
        }
    });

    function displayCuteMessage(message) {
        const modal = document.getElementById("cuteModal");
        const closeModalButton = document.querySelector(".close-button");
        const modalMessage = document.getElementById("modal-message");

        modalMessage.innerHTML = message;
        modal.style.display = "block";

        closeModalButton.addEventListener('click', () => modal.style.display = "none");
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    function getEquidistantPointsOnCurve(n, a, b) {
        if (!matrixBezierPoints || matrixBezierPoints.length === 0) {
            console.log("matrixBezierPoints is empty or undefined");
            return [];
        }

        a = (a * scale) + (width / 2);
        b = (b * scale) + (width / 2);

        // Determine the matrixBezierPoints subclass that falls within the range [a, b]
        let segmentPoints = matrixBezierPoints.filter(p => p.x >= a && p.x <= b);

        // Calculate lengths between adjacent points
        let lengths = [];
        for (let i = 1; i < segmentPoints.length; i++) {
            let dx = segmentPoints[i].x - segmentPoints[i - 1].x;
            let dy = segmentPoints[i].y - segmentPoints[i - 1].y;
            lengths.push(Math.sqrt(dx * dx + dy * dy));
        }

        let totalLength = lengths.reduce((acc, length) => acc + length, 0);
        let segmentLength = totalLength / (n - 1);

        let equidistantPoints = [segmentPoints[0]];
        let accumulatedLength = 0;
        let segmentAccumulatedLength = segmentLength;

        for (let i = 0; i < lengths.length; i++) {
            accumulatedLength += lengths[i];
            while (accumulatedLength >= segmentAccumulatedLength && equidistantPoints.length < n) {
                segmentAccumulatedLength += segmentLength;
                equidistantPoints.push(segmentPoints[i]);
            }
        }
        console.log(equidistantPoints);
        return equidistantPoints;
    }

    function updateCanvas() {
        const method = document.getElementById('methodSelect').value;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawScreen();
        drawCharacteristicLine(points);
        drawLabelAndPoints(points);

        if (method === 'parametric') {
            drawBezierParametric(points);
        } else if (method === 'matrix') {
            drawBezierMatrix(points);
        }
    }

    function validateAndTransformPoints(inputPoints) {
        if (!inputPoints.match(/^(-?\d+,-?\d+\s*)+$/)) {
            console.error("Invalid point format. Use the format 'x1,y1 x2,y2 ...' ");
            return;
        }

        let result = inputPoints.split(' ').map(pair => {
            const [x, y] = pair.split(',');
            return {x: parseFloat(x), y: parseFloat(y)};
        });

        for (let i = 0; i < result.length; i++) {
            result[i].x = (result[i].x * scale) + (width / 2);
            result[i].y = (height / 2) - (result[i].y * scale);
        }
        return result;
    }

    function drawScreen() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        function drawHorizontalAxis() {
            ctx.beginPath();
            ctx.moveTo(0, pixelOrigin.y);
            ctx.lineTo(width, pixelOrigin.y);
            ctx.strokeStyle = axisColor;
            ctx.stroke();

            // Add an arrow to the end of the X axis
            ctx.beginPath();
            ctx.moveTo(width - 10, pixelOrigin.y - 5);
            ctx.lineTo(width, pixelOrigin.y);
            ctx.lineTo(width - 10, pixelOrigin.y + 5);
            ctx.fillStyle = axisColor;
            ctx.fill();

            ctx.fillText('X', width - 20, pixelOrigin.y - 10);
        }

        function drawVerticalAxis() {
            ctx.beginPath();
            ctx.moveTo(pixelOrigin.x, 0);
            ctx.lineTo(pixelOrigin.x, height);
            ctx.strokeStyle = axisColor;
            ctx.stroke();

            // Add an arrow to the end of the Y axis
            ctx.beginPath();
            ctx.moveTo(pixelOrigin.x - 5, 10);
            ctx.lineTo(pixelOrigin.x, 0);
            ctx.lineTo(pixelOrigin.x + 5, 10);
            ctx.fillStyle = axisColor;
            ctx.fill();

            ctx.fillText('Y', pixelOrigin.x + 25, 15);
        }

        function drawGrid() {
            ctx.strokeStyle = gridColor;
            ctx.fillStyle = fontColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Draw horizontal grid lines and labels
            let start = -Math.floor((height / 2) / scale);
            let end = Math.ceil((height / 2) / scale);
            for (let y = start; y <= end; y++) {
                const py = pixelOrigin.y - y * scale;
                ctx.beginPath();
                ctx.moveTo(0, py);
                ctx.lineTo(width, py);
                ctx.stroke();

                // Label the units on the Y-axis
                if (y !== 0) {
                    ctx.fillText(y.toString(), pixelOrigin.x - 10, py);
                }
            }

            // Draw vertical grid lines and labels
            start = -Math.floor((width / 2) / scale);
            end = Math.ceil((width / 2) / scale);
            for (let x = start; x <= end; x++) {
                const px = pixelOrigin.x + x * scale;
                ctx.beginPath();
                ctx.moveTo(px, 0);
                ctx.lineTo(px, height);
                ctx.stroke();

                // Label the units on the X-axis
                if (x !== 0) {
                    ctx.fillText(x.toString(), px, pixelOrigin.y + 20);
                }
            }

            drawHorizontalAxis();
            drawVerticalAxis();
        }

        drawGrid();
        ctx.fillText('0', pixelOrigin.x + 7, pixelOrigin.y - 7);
    }

    function drawLabelAndPoints(points) {
        const pointRadius = 3;
        const labelOffset = {x: 5, y: 5}; // Offset for the label from the point

        for (let i = 0; i < points.length; i++) {
            // Draw point
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, pointRadius, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();

            // Label point
            ctx.font = '12px Arial';
            // ctx.fillStyle = 'black';
            ctx.fillText(`P${i}`, points[i].x + labelOffset.x, points[i].y + labelOffset.y);
        }
    }

    function drawPoints(points) {
        const pointRadius = 3;

        for (let i = 0; i < points.length; i++) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, pointRadius, 0, 2 * Math.PI);
            ctx.fillStyle = 'green';
            ctx.fill();
        }
    }

    function drawCharacteristicLine(points) {
        // Draw the characteristic broken line
        for (let i = 0; i < points.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[i + 1].x, points[i + 1].y);

            if (i === 0 || i === points.length - 2) {
                ctx.strokeStyle = '#1875f6';
            } else {
                ctx.strokeStyle = '#8f8f8f';
            }
            ctx.stroke();
        }
    }

    function drawBezierParametric(points) {
        const bernstein = (n, i, t) => {
            return factorialize(n) / (factorialize(i) * factorialize(n - i)) * Math.pow(t, i) * Math.pow(1 - t, n - i);
        };

        const getPointOnBezier = (t) => {
            let x = 0, y = 0;
            const n = points.length - 1;

            for (let i = 0; i <= n; i++) {
                const bern = bernstein(n, i, t);
                x += bern * points[i].x;
                y += bern * points[i].y;
            }

            return {x, y};
        };

        // Draw the Bézier curve
        ctx.beginPath();
        let point = getPointOnBezier(0);
        ctx.moveTo(point.x, point.y);

        for (let t = 0; t <= 1; t += 0.01) {
            point = getPointOnBezier(t);
            ctx.lineTo(point.x, point.y);
        }

        ctx.strokeStyle = "red";
        ctx.stroke();
    }

    function drawBezierMatrix(points) {
        matrixBezierPoints = [];

        ctx.beginPath();
        let point = calculateBezierPoint(0, points);
        matrixBezierPoints.push(point);
        ctx.moveTo(point.x, point.y);

        for (let t = 0; t <= 1; t += 0.01) {
            point = calculateBezierPoint(t, points);
            matrixBezierPoints.push(point);
            ctx.lineTo(point.x, point.y);
        }

        point = calculateBezierPoint(1, points);
        matrixBezierPoints.push(point);
        ctx.lineTo(point.x, point.y);

        ctx.strokeStyle = "red";
        ctx.stroke();
    }

    function calculateBezierPoint(t, points) {
        const n = points.length - 1;

        const A = calculateCreatorMatrix(points);
        const T = Array.from({length: n + 1}, (_, i) => Math.pow(t, i));
        const P = points.map(point => [point.x, point.y]);

        // T * A
        const TA = T.map((_, i) =>
            T.reduce((acc, t_j, j) => acc + t_j * A[j][i], 0)
        );

        // TA * P
        return {
            x: TA.reduce((acc, ta_i, i) => acc + ta_i * P[i][0], 0),
            y: TA.reduce((acc, ta_i, i) => acc + ta_i * P[i][1], 0)
        };
    }

    function calculateCreatorMatrix(points) {
        const n = points.length - 1;
        const bezierMatrix = new Array(n + 1);

        for (let i = 0; i <= n; i++) {
            bezierMatrix[i] = new Array(n + 1).fill(0);
            for (let j = 0; j <= i; j++) {
                bezierMatrix[i][j] = binomial(n, j) *
                    binomial(n - j, i - j) *
                    Math.pow(-1, i - j);
            }
        }
        return bezierMatrix;
    }

    function factorialize(num) {
        if (num < 0) return NaN;
        let result = 1;
        for (let i = 2; i <= num; i++) {
            result *= i;
        }
        return result;
    }

    function binomial(n, k) {
        if (k < 0 || k > n) return 0;
        return factorialize(n) / (factorialize(k) * factorialize(n - k));
    }
};