// Tablero
let board;
let boardWidth = 400;
let boardHeight = 700;
let context;

// Pájaro
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// Tuberías
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Imagen después de los 8 pilares
let endImage;
let endImageX;
let endImageY;
let endImageWidth = 320; // Tamaño inicial de la imagen
let endImageHeight = 520; // Tamaño inicial de la imagen
let endImageVelocityX = -1; // Velocidad de movimiento de la imagen

// Física
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;

// Variable para controlar si se ha alcanzado el final del juego
let endReached = false;
let pipesPlaced = 0;

// Variable para controlar si el usuario ganó
let win = false;

// Evento cuando la ventana del navegador se carga
window.onload = function() {
    // Obtener el tablero y su contexto
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

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

    endImage = new Image();
    endImage.src = "./end_image.png";
    endImage.onload = function() {
        endImageX = boardWidth; // La imagen comienza fuera del tablero
        endImageY = boardHeight / 2 - endImageHeight / 9;
    }

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
        if (win) {
            // Mostrar el fade-out solo si el usuario gana
            fadeOut();
        } else {
            // Mostrar mensaje de "PERDISTE" si el usuario pierde
            context.fillText("PERDISTE", 5, 90);
        }
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

    // Mover y dibujar la imagen del final después de pasar los 8 pilares
    if (endReached) {
        endImageX += endImageVelocityX;
        context.drawImage(endImage, endImageX, endImageY, endImageWidth, endImageHeight);
        if (endImageX + endImageWidth < 0) {
            gameOver = true; // Cuando la imagen desaparezca por completo, termina el juego
        }
          // Verificar colisión con la imagen final
        if (detectCollision(bird, { x: endImageX, y: endImageY, width: endImageWidth, height: endImageHeight })) {
            gameOver = true;
            win = true; // Establecer la variable win como verdadera si el jugador gana
        }
    }

    // Dibujar la puntuación
    context.fillStyle = "yellow";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    // Mostrar mensaje de fin de juego si es necesario
    if (gameOver) {
        if (win) {
            context.fillText("YOU WIN", 5, 90); // Mensaje de "YOU WIN" si el jugador gana
        } else {
        context.fillText("PERDISTE", 5, 90);
        }
    }
}

// Función para colocar las tuberías
function placePipes() {
    if (gameOver || endReached) {
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

    pipesPlaced++;

    // Limitar la cantidad de pilares a 8
    if (pipesPlaced === 8) {
        endReached = true;
    }

    // Si ya se alcanzó el final, agregar la imagen del final
    if (endReached) {
        endImageX = pipeX + pipeWidth; // Colocar la imagen justo después del último pilar
    }
}

// Función para mover el pájaro
function moveBird(e) {
    if ((e.type === "keydown" && e.code === "Space") || e.type === "touchstart") {
        velocityY = -6; // Saltar hacia arriba
        // Reiniciar el juego si está en modo game over
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            endReached = false;
            endImageX = boardWidth; // Reiniciar la posición de la imagen final
            pipesPlaced = 0; // Reiniciar el conteo de pilares colocados
        }
    }
}

// Función para el fade-out
function fadeOut() {
    let fade = document.createElement('div');
    fade.style.position = 'fixed';
    fade.style.top = '0';
    fade.style.left = '0';
    fade.style.width = '100%';
    fade.style.height = '100%';
    fade.style.backgroundColor = 'black';
    fade.style.opacity = '0';
    fade.style.zIndex = '9999';
    document.body.appendChild(fade);

    let opacity = 0;
    let timer = setInterval(function() {
        if (opacity >= 1) {
            clearInterval(timer);
            // Cargar la página "postjuego.html" después del fade-out
            setTimeout(function() {
                window.location.href = "postjuego.html";
            }, 1000); // Esperar un segundo antes de cargar la página
        }
        fade.style.opacity = opacity;
        opacity += 0.01; // Controla la velocidad del fade-out
    }, 10); // Controla la frecuencia de actualización del fade-out
}


// Función para detectar colisiones entre dos objetos rectangulares
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
