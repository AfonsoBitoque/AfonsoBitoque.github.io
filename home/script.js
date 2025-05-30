function getRandomColor() {
  let hue;
  do {
    hue = Math.random() * 360;
  } while (hue >= 10 && hue <= 100); // Evita a faixa amarela
  return `hsl(${hue}, 100%, 70%)`;
}

// Variáveis globais para dimensões da janela
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
let windowCenterX = windowWidth / 2;
let windowCenterY = windowHeight / 2;

// Atualiza as variáveis quando a janela for redimensionada
function updateWindowDimensions() {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  windowCenterX = windowWidth / 2;
  windowCenterY = windowHeight / 2;
}


// Função auxiliar que aplica a atração para o centro em um array de corpos
function applyAttraction(bodiesArray) {
  bodiesArray.forEach((body) => {
    const dx = windowCenterX - body.position.x;
    const dy = windowCenterY - body.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return;
    const forceMagnitude = 0.0001 * distance;
    const forceX = (dx / distance) * forceMagnitude;
    const forceY = (dy / distance) * forceMagnitude;
    Body.applyForce(body, body.position, { x: forceX, y: forceY });
  });
}


// Função que utiliza a função auxiliar para ambos os grupos de círculos
function attractToCenter() {
  applyAttraction(physicsCircles);
  applyAttraction(socialPhysicsCircles);
}



// Set up scene
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  -windowCenterX, windowCenterX,
  windowCenterY, -windowCenterY, 1, 1000
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Physics engine
const Engine = Matter.Engine,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body;
const engine = Engine.create();
const world = engine.world;

// Configurações de física para movimentos mais lentos
engine.world.gravity.y = 0; // Sem gravidade
engine.world.gravity.x = 0;

// Create boundaries
const boundaries = [
  Bodies.rectangle(windowCenterX, 0, windowWidth, 10, { isStatic: true }),           // Top
  Bodies.rectangle(windowCenterX, windowHeight, windowWidth, 10, { isStatic: true }),  // Bottom
  Bodies.rectangle(0, windowCenterY, 10, windowHeight, { isStatic: true }),            // Left
  Bodies.rectangle(windowWidth, windowCenterY, 10, windowHeight, { isStatic: true })     // Right
];

World.add(world, boundaries);

// Arrays para nomes e URLs personalizados
const circleNames = ["About me", "My Skills"];
const circleUrls = [
  "../about-me/index.html",
  "../skills/index.html"
];

// Create circles
const circles = [];
const physicsCircles = [];
const circleCount = circleNames.length; // Número de círculos baseado no array
const circleRadius = 70; // Tamanho dos círculos

// Função para criar uma textura de fundo e texto no círculo
function createCircleTexture(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  const size = circleRadius * 2;
  canvas.width = size;
  canvas.height = size;

  // Gerar uma cor de fundo aleatória
  const randomColor = getRandomColor();
  context.fillStyle = randomColor;
  context.fillRect(0, 0, size, size); // Preencher o fundo

  // Definir bordas brancas
  context.strokeStyle = 'white';
  context.lineWidth = 5; // Largura da borda
  context.beginPath();
  context.arc(size / 2, size / 2, circleRadius - 2, 0, Math.PI * 2);
  context.stroke();

  // Configurar o estilo do texto
  context.fillStyle = 'white';
  context.font = '20px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, size / 2, size / 2);

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  
  return { texture, color: randomColor };
}

// Criar círculos com fundo colorido e texto
for (let i = 0; i < circleCount; i++) {
  const { texture, color } = createCircleTexture(circleNames[i]); 
  if (circleNames[i] === "About me") {
    localStorage.setItem('aboutmecircleColor', color);
    }
  if (circleNames[i] === "Projects") {
    localStorage.setItem('projectscircleColor', color);
    }
  if (circleNames[i] === "My Skills") {
    localStorage.setItem('skillscircleColor', color);
    }
  const geometry = new THREE.CircleGeometry(circleRadius, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1,
    map: texture
  });

  const circle = new THREE.Mesh(geometry, material);
  circle.userData = { color };
  const startX = Math.random() * (windowWidth - 2 * circleRadius) - windowCenterX;
  const startY = Math.random() * (windowHeight - 2 * circleRadius) - windowCenterY;
  
  circle.position.set(startX, startY, 0);
  scene.add(circle);
  circles.push(circle);

  const body = Bodies.circle(window.innerWidth / 2 + startX, window.innerHeight / 2 + startY, circleRadius, {
    restitution: 0.2,
    frictionAir: 0.05,
    friction: 0.05
  });
  World.add(world, body);
  physicsCircles.push(body);

  // Atribuir URL personalizada para cada círculo
  circle.url = circleUrls[i];
}

// Círculos das redes sociais (menores)
const socialCircles = [];
const socialBorders = [];
const socialPhysicsCircles = [];
const socialCircleRadius = 40;
const socialLinks = [
  { logo: 'assets/github.png', url: 'https://github.com/AfonsoBitoque' },
  { logo: 'assets/linkedin.png', url: 'https://www.linkedin.com/in/afonso-bitoque-844821335/' },
  { logo: 'assets/instagram.png', url: 'https://www.instagram.com/afonsobitoque/' }
];

// Função para carregar uma imagem como textura
function loadTexture(path) {
  return new Promise((resolve) => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(path, (texture) => {
      resolve(texture);
    });
  });
}

