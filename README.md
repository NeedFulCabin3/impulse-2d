# Impulse 2D

A lightweight 2D rigid-body kinematics engine built on HTML5 Canvas and vanilla JavaScript. It handles circle-to-circle, box-to-box, and mixed-geometry collisions with impulse-based momentum transfer, dynamic spatial separation, and interactive mouse-drag forces.

## Overview
impulse-2d drops external framework overhead to expose raw 2D physics math directly inside the browser window. It provides an interactive sandbox to test gravitational attraction, coefficient of restitution adjustments, and dynamic body manipulation using simple vector math and requestAnimationFrame loops.

## How it Works
The engine executes a unified frame pipeline on every loop cycle:
1. **Kinematic Updates:** Applies active gravitational acceleration and global air resistance parameters to object velocities.
2. **Bounds Enforcement:** Translates coordinates back inside screen boundaries while flipping directional vectors based on current bounciness values.
3. **Collision Detection & Resolution:**
   - **Circle vs Circle:** Radial distance checks against combined radii. Positional corrections split overlapping distance evenly before updating momentum vectors via mass-weighted impulse equations.
   - **Box vs Box:** Axis-Aligned Bounding Box (AABB) overlap measurements along X and Y axes, resolving along the shallowest penetration depth.
   - **Circle vs Box:** Clamps the circle center to the closest perimeter point on the box to derive collision normals and depth adjustments.
4. **Render:** Clears the canvas buffer and redraws updated geometry positions.

## Key Features
- **Dynamic Body Spawning:** Instantiate circular and rectangular rigid bodies into the active physics space.
- **Mouse Drag & Throw:** Grab any active object to set user-controlled spatial targets. Object velocity matches pointer delta on release, enabling manual throwing actions.
- **Global Forces Control:** Real-time UI controls to adjust gravity strength, coefficient of restitution (bounciness), or trigger vertical impulses across all bodies simultaneously.
- **Automatic Screen Resizing:** Dynamically readjusts canvas dimensions during browser window resize events while constraining entities within active viewports.

## Tech Stack
- **HTML5 Canvas API:** Hardware-accelerated 2D context rendering.
- **Vanilla JavaScript (ES6+):** Object-oriented simulation logic without external runtime dependencies.
- **CSS Flexbox:** Clean UI viewport positioning for controls and canvas binding.

## Quick Start (Browser-Based)
Run and edit this repository instantly in your browser using GitHub Codespaces:

1. Click the **Code** button at the top right of this repository.
2. Select the **Codespaces** tab and click **Create codespace on main**.
3. Once the environment loads, launch the live preview via the **Live Server** extension or open `index.html` directly in the browser preview tab.

### Local Setup
Open `index.html` directly in any web browser. No npm install or server setup needed.

## Repository Structure
```
impulse-2d/
├── index.html       # DOM structure, control panel markup, and canvas viewport
├── style.css        # Layout styles, control bar formatting, and reset rules
└── script.js        # Core physics engine, object classes, collision math, and animation loop
