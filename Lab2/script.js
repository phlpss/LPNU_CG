window.onload = function () {
    const canvas = document.getElementById('bezierCanvas');
    const ctx = canvas.getContext('2d');
    let points = [];

    drawGrid(ctx);

    document.getElementById('addBtn').addEventListener('click', function () {
        let input = document.getElementById('pointsInput').value;
        points.push({input});
    });

    document.getElementById('clearBtn').addEventListener('click', function () {
        points = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // clearCanvas(ctx);
        drawGrid(ctx);
    });

    document.getElementById('drawBtn').addEventListener('click', function () {
        const method = document.getElementById('methodSelect').value;
        let input = document.getElementById('pointsInput').value;

        // Спочатку перевірка на коректність введення
        if (!input.match(/^(\d+,\d+\s*)+$/)) {
            console.error("Invalid point format. Use the format 'x1,y1 x2,y2 ...'");
            return;
        }

        let points = input.split(' ').map(pair => {
            const [x, y] = pair.split(',');
            return {x: parseFloat(x), y: parseFloat(y)};
        });

        console.log(points);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (method === 'parametric') {
            drawBezierParametric(points);
            // drawBezier(points);
        } else if (method === 'matrix') {
            drawBezierMatrix(points);
            // drawBezier(points);
        }
    });


    function drawGrid(ctx) {
        const spacing = 30;
        ctx.strokeStyle = '#e9e9e9';
        ctx.beginPath();
        for (let i = spacing; i < canvas.width; i += spacing) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
        }
        for (let j = spacing; j < canvas.height; j += spacing) {
            ctx.moveTo(0, j);
            ctx.lineTo(canvas.width, j);
        }
        ctx.stroke();
    }

    function drawAndLabelPoints(points) {
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

    function drawBezierParametric(points) {
        console.log("drawBezierParametric() called");
        console.log(points);
        drawGrid(ctx);

        const factorial = (n) => {
            let result = 1;
            for (let i = 2; i <= n; i++) {
                result *= i;
            }
            return result;
        };

        const bernstein = (n, i, t) => {
            return factorial(n) / (factorial(i) * factorial(n - i)) * Math.pow(t, i) * Math.pow(1 - t, n - i);
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

        // Draw the characteristic broken line
        for (let i = 0; i < points.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[i + 1].x, points[i + 1].y);

            // First and last segments are tangent, draw them in one color
            if (i === 0 || i === points.length - 2) {
                ctx.strokeStyle = '#a27522'; // Color for tangent segments
            } else {
                ctx.strokeStyle = 'grey'; // Color for non-tangent segments
            }
            ctx.stroke();
        }

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

        drawAndLabelPoints(points);
    }

    function drawBezierMatrix(points) {
        const n = points.length - 1;
        const coefMatrix = getCoefMatrix(n);

        const getPointOnBezier = (t) => {
            let tMatrix = getTMatrix(n, t);
            return multiplyMatrices(tMatrix, coefMatrix, points);
        };

        ctx.beginPath();
        let point = getPointOnBezier(0);
        ctx.moveTo(point.x, point.y);

        const steps = 1000; // Кількість кроків для точності кривої
        for (let i = 1; i <= steps; i++) {
            let t = i / steps;
            point = getPointOnBezier(t);
            ctx.lineTo(point.x, point.y);
        }

        ctx.stroke();
    }

    function getCoefMatrix(n) {
        let matrix = [];
        for (let i = 0; i <= n; i++) {
            matrix[i] = [];
            for (let j = 0; j <= n; j++) {
                matrix[i][j] = j <= n ? binomialCoefficient(n, j) * Math.pow(-1, j + i) * Math.pow(1 - j / n, n) : 0;
            }
        }
        return matrix;
    }

    function getTMatrix(n, t) {
        return Array.from({length: n + 1}, (_, i) => Math.pow(t, n - i));
    }

    function multiplyMatrices(tMatrix, coefMatrix, points) {
        let result = {x: 0, y: 0};
        for (let i = 0; i < coefMatrix.length; i++) { // should be < coefMatrix.length
            let tempX = 0, tempY = 0;
            for (let j = 0; j < points.length; j++) {
                tempX += coefMatrix[i][j] * points[j].x;
                tempY += coefMatrix[i][j] * points[j].y;
            }
            result.x += tMatrix[i] * tempX;
            result.y += tMatrix[i] * tempY;
        }
        return result;
    }

    function binomialCoefficient(n, k) {
        let result = 1;
        for (let i = 1; i <= k; i++) {
            result *= (n + 1 - i) / i;
        }
        return result;
    }
};
