paper.install(window);

window.onload = function() {
    paper.setup(document.getElementById('bezierCanvas'));

    let path;

    function drawBezier(points) {
        if (path) {
            path.remove();
        }

        path = new paper.Path();
        path.strokeColor = 'black';

        if (points.length >= 4) {
            path.moveTo(points[0]);
            for (let i = 1; i < points.length - 2; i += 3) {
                path.cubicCurveTo(points[i], points[i + 1], points[i + 2]);
            }
        }
        paper.view.draw();
    }

    document.getElementById('drawBtn').addEventListener('click', function() {
        // Parse points from the input
        const input = document.getElementById('pointsInput').value.trim();
        const pointPairs = input.match(/\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\)/g);

        if (pointPairs) {
            const points = pointPairs.map(function (pair) {
                const coords = pair.match(/-?\d+(\.\d+)?/g);
                return new paper.Point(parseFloat(coords[0]), parseFloat(coords[1]));
            });

            drawBezier(points);
        }
    });

    document.getElementById('clearBtn').addEventListener('click', function() {
        if (path) {
            path.remove();
            path = null;
        }
        paper.view.draw();
    });
}