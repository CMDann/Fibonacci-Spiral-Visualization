const canvas = document.getElementById('fibCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart');
const saveBtn = document.getElementById('saveImage');
const scaleInput = document.getElementById('scale');
const turnsInput = document.getElementById('turns');
const thicknessInput = document.getElementById('thickness');

// Get the device pixel ratio for high-DPI screens
const dpi = window.devicePixelRatio || 1;

let color = '#8b5cf6'; // Purple accent color
let scale = parseInt(scaleInput.value);
let turns = parseInt(turnsInput.value);
let thickness = parseInt(thicknessInput.value);

// Animation and interaction variables
let animationId = null;
let isAnimating = false;
let mouseX = 0;
let mouseY = 0;
let mouseInCanvas = false;
let animationSpeed = 0.02;
let timeOffset = 0;
let backgroundParticles = [];

// Initialize background particles
function initializeParticles() {
    backgroundParticles = [];
    for (let i = 0; i < 50; i++) {
        backgroundParticles.push({
            x: Math.random() * canvas.width / dpi,
            y: Math.random() * canvas.height / dpi,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            alpha: Math.random() * 0.3 + 0.1,
            size: Math.random() * 2 + 1
        });
    }
}

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

// Function to get dynamic color based on segment and time
function getDynamicColor(segmentIndex, totalSegments, time = 0) {
    const hue = (segmentIndex / totalSegments) * 360 + time * 30;
    const saturation = 70 + Math.sin(time * 2 + segmentIndex) * 20;
    const lightness = 50 + Math.sin(time * 3 + segmentIndex * 0.5) * 15;
    return `hsl(${hue % 360}, ${saturation}%, ${lightness}%)`;
}

// Function to create gradient
function createSpiralGradient(x1, y1, x2, y2, segmentIndex, totalSegments, time = 0) {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    const startColor = getDynamicColor(segmentIndex, totalSegments, time);
    const endColor = getDynamicColor(segmentIndex + 1, totalSegments, time);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    return gradient;
}

// Enhanced function to display math with better styling
function displayMath(currentRadius, currentAngle, x, y, segmentIndex, time = 0) {
    // Create a subtle background for text
    const textBg = `rgba(42, 42, 42, ${0.7 + Math.sin(time * 2 + segmentIndex) * 0.2})`;
    const textColor = getDynamicColor(segmentIndex, turns, time);
    
    ctx.save();
    
    // Background for text
    ctx.fillStyle = textBg;
    ctx.fillRect(x + 8, y - 25, 120, 35);
    
    // Text styling
    ctx.fillStyle = textColor;
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Display radius with glow effect
    const radiusText = `R${segmentIndex + 1}: ${Math.round(currentRadius * 100) / 100}`;
    ctx.fillText(radiusText, x + 10, y - 10);

    // Display angle
    const angleText = `θ${segmentIndex + 1}: ${Math.round(currentAngle * (180 / Math.PI))}°`;
    ctx.fillText(angleText, x + 10, y + 10);
    
    ctx.restore();
}

