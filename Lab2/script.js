window.onload = function () {
    const canvas = document.getElementById('bezierCanvas');
    const ctx = canvas.getContext('2d');
    let points = [];

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


    function drawPoint(ctx, point) {
        const radius = 3; // Size of the point
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.stroke();
    }

    document.getElementById('setGap').addEventListener('click', function () {
        const n = parseInt(document.getElementById('pointCount').value);
        const a = parseFloat(document.getElementById('rangeStart').value);
        const b = parseFloat(document.getElementById('rangeEnd').value);

        const gapPoints = calculateGapPoints(n, a, b, points);

        // Draw each point on the canvas
        gapPoints.forEach(point => {
            const transformedPoint = transformPoint(point, scale, pixelOrigin);
            drawPoint(ctx, transformedPoint);
        });
    });

    function calculateGapPoints(n, a, b, points) {
        let gapPoints = [];
        for (let i = 0; i < n; i++) {
            let t = a + (i / (n - 1)) * (b - a); // Evenly spaced t values in [a, b]
            gapPoints.push(calculateBezierPoint(t, points));
        }
        return gapPoints;
    }
    function transformPoint(point, scale, origin) {
        return {
            x: origin.x + point.x * scale,
            y: origin.y - point.y * scale
        };
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
        const pointRadius = 3; // Size of the point on the canvas
        const labelOffset = {x: 5, y: 5}; // Offset for the label from the point

        for (let i = 0; i < points.length; i++) {
            // Draw point
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, pointRadius, 0, 2 * Math.PI);
            ctx.fillStyle = 'black'; // Color for points
            ctx.fill();

            // Label point
            ctx.font = '12px Arial';
            // ctx.fillStyle = 'black';
            ctx.fillText(`P${i}`, points[i].x + labelOffset.x, points[i].y + labelOffset.y);
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
        ctx.beginPath();
        let point = calculateBezierPoint(0, points);
        ctx.moveTo(point.x, point.y);

        for (let t = 0; t <= 1; t += 0.01) {
            point = calculateBezierPoint(t, points);
            ctx.lineTo(point.x, point.y);
        }

        point = calculateBezierPoint(1, points);
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