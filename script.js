const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

// Caractères Matrix (Katakana + Alphanumérique)
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓYAユヨラリルレロワン";
let fontSize = 16;
let columns = Math.floor(canvas.width / fontSize);
let rainDrops = [];

// Fonction pour adapter la taille des éléments selon l'écran (Mobile / Tablette / PC)
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Récupère automatiquement la taille définie dans le CSS selon l'écran (600px, 930px, etc.)
    const computedStyle = getComputedStyle(document.documentElement);
    fontSize = parseInt(computedStyle.getPropertyValue('--matrix-font-size')) || 16;

    columns = Math.floor(canvas.width / fontSize);
    
    // Ajuste dynamiquement le tableau des gouttes sans tout réinitialiser
    const oldLength = rainDrops.length;
    rainDrops.length = columns;
    for (let i = oldLength; i < columns; i++) {
        rainDrops[i] = 0;
    }
}

// Initialisation de la taille au chargement
resizeCanvas();

// Timer pour la transition (en millisecondes)
let startTime = Date.now();
const SKULL_DURATION = 4000; // Le crâne reste stable pendant 4 secondes avant de couler

// Matrice complète du crâne (Grille de 28x22)
// 1 = Présence de code pour former le crâne
const skullMatrix = [
    [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1],
    [1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1],
    [1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0]
];

const skullRows = skullMatrix.length;
const skullCols = skullMatrix[0].length;

function draw() {
    // Effet de traînée noire transparente (style Matrix)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + 'px monospace';
    
    let elapsed = Date.now() - startTime;

    for (let i = 0; i < rainDrops.length; i++) {
        // Choix d'un caractère au hasard
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        const x = i * fontSize;
        const y = rainDrops[i] * fontSize;

        // Centrer le crâne à l'écran
        const startX = Math.floor((canvas.width - (skullCols * fontSize)) / 2);
        const startY = Math.floor((canvas.height - (skullRows * fontSize)) / 2);

        // Convertir la position actuelle des lignes en coordonnées de la matrice du crâne
        const matrixX = Math.floor((x - startX) / fontSize);
        const matrixY = Math.floor((y - startY) / fontSize);

        let isInSkull = false;
        if (matrixY >= 0 && matrixY < skullRows && matrixX >= 0 && matrixX < skullCols) {
            if (skullMatrix[matrixY][matrixX] === 1) {
                isInSkull = true;
            }
        }

        // GESTION DE L'ANIMATION EN CONTINU
        if (elapsed < SKULL_DURATION) {
            // PHASE 1 : On dessine et fige le code uniquement là où est le crâne
            if (isInSkull) {
                ctx.fillStyle = '#0F0'; // Vert brillant
                ctx.fillText(text, x, y);
            }
            
            // Fait défiler le code en boucle mais le limite à la zone du crâne
            rainDrops[i]++;
            if (rainDrops[i] * fontSize > canvas.height) {
                rainDrops[i] = 0;
            }
        } else {
            // PHASE 2 : Le crâne se dissout et coule comme de l'eau
            ctx.fillStyle = '#0F0';
            ctx.fillText(text, x, y);

            // Vitesse de chute classique de l'effet Matrix
            rainDrops[i]++;

            // Réinitialisation aléatoire des gouttes quand elles dépassent l'écran
            if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
        }
    }
}

// Vitesse de l'animation (30 millisecondes par étape)
setInterval(draw, 30);

// Écoute le redimensionnement ou le changement d'orientation de l'écran
window.addEventListener('resize', resizeCanvas);
