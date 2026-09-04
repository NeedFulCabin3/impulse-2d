const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const spawnCircleBtn = document.getElementById('spawn-circle');
const spawnBoxBtn = document.getElementById('spawn-box');
const jumpBtn = document.getElementById('jump-btn');
const clearBtn = document.getElementById('clear');
const gravitySlider = document.getElementById('gravity-slider');
const bounceSlider = document.getElementById('bounce-slider');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight - 56;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight - 56;
});

let gravity = parseFloat(gravitySlider.value);
let restitution = parseFloat(bounceSlider.value);

gravitySlider.addEventListener('input', (e) => gravity = parseFloat(e.target.value));
bounceSlider.addEventListener('input', (e) => restitution = parseFloat(e.target.value));

const friction = 0.99; 
const bodies = [];

class Body {
    constructor(x, y, type = 'circle') {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.type = type;
        this.mass = type === 'circle' ? 1 : 2;
        this.color = `hsl(${Math.random() * 360}, 75%, 60%)`;
        this.isGrabbed = false;

        if (type === 'circle') {
            this.radius = 20 + Math.random() * 25;
        } else {
            this.w = 40 + Math.random() * 40;
            this.h = 40 + Math.random() * 40;
        }
    }

    update() {
        if (this.isGrabbed) return;

        this.vy += gravity;
        this.vx *= friction;
        this.vy *= friction;
        this.x += this.vx;
        this.y += this.vy;

        this.resolveScreenBounds();
    }

    resolveScreenBounds() {
        if (this.type === 'circle') {
            if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.vx *= -restitution;
            } else if (this.x + this.radius > width) {
                this.x = width - this.radius;
                this.vx *= -restitution;
            }
            if (this.y - this.radius < 0) {
                this.y = this.radius;
                this.vy *= -restitution;
            } else if (this.y + this.radius > height) {
                this.y = height - this.radius;
                this.vy *= -restitution;
            }
        } else {
            if (this.x < 0) {
                this.x = 0;
                this.vx *= -restitution;
            } else if (this.x + this.w > width) {
                this.x = width - this.w;
                this.vx *= -restitution;
            }
            if (this.y < 0) {
                this.y = 0;
                this.vy *= -restitution;
            } else if (this.y + this.h > height) {
                this.y = height - this.h;
                this.vy *= -restitution;
            }
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.type === 'circle') {
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(this.x, this.y, this.w, this.h);
        }
        ctx.closePath();
    }

    containsPoint(px, py) {
        if (this.type === 'circle') {
            const dx = px - this.x;
            const dy = py - this.y;
            return dx * dx + dy * dy < this.radius * this.radius;
        } else {
            return px >= this.x && px <= this.x + this.w && py >= this.y && py <= this.y + this.h;
        }
    }
}