async function createSocialCircles() {
  for (let i = 0; i < socialLinks.length; i++) {
    const { logo, url } = socialLinks[i];
    const texture = await loadTexture(logo);

    const randomColor = getRandomColor();

    // Criar um círculo levemente maior para a borda
    const borderGeometry = new THREE.CircleGeometry(socialCircleRadius + 2, 32);
    const borderMaterial = new THREE.MeshBasicMaterial({ color: 'white' });
    const borderCircle = new THREE.Mesh(borderGeometry, borderMaterial);

    // Criar textura de fundo colorida para o círculo
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const size = socialCircleRadius * 2;
    canvas.width = size;
    canvas.height = size;
    
    context.fillStyle = randomColor;
    context.fillRect(0, 0, size, size);
    
    context.strokeStyle = 'white';
    context.lineWidth = 0;
    context.beginPath();
    context.arc(size / 2, size / 2, socialCircleRadius - 2, 0, Math.PI * 2);
    context.stroke();
    
    context.globalAlpha = 0.8;
    context.drawImage(texture.image, 0, 0, size, size);
    
    const finalTexture = new THREE.Texture(canvas);
    finalTexture.needsUpdate = true;

    // Criar o círculo principal com a textura
    const geometry = new THREE.CircleGeometry(socialCircleRadius, 32);
    const material = new THREE.MeshStandardMaterial({
      map: finalTexture,
      transparent: true,
      opacity: 1
    });
    const circle = new THREE.Mesh(geometry, material);
    
    // Posicionar ambos no mesmo local
    const startX = Math.random() * (window.innerWidth - 2 * socialCircleRadius) - window.innerWidth / 2;
    const startY = Math.random() * (window.innerHeight - 2 * socialCircleRadius) - window.innerHeight / 2;
    borderCircle.position.set(startX, startY, 0);
    circle.position.set(startX, startY, 0);

    scene.add(borderCircle);
    scene.add(circle);

    const body = Bodies.circle(window.innerWidth / 2 + startX, window.innerHeight / 2 + startY, socialCircleRadius, {
      restitution: 0.2,
      frictionAir: 0.05,
      friction: 0.05
    });
    World.add(world, body);
    socialPhysicsCircles.push(body);

    socialCircles.push(circle);
    socialBorders.push(borderCircle);
    circle.url = url;
  }
}

createSocialCircles();

// Adicionar luz para melhor efeito 3D
const light = new THREE.PointLight(0xffffff, 3, 1000);
light.position.set(0, 0, 500);
scene.add(light);

camera.position.z = 500;



// Variáveis para rastrear a posição anterior do cursor
let lastMouseX = 0;
let lastMouseY = 0;

function handleMouseMove(event) {
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  const deltaX = mouseX - lastMouseX;
  const deltaY = mouseY - lastMouseY;

  // Combina os dois arrays em um só
  const allPhysicsCircles = [...physicsCircles, ...socialPhysicsCircles];
  let closestCircle = null;
  let closestDistance = Infinity;

  allPhysicsCircles.forEach((body) => {
    // Define o limite: se o corpo estiver em physicsCircles usa circleRadius, caso contrário, socialCircleRadius
    const threshold = physicsCircles.includes(body) ? circleRadius * 2 : socialCircleRadius * 2;
    const dx = mouseX - body.position.x;
    const dy = mouseY - body.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < closestDistance && distance < threshold) {
      closestDistance = distance;
      closestCircle = body;
    }
  });

  if (closestCircle) {
    const forceMagnitude = 0.005;
    const forceX = -deltaX * forceMagnitude;
    const forceY = -deltaY * forceMagnitude;
    Body.applyForce(closestCircle, closestCircle.position, { x: forceX, y: forceY });
  }

  lastMouseX = mouseX;
  lastMouseY = mouseY;
}


document.addEventListener('mousemove', handleMouseMove);

// Animação da cena
function animate() {
  requestAnimationFrame(animate);
  Engine.update(engine, 16.6);

  // Atrair círculos para o centro
  attractToCenter();

  // Atualizar posições dos círculos maiores
  circles.forEach((circle, i) => {
    circle.position.x = physicsCircles[i].position.x - window.innerWidth / 2;
    circle.position.y = physicsCircles[i].position.y - window.innerHeight / 2;
  });

  // Atualizar posições dos círculos menores e suas bordas
  socialCircles.forEach((circle, i) => {
    circle.position.x = socialPhysicsCircles[i].position.x - window.innerWidth / 2;
    circle.position.y = socialPhysicsCircles[i].position.y - window.innerHeight / 2;
    socialBorders[i].position.x = circle.position.x;
    socialBorders[i].position.y = circle.position.y;
  });

  renderer.render(scene, camera);
}
animate();


function exitCircleAnimation(circle, body, targetY, duration) {
  const startTime = Date.now();
  function animateExit() {
    const currentTime = Date.now();
    const progress = (currentTime - startTime) / duration;
    if (progress < 1) {
      circle.position.y += (targetY - circle.position.y) * 0.1;
      body.position.y = circle.position.y + window.innerHeight / 2;
      requestAnimationFrame(animateExit);
    } else {
      window.location.href = circle.url;
    }
  }
  animateExit();
}


// Exemplo de uso no listener de clique:
document.addEventListener('click', (event) => {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(circles);
  if (intersects.length === 0) {
    intersects = raycaster.intersectObjects(socialCircles);
  }

  if (intersects.length > 0) {
    const circle = intersects[0].object;
    const body = [...physicsCircles, ...socialPhysicsCircles][[...circles, ...socialCircles].indexOf(circle)];
    Body.setStatic(body, true);

    const targetY = window.innerHeight + circleRadius * 2;
    const duration = 1000;
    exitCircleAnimation(circle, body, targetY, duration);
  }
});

window.addEventListener('resize', () => {
  updateWindowDimensions();
  renderer.setSize(windowWidth, windowHeight);
  camera.left = -windowCenterX;
  camera.right = windowCenterX;
  camera.top = windowCenterY;
  camera.bottom = -windowCenterY;
  camera.updateProjectionMatrix();
});

