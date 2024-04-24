document.addEventListener("DOMContentLoaded", function() {
    const passwordInput = document.querySelector('input[type="password"]');
    const ingresarButton = document.querySelector('.ingresar-button');
    
    // Contraseña correcta (cámbiala según necesites)
    const correctPassword = "4433";

    // Función para redirigir a la vista de juego.html
    function redirigirAJuego() {
        window.location.href = "juego.html";
    }

    // Evento al hacer clic en el botón de ingresar
    ingresarButton.addEventListener('click', function() {
        const enteredPassword = passwordInput.value;
        if (enteredPassword === correctPassword) {
            redirigirAJuego();
        } else {
            alert("Contraseña incorrecta. Por favor, inténtalo de nuevo.");
        }
    });
});

// Tablero
let board; // Tablero
let boardWidth = 400; // Ancho del tablero
let boardHeight = 700; // Alto del tablero
let context;

// Pájaro
let birdWidth = 34; // Ratio de ancho/alto = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8; // Posición inicial en X del pájaro
let birdY = boardHeight / 2; // Posición inicial en Y del pájaro
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// Tuberías
let pipeArray = [];
let pipeWidth = 64; // Ratio de ancho/alto = 1/8
let pipeHeight = 512;
let pipeX = boardWidth; // Posición inicial en X de las tuberías
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Física
let velocityX = -2; // Velocidad de movimiento hacia la izquierda de las tuberías
let velocityY = 0; // Velocidad de salto del pájaro
let gravity = 0.4;

let gameOver = false; // Estado de juego
let score = 0; // Puntuación

// Evento cuando la ventana del navegador se carga
window.onload = function() {
    // Obtener el tablero y su contexto
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // Usado para dibujar en el tablero

    // Cargar imágenes
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Bucle de actualización principal del juego
    requestAnimationFrame(update);

    // Generar tuberías cada 2 segundos
    setInterval(placePipes, 1500);

    // Evento de teclado para mover el pájaro
    document.addEventListener("keydown", moveBird);

    // Evento de toque para mover el pájaro en dispositivos móviles
    board.addEventListener("touchstart", moveBird);

}

// Función de actualización del juego
function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Actualizar posición del pájaro
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Verificar si el pájaro se sale del tablero
    if (bird.y > board.height) {
        gameOver = true;
    }

    // Mover y dibujar las tuberías
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // Incrementar la puntuación si el pájaro pasa por una tubería
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        // Verificar colisiones con las tuberías
        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Eliminar las tuberías que ya no están visibles
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Dibujar la puntuación
    context.fillStyle = "yellow";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    // Mostrar mensaje de fin de juego si es necesario
    if (gameOver) {
        context.fillText("PERDISTE", 5, 90);
    }
}

// Función para colocar las tuberías
function placePipes() {
    if (gameOver) {
        return;
    }

    // Calcular la posición aleatoria de las tuberías
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

// Función para mover el pájaro
// Función para mover el pájaro (maneja eventos de teclado y toque)
function moveBird(e) {
    if ((e.type === "keydown" && e.code === "Space") || e.type === "touchstart") {
        velocityY = -6; // Saltar hacia arriba
        // Reiniciar el juego si está en modo game over
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

// Función para detectar colisiones entre dos objetos rectangulares
function detectCollision(a, b) {
    return a.x < b.x + b.width &&   // El extremo superior izquierdo de 'a' no llega al extremo superior derecho de 'b'
           a.x + a.width > b.x &&   // El extremo superior derecho de 'a' pasa por el extremo superior izquierdo de 'b'
           a.y < b.y + b.height &&  // El extremo superior izquierdo de 'a' no llega al extremo inferior izquierdo de 'b'
           a.y + a.height > b.y;    // El extremo inferior izquierdo de 'a' pasa por el extremo superior izquierdo de 'b'
}
