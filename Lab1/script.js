document.addEventListener("DOMContentLoaded", function () {
    const bgColor = "#FFFFFF";
    const axisColor = "#121212";
    const gridColor = "#ccc";
    const fontColor = "#555";
    const scale = 20;

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;
    let squares = [];

    var pixelOrigin = {
        x: width / 2,
        y: height / 2
    };

    drawScreen();

    function showError(message) {
        var errorModal = document.getElementById('errorModal');
        var errorMessage = document.getElementById('errorMessage');
        var close = document.getElementsByClassName("close")[0];

        errorMessage.textContent = message;
        errorModal.style.display = "block";

        close.onclick = function () {
            errorModal.style.display = "none";
        }

        window.onclick = function (event) {
            if (event.target === errorModal) {
                errorModal.style.display = "none";
            }
        }
    }

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
            var start = -Math.floor((height / 2) / scale);
            var end = Math.ceil((height / 2) / scale);
            for (var y = start; y <= end; y++) {
                var py = pixelOrigin.y - y * scale;
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
            for (var x = start; x <= end; x++) {
                var px = pixelOrigin.x + x * scale;
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

    window.drawSquare = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Function to get value from input
        const getValue = (id) => parseInt(document.getElementById(id).value);

        // Extracting values from input fields
        const x1 = getValue("X1");
        const y1 = getValue("Y1");
        const x2 = getValue("X2");
        const y2 = getValue("Y2");

        // Function to convert Cartesian coordinates to canvas coordinates
        const toCanvasCoords = (x, y) => ({
            x: (x * scale) + pixelOrigin.x,
            y: pixelOrigin.y - (y * scale)
        });

        // Convert points to canvas coordinates
        const canvasPoint1 = toCanvasCoords(x1, y1);
        const canvasPoint2 = toCanvasCoords(x2, y2);

        // Calculate square dimensions
        const width = Math.abs(canvasPoint2.x - canvasPoint1.x);
        const height = Math.abs(canvasPoint2.y - canvasPoint1.y);

        // Check for valid square dimensions
        if (width <= 0 || height <= 0 || width !== height) {
            showError("Incorrect values: The provided coordinates must form a square with positive dimensions.");
            return;
        }

        const isWithCircle = document.getElementById("withCircle").checked;
        const color = document.getElementById("color").value;

        const square = {
            x1: canvasPoint1.x,
            y1: canvasPoint1.y - width,
            width,
            height,
            isWithCircle,
            color
        };

        squares.push(square);
        drawAllSquares();
    }

    function drawAllSquares() {
        drawScreen();

        squares.forEach(square => {
            ctx.strokeStyle = square.color;

            // Drawing a square
            ctx.beginPath();
            ctx.rect(square.x1, square.y1, square.width, square.height);
            ctx.stroke();

            // Hatching a square
            for (let i = 0; i <= square.width; i += scale / 2) {
                ctx.beginPath();
                ctx.moveTo(square.x1 + i, square.y1);
                ctx.lineTo(square.x1 + i, square.y1 + square.height);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(square.x1, square.y1 + i);
                ctx.lineTo(square.x1 + square.width, square.y1 + i);
                ctx.stroke();
            }

            // Optional drawing incircle
            if (square.isWithCircle) {
                const radius = square.width / 2;
                const centerX = square.x1 + radius;
                const centerY = square.y1 + radius;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.stroke();
            }
        });
    }

    window.clearLastSquare = function () {
        squares.pop();
        drawAllSquares();
    }

    window.clearCanvas = function () {
        squares = [];
        drawScreen();
    }
});