function resolveCollision(b1, b2) {
    if (b1.type === 'circle' && b2.type === 'circle') {
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = b1.radius + b2.radius;

        if (dist < minDist) {
            const normalX = dx / dist;
            const normalY = dy / dist;

            const overlap = minDist - dist;
            const correctionX = normalX * overlap * 0.5;
            const correctionY = normalY * overlap * 0.5;

            if (!b1.isGrabbed) { b1.x -= correctionX; b1.y -= correctionY; }
            if (!b2.isGrabbed) { b2.x += correctionX; b2.y += correctionY; }

            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = 2 * (normalX * kx + normalY * ky) / (b1.mass + b2.mass);

            if (!b1.isGrabbed) {
                b1.vx -= p * b2.mass * normalX * restitution;
                b1.vy -= p * b2.mass * normalY * restitution;
            }
            if (!b2.isGrabbed) {
                b2.vx += p * b1.mass * normalX * restitution;
                b2.vy += p * b1.mass * normalY * restitution;
            }
        }
    } else if (b1.type === 'box' && b2.type === 'box') {
        const overlapX = Math.min(b1.x + b1.w, b2.x + b2.w) - Math.max(b1.x, b2.x);
        const overlapY = Math.min(b1.y + b1.h, b2.y + b2.h) - Math.max(b1.y, b2.y);

        if (overlapX > 0 && overlapY > 0) {
            if (overlapX < overlapY) {
                const dir = (b1.x + b1.w/2 < b2.x + b2.w/2) ? -1 : 1;
                if (!b1.isGrabbed) b1.x += overlapX * 0.5 * dir;
                if (!b2.isGrabbed) b2.x -= overlapX * 0.5 * dir;
                
                const temp = b1.vx;
                b1.vx = b2.vx * restitution;
                b2.vx = temp * restitution;
            } else {
                const dir = (b1.y + b1.h/2 < b2.y + b2.h/2) ? -1 : 1;
                if (!b1.isGrabbed) b1.y += overlapY * 0.5 * dir;
                if (!b2.isGrabbed) b2.y -= overlapY * 0.5 * dir;

                const temp = b1.vy;
                b1.vy = b2.vy * restitution;
                b2.vy = temp * restitution;
            }
        }
    } else {
        const circle = b1.type === 'circle' ? b1 : b2;
        const box = b1.type === 'box' ? b1 : b2;

        const closestX = Math.max(box.x, Math.min(circle.x, box.x + box.w));
        const closestY = Math.max(box.y, Math.min(circle.y, box.y + box.h));

        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
        const dist = Math.hypot(dx, dy);

        if (dist < circle.radius) {
            const normalX = dist === 0 ? 0 : dx / dist;
            const normalY = dist === 0 ? -1 : dy / dist;
            const overlap = circle.radius - dist;

            const shiftX = normalX * overlap;
            const shiftY = normalY * overlap;

            if (circle === b1) {
                if (!b1.isGrabbed) { b1.x += shiftX; b1.y += shiftY; }
                b1.vx = -b1.vx * restitution;
                b1.vy = -b1.vy * restitution;
            } else {
                if (!b2.isGrabbed) { b2.x += shiftX; b2.y += shiftY; }
                b2.vx = -b2.vx * restitution;
                b2.vy = -b2.vy * restitution;
            }
        }
    }
}

let activeBody = null;
let dragOffset = { x: 0, y: 0 };
let lastMouse = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (let i = bodies.length - 1; i >= 0; i--) {
        if (bodies[i].containsPoint(mx, my)) {
            activeBody = bodies[i];
            activeBody.isGrabbed = true;
            activeBody.vx = 0;
            activeBody.vy = 0;
            dragOffset.x = mx - activeBody.x;
            dragOffset.y = my - activeBody.y;
            lastMouse = { x: mx, y: my };
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!activeBody) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    activeBody.x = mx - dragOffset.x;
    activeBody.y = my - dragOffset.y;

    activeBody.vx = mx - lastMouse.x;
    activeBody.vy = my - lastMouse.y;

    lastMouse = { x: mx, y: my };
});

window.addEventListener('mouseup', () => {
    if (activeBody) {
        activeBody.isGrabbed = false;
        activeBody = null;
    }
});

spawnCircleBtn.addEventListener('click', () => {
    bodies.push(new Body(width / 2, 80, 'circle'));
});

spawnBoxBtn.addEventListener('click', () => {
    bodies.push(new Body(width / 2, 80, 'box'));
});

jumpBtn.addEventListener('click', () => {
    for (let i = 0; i < bodies.length; i++) {
        // Apply a negative velocity to force them upward regardless of position
        bodies[i].vy = -15; 
    }
});

clearBtn.addEventListener('click', () => {
    bodies.length = 0;
});

for (let i = 0; i < 15; i++) {
    bodies.push(new Body(Math.random() * (width - 100) + 50, Math.random() * (height - 200) + 50, Math.random() > 0.5 ? 'circle' : 'box'));
}

function loop() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < bodies.length; i++) {
        bodies[i].update();
    }

    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            resolveCollision(bodies[i], bodies[j]);
        }
    }

    for (let i = 0; i < bodies.length; i++) {
        bodies[i].draw();
    }

    requestAnimationFrame(loop);
}

loop();