# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based Fibonacci spiral visualization tool built with vanilla HTML5, CSS3, and JavaScript. The application creates an interactive canvas-based visualization of the Fibonacci spiral using the golden ratio (φ = 1.618...), with real-time mathematical annotations and user controls.

## Architecture

The application follows a simple client-side architecture:

- **index.html**: Main HTML structure with three-panel layout (explanation, canvas, controls)
- **script.js**: Core spiral generation logic, canvas management, and user interaction handling
- **styles.css**: Responsive styling for dark theme UI with centered canvas layout
- **dockerfile**: Container configuration for serving via Nginx

### Key Components

- **Canvas Management**: Dynamic canvas sizing based on spiral parameters and viewport constraints
- **Spiral Generation**: Mathematical implementation using golden ratio progression with segmented drawing
- **Animation System**: Frame-based animation for spiral construction visualization
- **Math Display**: Real-time rendering of radius and angle calculations for each spiral segment
- **High-DPI Support**: Device pixel ratio handling for crisp rendering on retina displays

## Running the Application

### Node.js Server (Recommended)
```bash
# Install dependencies
npm install

# Start the server
npm start

# Development mode with auto-restart
npm run dev
```
Visit `http://localhost:3000` in your browser.

### Local Development
Open `index.html` directly in a web browser - no build process required.

### Docker Deployment
```bash
docker build -t fibonacci-spiral .
docker run -p 8080:80 fibonacci-spiral
```

## Key Technical Details

- **Canvas Resolution**: Automatically adjusts for high-DPI screens using `window.devicePixelRatio`
- **Spiral Algorithm**: Uses golden ratio (φ) for radius progression with π/4 angle increments
- **Dynamic Sizing**: Canvas dimensions calculated based on maximum spiral radius with viewport constraints
- **Real-time Updates**: All parameters (scale, turns, thickness) trigger immediate spiral regeneration

## Common Development Tasks

- **Modify spiral parameters**: Edit default values in `script.js:12-15`
- **Adjust canvas sizing**: Modify `getMaxCanvasSize()` function in `script.js:18-23`
- **Change visual styling**: Update CSS variables in `styles.css` for colors and layout
- **Add new controls**: Extend the right panel in `index.html` and add corresponding event listeners in `script.js`