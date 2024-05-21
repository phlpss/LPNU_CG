let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let x1, y1, x2, y2, scale, dx = 1, dy = -1, moving = true, repaint = true
// const matrixJs = require("matrix-js");

document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault()
    x1 = parseInt(document.getElementById('x1').value)
    y1 = parseInt(document.getElementById('y1').value)
    const squareSize = parseInt(document.getElementById('square-size').value)
    x2 = squareSize + x1
    y2 = squareSize + y1
    scale = parseInt(document.getElementById('scale').value)
    repaint = document.getElementById('repaint').checked
    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2) || isNaN(scale)) {
        alert('Будь ласка, введіть числові значення для координат та коефіцієнта масштабування.')
        return
    }
    drawCoordinateSystem()
    drawRectangle()
    moveRectangle()

    // console.log(mirrorByPoint(0, 0))
    // console.log(scaleByFactors(2, 2))
})

document.getElementById('stop').addEventListener('click', () => {
    moving = false
})

document.getElementById('resume').addEventListener('click', () => {
    moving = true
    moveRectangle()
})

function drawCoordinateSystem() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.strokeStyle = 'black'
    ctx.stroke()
    ctx.fillText('Y', canvas.width / 2 - 10, 10)
    ctx.fillText('X', canvas.width - 10, canvas.height / 2 + 10)
}

function drawRectangle() {
    if (repaint) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawCoordinateSystem()
    }
    ctx.beginPath()
    ctx.rect(x1, y1, x2 - x1, y2 - y1)
    ctx.fillStyle = '#85b0d1'
    ctx.fill()
}

function moveRectangle() {
    if (!moving) return
    x1 += dx * scale
    x2 += dx * scale
    y1 += dy * scale
    y2 += dy * scale
    if (x1 < 0 || x2 > canvas.width || y1 < 0 || y2 > canvas.height) {
        dx *= -1
        dy *= -1
        x1 += 2 * dx * scale
        x2 += 2 * dx * scale
        y1 += 2 * dy * scale
        y2 += 2 * dy * scale
    }
    drawRectangle()
    requestAnimationFrame(moveRectangle)
}

// function mirrorByPoint(m, n) {
//     const T1 = matrixJs([
//         [1, 0, 0],
//         [0, 1, 0],
//         [-m, -n, 1]
//     ])
//     const T2 = matrixJs([
//         [1, 0, 0],
//         [0, 1, 0],
//         [m, n, 1]
//     ])
//     const D = matrixJs([
//         [-1, 0, 0],
//         [0, -1, 0],
//         [0, 0, 1]
//     ])
//     return T1.mul(D).mul(T2)
// }
//
// function scaleByFactors(a, d) {
//     return matrixJs([
//         [a, 0, 0],
//         [0, d, 0],
//         [0, 0, 1]
//     ])
// }