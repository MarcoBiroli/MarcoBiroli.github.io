// Particle Animation
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
const numberOfParticles = 150;
const particleColors = ['#FF5733', '#33FFBD', '#FF33F6', '#33D4FF', '#33FF57'];
let animationActive = true;  // Flag to stop the animation
let startTime = Date.now();  // Track when the animation started
const totalAnimationDuration = 3000;// 6000;  // Total duration of animation (4 seconds)
const shrinkDuration = 2000;  // Last 0.5 seconds for shrinking and going back to center
const normalMoveDuration = totalAnimationDuration - shrinkDuration;  // First 3.5 seconds
const overlap = 2000;
let trailsCleared = false;  // Flag to ensure trails are cleared only once

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.originalX = x;
    this.originalY = y;
    this.size = Math.random() * 5 + 3;  // Fixed size for first 3.5 seconds
    this.color = color;
    this.speedX = (Math.random() * 3) - 1;
    this.speedY = (Math.random() * 3) - 1;
    this.angle = Math.random() * 360; // Angle for random circular movement
    this.angleChange = (Math.random() * 0.2) - 0.1; // Small random change in angle for curving paths
  }

  update() {
    const elapsedTime = Date.now() - startTime;

    // First 3.5 seconds: Particles move randomly and maintain size
    if (elapsedTime < normalMoveDuration) {
      if (Math.random() < 0.2){
        this.angle += this.angleChange;
      }
      this.x += Math.cos(this.angle) * this.speedX;
      this.y += Math.sin(this.angle) * this.speedY;
    }
    // Last 0.5 seconds: Shrink back to center
    else if (elapsedTime >= normalMoveDuration && elapsedTime <= totalAnimationDuration) {
        if (!trailsCleared) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          trailsCleared = true;  // Set the flag so it happens only once
        }
      const progress = (elapsedTime - normalMoveDuration) / shrinkDuration;
      this.x += (canvas.width / 2 - this.x) * progress;  // Move towards the center
      this.y += (canvas.height / 2 - this.y) * progress;  // Move towards the center
      this.size *= (1 - progress);  // Shrink as it moves back
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particlesArray = [];
  for (let i = 0; i < numberOfParticles; i++) {
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let color = particleColors[Math.floor(Math.random() * particleColors.length)];
    particlesArray.push(new Particle(x, y, color));
  }
}

function handleParticles() {
  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
    particlesArray[i].draw();
  }
}

// Animation Loop
function animate() {
  if (!animationActive) return; // Stop the animation if the flag is false

  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Faint trail effect
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  handleParticles();
  requestAnimationFrame(animate);
}

// Start the particle animation
initParticles();
animate();

// Run the particle animation for 4 seconds and then hide it
setTimeout(() => {
  // Stop the particle animation
  // animationActive = false; // Set the flag to stop the animation loop

  // Fade out the animation screen and show the main content after fade
  const animationDiv = document.getElementById('animation');
  animationDiv.classList.add('hidden');  // This triggers the CSS fade-out effect
  document.querySelector('.container').classList.remove('hidden');
  document.querySelector('.container').classList.add('visible');
  
  // After 1.5 seconds (the duration of the fade-out), show the main content
  setTimeout(() => {
    animationActive = false;
  }, 1000); // Wait for the fade-out to complete
}, totalAnimationDuration-overlap);

// Resize the canvas when the window is resized
window.addEventListener('resize', function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Variables to target the left and right columns
const mainContainer = document.querySelector('.container');

// Function to move the halo effect
function moveHalo(e) {
  const x = e.clientX;  // X-coordinate of the mouse
  const y = e.clientY;  // Y-coordinate of the mouse
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Calculate percentage positions for the radial gradient
  const xPercent = (x / windowWidth) * 100;
  const yPercent = (y / windowHeight) * 100;

  // Update the background gradient position for the left column
  mainContainer.style.background = `radial-gradient(600px at ${xPercent}% ${yPercent}%, rgba(29, 78, 216, 0.15), transparent 80%)`;
}

// Listen for mousemove event to trigger the halo effect
document.addEventListener('mousemove', moveHalo);

window.addEventListener('wheel', function(event) {
    const rightColumn = document.querySelector('.right');
    rightColumn.scrollTop += event.deltaY; // Manual scroll
});
