const toggle = document.getElementById("themeToggle");

toggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark",
  );
  startAnimation();
});

if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
}

// Nav highlight on scroll
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("#nav ul a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 150 && rect.bottom >= 150) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// Project tab filtering
const tabBtns = document.querySelectorAll(".tab-btn");
const projectGrid = document.querySelector(".project-grid");
const projectCards = document.querySelectorAll(".project-card");

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    projectGrid.style.opacity = "0";
    projectGrid.style.transform = "translateY(6px)";

    setTimeout(() => {
      projectCards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !match);
      });
      projectGrid.style.opacity = "1";
      projectGrid.style.transform = "translateY(0)";
    }, 180);
  });
});

// Canvas
const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");
let animFrame;

function resize() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

// --- Constellation ---
let stars = [];

function createStars() {
  stars = [];
  const count = Math.floor((canvas.width * canvas.height) / 8000);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    });
  }
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach((star) => {
    star.x += star.vx;
    star.y += star.vy;
    if (star.x < 0 || star.x > canvas.width) star.vx *= -1;
    if (star.y < 0 || star.y > canvas.height) star.vy *= -1;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fill();
  });

  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dx = stars[i].x - stars[j].x;
      const dy = stars[i].y - stars[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(stars[i].x, stars[i].y);
        ctx.lineTo(stars[j].x, stars[j].y);
        ctx.strokeStyle = `rgba(255,255,255,${0.15 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  animFrame = requestAnimationFrame(drawStars);
}

// --- Clouds ---
let clouds = [];

// Puff layout: x/y as fractions of cloud W/H, r as fraction of W
// Arranged in 3 layers: base (wide, flat), mid, top — cumulus shape
const PUFF_LAYOUT = [
  { x: 0.07, y: 0.78, r: 0.11 },
  { x: 0.20, y: 0.84, r: 0.13 },
  { x: 0.36, y: 0.78, r: 0.15 },
  { x: 0.53, y: 0.82, r: 0.13 },
  { x: 0.68, y: 0.77, r: 0.12 },
  { x: 0.83, y: 0.83, r: 0.10 },
  { x: 0.17, y: 0.52, r: 0.13 },
  { x: 0.33, y: 0.40, r: 0.16 },
  { x: 0.51, y: 0.36, r: 0.18 },
  { x: 0.67, y: 0.44, r: 0.15 },
  { x: 0.80, y: 0.53, r: 0.11 },
  { x: 0.32, y: 0.20, r: 0.12 },
  { x: 0.50, y: 0.12, r: 0.14 },
  { x: 0.64, y: 0.21, r: 0.11 },
];

function bakeCloud(scale) {
  const W = Math.round(340 * scale);
  const H = Math.round(145 * scale);
  const pad = Math.round(28 * scale);
  const oc = document.createElement("canvas");
  oc.width = W + pad * 2;
  oc.height = H + pad * 2;
  const oc2 = oc.getContext("2d");

  // Add small random jitter per cloud so no two look identical
  const jitter = () => (Math.random() - 0.5) * 0.05;
  const puffs = PUFF_LAYOUT.map(p => ({
    x: (p.x + jitter()) * W,
    y: (p.y + jitter()) * H,
    r: p.r * W * (0.88 + Math.random() * 0.24),
  }));

  // Layer 1 — blue-grey shadow, offset down-right for depth
  puffs.forEach(({ x, y, r }) => {
    oc2.beginPath();
    oc2.arc(pad + x + r * 0.18, pad + y + r * 0.22, r * 0.88, 0, Math.PI * 2);
    oc2.fillStyle = "rgba(130, 168, 210, 0.55)";
    oc2.fill();
  });

  // Layer 2 — main body, off-white
  puffs.forEach(({ x, y, r }) => {
    oc2.beginPath();
    oc2.arc(pad + x, pad + y, r, 0, Math.PI * 2);
    oc2.fillStyle = "rgba(238, 248, 255, 0.96)";
    oc2.fill();
  });

  // Layer 3 — bright white highlight on upper puffs only
  puffs.slice(6).forEach(({ x, y, r }) => {
    oc2.beginPath();
    oc2.arc(pad + x - r * 0.08, pad + y - r * 0.12, r * 0.62, 0, Math.PI * 2);
    oc2.fillStyle = "rgba(255, 255, 255, 0.95)";
    oc2.fill();
  });

  return { img: oc, pad, W };
}

function makeCloud(x) {
  const scale = Math.random() * 0.75 + 0.5;
  return {
    x,
    y: Math.random() * canvas.height * 0.70 + 30,
    speed: Math.random() * 0.28 + 0.07,
    scale,
    alpha: Math.random() * 0.08 + 0.88,
    baked: bakeCloud(scale),
  };
}

function createClouds() {
  clouds = [];
  for (let i = 0; i < 7; i++) {
    clouds.push(makeCloud(Math.random() * canvas.width));
  }
}

function drawClouds() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  clouds.forEach((cloud) => {
    cloud.x += cloud.speed;
    if (cloud.x > canvas.width + cloud.baked.pad) {
      cloud.x = -(cloud.baked.W + cloud.baked.pad);
      cloud.y = Math.random() * canvas.height * 0.70 + 30;
      cloud.baked = bakeCloud(cloud.scale); // re-bake for variety
    }
    const blurPx = Math.round(14 * cloud.scale);
    ctx.save();
    ctx.filter = `blur(${blurPx}px)`;
    ctx.globalAlpha = cloud.alpha;
    ctx.drawImage(cloud.baked.img, cloud.x - cloud.baked.pad, cloud.y - cloud.baked.pad);
    ctx.restore();
  });

  animFrame = requestAnimationFrame(drawClouds);
}

// --- Switch ---
function startAnimation() {
  cancelAnimationFrame(animFrame);
  if (document.body.classList.contains("light")) {
    createClouds();
    drawClouds();
  } else {
    createStars();
    drawStars();
  }
}

resize();
startAnimation();

window.addEventListener("resize", () => {
  resize();
  startAnimation();
});

// Custom cursor
const dot = document.getElementById("cursorDot");
const ring = document.getElementById("cursorRing");

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + "px";
  dot.style.top = mouseY + "px";
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + "px";
  ring.style.top = ringY + "px";
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll("a, button").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    ring.style.width = "48px";
    ring.style.height = "48px";
    ring.style.opacity = "1";
    ring.style.borderColor = "var(--accent-2)";
  });
  el.addEventListener("mouseleave", () => {
    ring.style.width = "32px";
    ring.style.height = "32px";
    ring.style.opacity = "0.6";
    ring.style.borderColor = "var(--accent-1)";
  });
});
