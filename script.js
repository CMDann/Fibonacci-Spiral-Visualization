const canvas = document.getElementById('fibCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart');
const saveBtn = document.getElementById('saveImage'); // Button to save the image
const scaleInput = document.getElementById('scale');
const turnsInput = document.getElementById('turns');
const thicknessInput = document.getElementById('thickness');

// Get the device pixel ratio for high-DPI screens
const dpi = window.devicePixelRatio || 1;

let color = '#03a9f4'; // Default line color
let scale = parseInt(scaleInput.value);
let turns = parseInt(turnsInput.value);
let thickness = parseInt(thicknessInput.value);

// Get the current browser window dimensions
function getMaxCanvasSize() {
    return {
        width: window.innerWidth * 0.6 * dpi, // 60% of the window for the canvas
        height: window.innerHeight * dpi
    };
}

scaleInput.addEventListener('input', () => {
    scale = parseInt(scaleInput.value);
    restart();
});

turnsInput.addEventListener('input', () => {
    turns = parseInt(turnsInput.value);
    restart();
});

thicknessInput.addEventListener('input', () => {
    thickness = parseInt(thicknessInput.value);
    restart();
});

// Function to adjust the canvas resolution for high-DPI screens
function fixCanvasResolution() {
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;

    // Multiply canvas dimensions by the device pixel ratio
    canvas.width *= dpi;
    canvas.height *= dpi;

    // Scale the context to account for the increased resolution
    ctx.scale(dpi, dpi);
}

// Adjust canvas size based on the number of turns and scale
function setupCanvas() {
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    let maxRadius = scale;
    for (let i = 0; i < turns; i++) {
        maxRadius *= phi; // Each turn increases the radius by the golden ratio
    }

    const maxCanvasSize = getMaxCanvasSize();

    let calculatedWidth = maxRadius * 2 + 50; // Padding of 50 pixels
    let calculatedHeight = maxRadius * 2 + 50;

    if (calculatedWidth > maxCanvasSize.width || calculatedHeight > maxCanvasSize.height) {
        const widthRatio = maxCanvasSize.width / calculatedWidth;
        const heightRatio = maxCanvasSize.height / calculatedHeight;
        const scaleRatio = Math.min(widthRatio, heightRatio);

        calculatedWidth *= scaleRatio;
        calculatedHeight *= scaleRatio;
        maxRadius *= scaleRatio;
    }

    canvas.width = calculatedWidth;
    canvas.height = calculatedHeight;

    fixCanvasResolution();

    centerX = canvas.width / (2 * dpi);
    centerY = canvas.height / (2 * dpi);
}

let centerX;
let centerY;
let angle = 0;
let animating = false;

// Function to display the math for each segment
function displayMath(currentRadius, currentAngle, x, y, segmentIndex) {
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';

    // Display radius
    const radiusText = `R${segmentIndex + 1}: ${Math.round(currentRadius * 100) / 100}`;
    ctx.fillText(radiusText, x + 10, y - 10);

    // Display angle
    const angleText = `θ${segmentIndex + 1}: ${Math.round(currentAngle * (180 / Math.PI))}°`;
    ctx.fillText(angleText, x + 10, y + 10);
}

function drawFibonacciSpiralSegmented() {
    let phi = (1 + Math.sqrt(5)) / 2;
    let angleIncrement = Math.PI / 4;
    let currentRadius = scale;
    let currentAngle = angle;

    ctx.strokeStyle = color;
    ctx.lineWidth = thickness / dpi;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);

    for (let i = 0; i < turns; i++) {
        let x = centerX + currentRadius * Math.cos(currentAngle);
        let y = centerY + currentRadius * Math.sin(currentAngle);
        
        ctx.lineTo(x, y);
        ctx.stroke();

        // Display the math for each segment
        displayMath(currentRadius, currentAngle, x, y, i);

        currentAngle += angleIncrement;
        currentRadius *= phi;
    }
}

function animateSpiralSegmented() {
    let phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    let angleIncrement = Math.PI / 4; // Increment for the spiral's angle
    let currentRadius = scale;
    let currentAngle = angle;
    let step = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);

    animating = true;

    function drawStep() {
        if (step < turns) {
            let x = centerX + currentRadius * Math.cos(currentAngle);
            let y = centerY + currentRadius * Math.sin(currentAngle);
            ctx.lineTo(x, y);
            ctx.strokeStyle = color;
            ctx.lineWidth = thickness / dpi; // Apply dynamic thickness during animation
            ctx.stroke();

            // Display the math for each step
            displayMath(currentRadius, currentAngle, x, y, step);

            currentAngle += angleIncrement;
            currentRadius *= phi;
            step++;

            requestAnimationFrame(drawStep);
        } else {
            animating = false;
        }
    }

    drawStep();
}

function restart() {
    setupCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    angle = 0;
    drawFibonacciSpiralSegmented();
}

// Function to save the canvas as a PNG
function saveCanvasAsImage() {
    const link = document.createElement('a');
    link.download = 'fibonacci_spiral.png'; // File name for the saved image
    link.href = canvas.toDataURL('image/png'); // Convert canvas content to PNG
    link.click(); // Trigger the download
}

restartBtn.addEventListener('click', restart);
saveBtn.addEventListener('click', saveCanvasAsImage); // Save button event

window.onload = () => {
    restart();
};
