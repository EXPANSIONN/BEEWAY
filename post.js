const slider = document.querySelector('.slider');
const slides = document.querySelectorAll('.slide');
const slideWidth = slides[0].clientWidth;
const totalSlides = slides.length;

let counter = 0;

// Función para mover el slider automáticamente
const moveSlider = () => {
  counter++;
  if (counter >= totalSlides - 9) {
    counter = 0; // Reinicia el contador al llegar al final
    slider.style.transition = 'none'; // Desactiva la transición para que el cambio no sea visible
    setTimeout(() => { // Agrega un pequeño retraso antes de reactivar la transición
      slider.style.transition = 'transform 0.5s ease-in-out';
    }, 10);
  }
  slider.style.transform = `translateX(${-slideWidth * counter}px)`;
};

// Mover el slider automáticamente cada 3 segundos
setInterval(moveSlider, 700);

// Función para iniciar el cambio de imagen para un elemento específico
function startImageChange(element) {
    const images = element.querySelectorAll('.image img');
    let imageIndex = 0; // Índice de la imagen actual

    const intervalId = setInterval(() => {
        changeImage(images, imageIndex);
        imageIndex = (imageIndex + 1) % images.length;

        // Detener el intervalo después de mostrar todas las imágenes una vez
        if (imageIndex === 0) {
            clearInterval(intervalId);
        }
    }, 300); // Cambiar la imagen cada 300 milisegundos
    element.dataset.intervalId = intervalId; // Guardar el ID del intervalo en un atributo de datos del elemento
}

// Función para detener el cambio de imagen para un elemento específico
function stopImageChange(element) {
    clearInterval(element.dataset.intervalId); // Detener el intervalo específico para este elemento
}

// Función para cambiar la imagen actual dentro de un conjunto de imágenes
function changeImage(images, index) {
    images.forEach((img, i) => {
        if (i === index) {
            img.style.display = 'block'; // Mostrar la imagen actual
        } else {
            img.style.display = 'none'; // Ocultar las demás imágenes
        }
    });
}

// Detener el cambio de imagen al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const imageContainers = document.querySelectorAll('.image-container');
    imageContainers.forEach(element => {
        stopImageChange(element); // Detener el cambio de imagen para cada elemento al cargar la página
        element.addEventListener('mouseover', () => startImageChange(element)); // Iniciar el cambio de imagen cuando el cursor entra en el elemento
        element.addEventListener('mouseout', () => stopImageChange(element)); // Detener el cambio de imagen cuando el cursor sale del elemento
    });
});
