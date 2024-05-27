const canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

// Contadores de eliminaciones
let disappearedCount = 0; // Para las imágenes que desaparecen al tocar el borde derecho
let deletedCount = 0; // Para las imágenes eliminadas con clic de mouse

// Variable para almacenar las coordenadas del mouse
let mouseX = 0;
let mouseY = 0;

// Variable para almacenar la posición del clic
let clickX = 0;
let clickY = 0;

// Variable para determinar si se hizo clic
let isMouseClicked = false;

class ImageObject {
    constructor(x, y, width, height, src, dx, dy) {
        this.posX = x;
        this.posY = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = src;
        this.dx = dx;
        this.dy = dy;
    }

    draw(context) {
        context.drawImage(this.image, this.posX, this.posY, this.width, this.height);
    }

    update(context, images, staticImages) {
        this.draw(context);

        // Verificar colisiones con otras imágenes
        images.forEach(image => {
            if (image !== this) {
                if (this.posX < image.posX + image.width &&
                    this.posX + this.width > image.posX &&
                    this.posY < image.posY + image.height &&
                    this.posY + this.height > image.posY) {
                    // Hay colisión, invertir direcciones
                    this.dx = -this.dx;
                    this.dy = -this.dy;
                    image.dx = -image.dx;
                    image.dy = -image.dy;
                }
            }
        });

        // Verificar colisión con las imágenes estáticas
        staticImages.forEach(staticImage => {
            if (this !== staticImage && this.posX < staticImage.posX + staticImage.width &&
                this.posX + this.width > staticImage.posX &&
                this.posY < staticImage.posY + staticImage.height &&
                this.posY + this.height > staticImage.posY) {
                // Hay colisión, invertir direcciones
                this.dx = -this.dx;
                this.dy = -this.dy;
            }
        });

        // Actualiza la posición de la imagen
        this.posX += this.dx;
        this.posY += this.dy;

        // Manejo de rebote en los bordes del canvas
        if (this.posX + this.width > window_width || this.posX < 0) {
            this.dx = -this.dx;
        }
        if (this.posY + this.height > window_height || this.posY < 0) {
            this.dy = -this.dy;
        }
    }
}

function generateRandomImages(numImages) {
    let images = [];
    for (let i = 0; i < numImages; i++) {
        let width = 80;
        let height = 60;
        let x = Math.random() * (window_width - width); // Posición X dentro del canvas
        let y = Math.random() * (window_height - height); // Posición Y dentro del canvas
        let src = 'Imagenes/Balon.png'; // Ruta de la imagen
        let dx =  9; 
        let dy =  9; 
        images.push(new ImageObject(x, y, width, height, src, dx, dy));
    }
    return images;
}

// Función para mostrar las instrucciones del juego
function showInstructions() {
    alert("¡Bienvenido al juego!\n\nInstrucciones:\n- Haz clic en los balones y así evitar que te anoten un gol, cada balón eliminado será un gol a favor.\n- Si un balón toca el borde derecho se eliminará y contará como gol en contra.\n- El juego termina cuando eliminas todos los balones.");
}

showInstructions(); // Mostrar las instrucciones al inicio

let images = generateRandomImages(20);

// Agregar las nuevas imágenes estáticas
let staticImages = [
    new ImageObject(1200, 30, 110, 160, 'Imagenes/Ramos.png', 0, 0), 
    new ImageObject(1200, 500,110, 160, 'Imagenes/Nacho.png', 0, 0),
    new ImageObject(850, 320, 110, 160, 'Imagenes/Kroos.png', 0, 0),
    new ImageObject(500, 500, 110, 160, 'Imagenes/CR7.png', 0, 0),
    new ImageObject(500, 40, 110, 160, 'Imagenes/Benzema.png', 0, 0),
    new ImageObject(1400, 320, 110, 160, 'Imagenes/Iker.png', 0, 0),
];
images = images.concat(staticImages);

function updateImages() {
    requestAnimationFrame(updateImages);
    ctx.clearRect(0, 0, window_width, window_height);
    images.forEach((image, index) => {
        // Actualiza la posición de la imagen y maneja las colisiones
        image.update(ctx, images, staticImages);

        // Verifica si la imagen está en el borde derecho y la elimina
        if (image.posX + image.width >= window_width) {
            disappearedCount++; // Incrementa el contador
            images.splice(index, 1);
        }
    });
    drawMouseCoordinates(); // Llama a la función para dibujar las coordenadas del mouse
    drawCounters(); // Dibuja los contadores

    checkGameEnd(); // Verifica si todas las imágenes han desaparecido
}

// Función para obtener las coordenadas del mouse dentro del canvas
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    mouseX = evt.clientX - rect.left;
    mouseY = evt.clientY - rect.top;
}

// Manejador de eventos para detectar el movimiento del mouse
canvas.addEventListener('mousemove', function(evt) {
    getMousePos(canvas, evt);
});

// Función para actualizar las coordenadas del mouse en el canvas
function drawMouseCoordinates() {
    ctx.save(); // Guarda el estado del contexto
    updateMouseCoordinates(ctx); // Actualiza las coordenadas del mouse
    ctx.restore(); // Restaura el estado del contexto
}

function updateMouseCoordinates(context) {
  

    if (isMouseClicked) {
        // Dibujar rectángulo desde la posición del clic hasta las coordenadas (1, 1)
        context.strokeStyle = "red";
        context.lineWidth = 2;
        context.strokeRect(clickX, clickY, 1 - clickX, 1 - clickY);

        // Verificar si se hizo clic en alguna imagen y eliminarla, excepto las imágenes estáticas
        images.forEach((image, index) => {
            if (!staticImages.includes(image) && mouseX >= image.posX && mouseX <= image.posX + image.width &&
                mouseY >= image.posY && mouseY <= image.posY + image.height) {
                deletedCount++; // Incrementa el contador
                images.splice(index, 1);
            }
        });

        isMouseClicked = false; // Reinicia la bandera de clic
    }
}

// Manejador de eventos para detectar el clic del mouse
canvas.addEventListener('mousedown', function(evt) {
    clickX = evt.clientX - canvas.getBoundingClientRect().left;
    clickY = evt.clientY - canvas.getBoundingClientRect().top;
    console.log("Coordenadas del clic: X:", clickX, "Y:", clickY);
    isMouseClicked = true;
});

// Función para dibujar los contadores en el lienzo
function drawCounters() {
    ctx.font = "bold 50px Arial";
    ctx.fillStyle = "White";    
    ctx.fillText("Visitante: " + disappearedCount, 900, window_height - 625);
    ctx.fillText("VS", 600, window_height - 625);
    ctx.fillText("Local: " + deletedCount, 300, window_height - 625);
}

// Función para verificar si todas las imágenes han desaparecido y mostrar un mensaje de felicitación al ganador del juego
function checkGameEnd() {
    if (images.length === staticImages.length) {
        let message = "";
        if (disappearedCount > deletedCount) {
            message = "¡Haz Perdido El Juego!";
        } else if (disappearedCount < deletedCount) {
            message = "¡Eres El Ganador Siuuuuuu!";
        } else {
            message = "¡Es un empate!";
        }
        alert(message);
    }
}

// Llama a la función para actualizar las imágenes
updateImages();  
