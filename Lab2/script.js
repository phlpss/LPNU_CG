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

    // drawGrid(ctx);
    drawScreen();

    document.getElementById('addBtn').addEventListener('click', function () {
        let input = document.getElementById('pointsInput').value;
        points.push({input});
    });

    document.getElementById('clearBtn').addEventListener('click', function () {
        points = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // clearCanvas(ctx);
        drawScreen(ctx);
    });

    document.getElementById('drawBtn').addEventListener('click', function () {
        const method = document.getElementById('methodSelect').value;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawScreen();

        let input = document.getElementById('pointsInput').value;
        if (!input.match(/^(-?\d+,-?\d+\s*)+$/)) {
            console.error("Invalid point format. Use the format 'x1,y1 x2,y2 ...' ");
            return;
        }

        let points = input.split(' ').map(pair => {
            const [x, y] = pair.split(',');
            return {x: parseFloat(x), y: parseFloat(y)};
        });

        for (let i = 0; i < points.length; i++) {
            points[i].x = (points[i].x * scale) + (width / 2);
            points[i].y = (height / 2) - (points[i].y * scale);
        }

        console.log(points);
        if (method === 'parametric') {
            drawBezierParametric(points);
        } else if (method === 'matrix') {
            // drawBezierMatrix(points);
            drawBezierCurve(points);
        }

    });


    function drawScreen() {
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
        console.log("drawBezierParametric() called");
        console.log(points);

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
        drawCharacteristicLine(points);

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

    // function factorial(n) {
    //     let result = 1;
    //     for (let i = 2; i <= n; i++) {
    //         result *= i;
    //     }
    //     return result;
    // }
    //
    // function combination(n, k) {
    //     return factorial(n) / (factorial(k) * factorial(n - k));
    // }
    //
    // function getCoefMattr(n) {
    //     let coefMattr = [];
    //
    //     for (let i = 0; i <= n; i++) {
    //         coefMattr[i] = [];
    //         for (let j = 0; j <= n; j++) {
    //             coefMattr[i][j] = (j <= i) ? combination(i, j) * Math.pow(-1, i - j) : 0;
    //         }
    //     }
    //
    //     return coefMattr;
    // }
    //
    // function getTMattr(n, t) {
    //     let tMattr = [];
    //     for (let i = 0; i <= n; i++) {
    //         tMattr.push(Math.pow(t, n - i));
    //     }
    //     return tMattr;
    // }
    //
    // function getBPart(xy, n, t, coefMattr) {
    //     let tMattr = getTMattr(n, t);
    //     let x = 0, y = 0;
    //
    //     for (let i = 0; i <= n; i++) {
    //         let tempX = 0, tempY = 0;
    //         for (let j = 0; j <= n; j++) {
    //             tempX += coefMattr[j][i] * xy[j][0];
    //             tempY += coefMattr[j][i] * xy[j][1];
    //         }
    //         x += tMattr[i] * tempX;
    //         y += tMattr[i] * tempY;
    //     }
    //
    //     return [x, y];
    // }
    //
    // function drawBezierCurve(points) {
    //     let n = points.length - 1;
    //     let coefMattr =  (n);
    //     console.log("CoeffMatr: ",coefMattr)
    //     let ts = linspace(0, 1, 1000); // Choose an appropriate number for the resolution
    //     let path = [];
    //
    //     ts.forEach(t => {
    //         path.push(getBPart(points, n, t, coefMattr));
    //     });
    //
    //     // Begin the path drawing
    //     ctx.beginPath();
    //     ctx.moveTo(path[0][0], path[0][1]);
    //
    //     for (let i = 1; i < path.length; i++) {
    //         ctx.lineTo(path[i][0], path[i][1]);
    //     }
    //
    //     ctx.stroke(); // Draw the curve
    // }
    //
    // function linspace(start, end, num) {
    //     const delta = (end - start) / (num - 1);
    //     return Array.from({length: num}, (v, i) => start + i * delta);
    // }
};
