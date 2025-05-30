// Função para gerar uma cor aleatória sem a faixa amarela (mesma de home/script.js)
function getRandomColor() {
    let hue;
    do {
      hue = Math.random() * 360;
    } while (hue >= 30 && hue <= 100); // Evita tons de amarelo
    return `hsl(${hue}, 100%, 70%)`;
  }
  
  // Tenta obter a cor salva em localStorage (definida em home/script.js ao clicar no círculo About Me)
  let circleColor = localStorage.getItem('skillscircleColor');
  
  // Se não existir, gera uma nova cor e salva
  if (!circleColor) {
    circleColor = getRandomColor();
    localStorage.setItem('circleColor', circleColor);
  }
  
  // Selecionar os elementos que serão alterados
  const floatingCircle = document.getElementById('floatingCircle');
  const keywords = document.querySelectorAll('.keyword');
  const contactButton = document.querySelector('.contact-button');

  
  // Aplicar a cor recuperada aos elementos
  floatingCircle.style.backgroundColor = circleColor;
  keywords.forEach(keyword => {
    keyword.style.color = circleColor;
  });
  contactButton.style.backgroundColor = circleColor;

  
  // Evento para o círculo "voltar" (retorna para a página inicial)
  const floatingCircleBack = document.getElementById('floatingCircleBack');
  floatingCircleBack.addEventListener('click', () => {
    window.location.href = '../home/index.html';
  });