// Function to draw background particles
function drawBackgroundParticles(time) {
    ctx.save();
    backgroundParticles.forEach(particle => {
        // Update particle position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width / dpi;
        if (particle.x > canvas.width / dpi) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height / dpi;
        if (particle.y > canvas.height / dpi) particle.y = 0;
        
        // Draw particle with pulsing effect
        const pulseFactor = Math.sin(time * 3 + particle.x * 0.01) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${particle.alpha * pulseFactor})`;
        ctx.fill();
    });
    ctx.restore();
}

// Function to draw mouse interaction effect
function drawMouseEffect(time) {
    if (!mouseInCanvas) return;
    
    ctx.save();
    const rippleRadius = 50 + Math.sin(time * 5) * 20;
    const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, rippleRadius);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    gradient.addColorStop(0.5, 'rgba(167, 139, 250, 0.1)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, rippleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawFibonacciSpiralSegmented(time = 0) {
    let phi = (1 + Math.sqrt(5)) / 2;
    let angleIncrement = Math.PI / 4;
    let currentRadius = scale;
    let currentAngle = angle;
    let prevX = centerX;
    let prevY = centerY;

    // Draw background particles first
    drawBackgroundParticles(time);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);

    for (let i = 0; i < turns; i++) {
        let x = centerX + currentRadius * Math.cos(currentAngle);
        let y = centerY + currentRadius * Math.sin(currentAngle);
        
        // Create gradient for this segment
        const gradient = createSpiralGradient(prevX, prevY, x, y, i, turns, time);
        
        // Apply glow effect
        ctx.save();
        ctx.shadowColor = getDynamicColor(i, turns, time);
        ctx.shadowBlur = 10 + Math.sin(time * 2 + i) * 5;
        ctx.lineWidth = (thickness / dpi) * (1 + Math.sin(time * 3 + i * 0.5) * 0.3);
        ctx.strokeStyle = gradient;
        
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();

        // Display the math for each segment
        displayMath(currentRadius, currentAngle, x, y, i, time);

        prevX = x;
        prevY = y;
        currentAngle += angleIncrement;
        currentRadius *= phi;
    }
    
    // Draw mouse interaction effect
    drawMouseEffect(time);
}

// New continuous animation function
function startContinuousAnimation() {
    if (isAnimating) return;
    
    isAnimating = true;
    
    function animate() {
        if (!isAnimating) return;
        
        timeOffset += animationSpeed;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the spiral with time-based animations
        drawFibonacciSpiralSegmented(timeOffset);
        
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
}

function stopContinuousAnimation() {
    isAnimating = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Legacy animation function for compatibility
function animateSpiralSegmented() {
    let phi = (1 + Math.sqrt(5)) / 2;
    let angleIncrement = Math.PI / 4;
    let currentRadius = scale;
    let currentAngle = angle;
    let step = 0;
    let prevX = centerX;
    let prevY = centerY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackgroundParticles(timeOffset);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);

    animating = true;

    function drawStep() {
        if (step < turns) {
            let x = centerX + currentRadius * Math.cos(currentAngle);
            let y = centerY + currentRadius * Math.sin(currentAngle);
            
            // Create gradient for this segment
            const gradient = createSpiralGradient(prevX, prevY, x, y, step, turns, timeOffset);
            
            // Apply enhanced styling
            ctx.save();
            ctx.shadowColor = getDynamicColor(step, turns, timeOffset);
            ctx.shadowBlur = 8;
            ctx.lineWidth = (thickness / dpi) * (1 + Math.sin(timeOffset * 3 + step * 0.5) * 0.2);
            ctx.strokeStyle = gradient;
            
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.restore();

            // Display the math for each step
            displayMath(currentRadius, currentAngle, x, y, step, timeOffset);

            prevX = x;
            prevY = y;
            currentAngle += angleIncrement;
            currentRadius *= phi;
            step++;
            timeOffset += 0.1;

            setTimeout(() => requestAnimationFrame(drawStep), 200);
        } else {
            animating = false;
        }
    }

    drawStep();
}

function restart() {
    stopContinuousAnimation();
    setupCanvas();
    initializeParticles();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    angle = 0;
    timeOffset = 0;
    drawFibonacciSpiralSegmented(timeOffset);
    startContinuousAnimation();
}

// Function to save the canvas as a PNG
function saveCanvasAsImage() {
    const link = document.createElement('a');
    link.download = 'fibonacci_spiral.png'; // File name for the saved image
    link.href = canvas.toDataURL('image/png'); // Convert canvas content to PNG
    link.click(); // Trigger the download
}

// Mouse interaction event listeners
canvas.addEventListener('mouseenter', (e) => {
    mouseInCanvas = true;
});

canvas.addEventListener('mouseleave', (e) => {
    mouseInCanvas = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width) / dpi;
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height) / dpi;
});

// Canvas click to toggle animation
canvas.addEventListener('click', () => {
    if (isAnimating) {
        stopContinuousAnimation();
    } else {
        startContinuousAnimation();
    }
});

restartBtn.addEventListener('click', restart);
saveBtn.addEventListener('click', saveCanvasAsImage);

window.onload = () => {
    restart();
};
