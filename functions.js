// Array para guardar el historial de cálculos
let historialCalculos = [];

// Función para agregar multiplicación implícita
function agregarMultiplicacionImplicita(expresion) {
    let resultado = expresion;
    
    // Casos de multiplicación implícita que se deben detectar:
    // 1. Número seguido de paréntesis abierto: 6( → 6*(
    resultado = resultado.replace(/(\d)(\()/g, '$1*$2');
    
    // 2. Paréntesis cerrado seguido de número: )6 → )*6
    resultado = resultado.replace(/(\))(\d)/g, '$1*$2');
    
    // 3. Paréntesis cerrado seguido de paréntesis abierto: )( → )*(
    resultado = resultado.replace(/(\))(\()/g, '$1*$2');
    
    // 4. Número seguido de función (para calculadora científica): 6sin → 6*sin
    resultado = resultado.replace(/(\d)(sin|cos|tan|sqrt|√|log)/g, '$1*$2');
    
    // 5. Paréntesis cerrado seguido de función: )sin → )*sin
    resultado = resultado.replace(/(\))(sin|cos|tan|sqrt|√|log)/g, '$1*$2');
    
    return resultado;
}

//Header
const list = document.querySelectorAll(".list");
function activelink() {
  list.forEach((item) => item.classList.remove("active"));
  this.classList.add("active");
  
  const index = Array.from(list).indexOf(this);
  
  const calculadoraNormal = document.getElementById("calculadoraNormal");
  const calculadoraCientifica = document.getElementById("calculadoraCientifica");
  
  // Determinar cual calculadora está actualmente visible
  const currentVisible = calculadoraNormal.style.display !== "none" ? calculadoraNormal : calculadoraCientifica;
  const nextVisible = index === 0 ? calculadoraNormal : calculadoraCientifica;
  
  // Si es la misma calculadora, no hacer nada
  if (currentVisible === nextVisible) return;
  
  // Aplicar fade out a la calculadora actual
  currentVisible.classList.add("fade-out");
  
  // Después de la transición, cambiar la visibilidad
  setTimeout(() => {
    if (index === 0) {
      calculadoraNormal.style.display = "flex";
      calculadoraCientifica.style.display = "none";
    } else if (index === 1) {
      calculadoraNormal.style.display = "none";
      calculadoraCientifica.style.display = "flex";
    }
    
    // Remover fade-out de la calculadora anterior
    currentVisible.classList.remove("fade-out");
    
    // Aplicar fade-in a la nueva calculadora
    nextVisible.classList.add("fade-in");
    
    // Remover fade-in después de la transición
    setTimeout(() => {
      nextVisible.classList.remove("fade-in");
    }, 400);
  }, 400);
}
list.forEach((item) => item.addEventListener("click", activelink));

const menuIcon = document.querySelector(".Historial");
const menuPanel = document.querySelector(".Menu");

menuIcon.addEventListener("click", () => {
    menuPanel.classList.toggle("show");
});

document.addEventListener('click', function(event) {
    const isClickInsideMenu = menuPanel.contains(event.target);
    const isClickOnIcon = menuIcon.contains(event.target);

    if (menuPanel.classList.contains('show') && !isClickInsideMenu && !isClickOnIcon) {
        menuPanel.classList.remove('show');
    }
});

function agregarAlHistorial(operacion, resultado, tipoCalculadora = "Normal") {
    const calculo = {
        operacion: operacion,
        resultado: resultado,
        fecha: new Date().toLocaleString(),
        tipo: tipoCalculadora
    };
    
    historialCalculos.unshift(calculo);
    
    if (historialCalculos.length > 20) {
        historialCalculos.pop();
    }
    
    actualizarVistaHistorial();
}

function actualizarVistaHistorial() {
    const historialList = document.getElementById("historialList");
    historialList.innerHTML = "";
    
    if (historialCalculos.length === 0) {
        historialList.innerHTML = '<div style="color: #bdc3c7; text-align: center; padding: 20px;">No hay cálculos en el historial</div>';
        return;
    }
    
    historialCalculos.forEach((calculo, index) => {
        const item = document.createElement("div");
        item.className = "historial-item";
        
        // Determinar el color y estilo según el tipo de calculadora
        const tipoColor = calculo.tipo === "Científica" ? "#3498db" : "#e74c3c";
        const tipoBackground = calculo.tipo === "Científica" ? "#ecf0f1" : "#fadbd8";
        
        item.innerHTML = `
            <div class="historial-header">
                <div class="historial-operation">${calculo.operacion}</div>
                <div class="historial-tipo" style="background-color: ${tipoColor}; color: white;">
                    ${calculo.tipo}
                </div>
            </div>
            <div class="historial-result">= ${calculo.resultado}</div>
            <div class="historial-time">${calculo.fecha}</div>
        `;
        
        item.addEventListener("click", () => {
            const calculadoraNormal = document.getElementById("calculadoraNormal");
            const calculadoraCientifica = document.getElementById("calculadoraCientifica");
            
            if (calculadoraNormal.style.display !== "none") {
                document.getElementById("input").value = calculo.operacion;
            } else {
                document.getElementById("inputCien").value = calculo.operacion;
            }
            
            document.querySelector(".Menu").classList.remove("show");
        });
        
        historialList.appendChild(item);
    });
}

function limpiarHistorial() {
    historialCalculos = [];
    actualizarVistaHistorial();
}

document.getElementById("clearHistorial").addEventListener("click", limpiarHistorial);

//Calculadora Simple
function numberToInput(num){
    document.getElementById("input").value += num;
}

function clearInput(){
    document.getElementById("input").value = "";
}

function CalculateResult(){
    let input = document.getElementById("input").value;
    let operacionOriginal = input;
    
    try{
        // Validación más permisiva para funciones matemáticas
        if (!/^[0-9+\-*/.()^√sincotaglrt ]+$/.test(input)) {
            document.getElementById("input").value = "Error";
            return;
        }
        
        // Agregar multiplicación implícita
        input = agregarMultiplicacionImplicita(input);
        
        let result = eval(input);
        
        if (isNaN(result) || !isFinite(result)) {
            document.getElementById("input").value = "Error";
            return;
        }
        
        result = Math.round(result * 1000000) / 1000000;
        
        agregarAlHistorial(operacionOriginal, result, "Normal");
        
        document.getElementById("input").value = result;
    }catch(e){
        document.getElementById("input").value = "Error";
        console.error("Calculation error: ", e);
    }
}

//Calculadora Científica
function numberToInputC(num){
    document.getElementById("inputCien").value += num;
}

function clearInputC(){
    document.getElementById("inputCien").value = "";
}

function CalculateResultC(){
    let input = document.getElementById("inputCien").value;
    let operacionOriginal = input;
    
    try{
        // Validación más permisiva para funciones matemáticas
        if (!/^[0-9+\-*/.()^√sincotaglrt ]+$/.test(input)) {
            document.getElementById("inputCien").value = "Error";
            return;
        }
        
        // Agregar multiplicación implícita
        input = agregarMultiplicacionImplicita(input);
        
        input = input.replace(/sqrt\(/g, 'Math.sqrt(');
        input = input.replace(/√\(/g, 'Math.sqrt(');
        input = input.replace(/log\(/g, 'Math.log10(');
        
        input = input.replace(/sin\(/g, 'Math.sin((Math.PI/180)*');
        input = input.replace(/cos\(/g, 'Math.cos((Math.PI/180)*');
        input = input.replace(/tan\(/g, 'Math.tan((Math.PI/180)*');
        
        input = input.replace(/sin([0-9.]+)/g, 'Math.sin($1 * Math.PI / 180)');
        input = input.replace(/cos([0-9.]+)/g, 'Math.cos($1 * Math.PI / 180)');
        input = input.replace(/tan([0-9.]+)/g, 'Math.tan($1 * Math.PI / 180)');
        input = input.replace(/√([0-9.]+)/g, 'Math.sqrt($1)');
        input = input.replace(/sqrt([0-9.]+)/g, 'Math.sqrt($1)');
        
        input = input.replace(/\^/g, '**');
        
        let result = eval(input);
        
        if (isNaN(result) || !isFinite(result)) {
            document.getElementById("inputCien").value = "Error";
            return;
        }
        
        result = Math.round(result * 1000000) / 1000000;
        
        agregarAlHistorial(operacionOriginal, result, "Científica");
        
        document.getElementById("inputCien").value = result;
    }catch(e){
        document.getElementById("inputCien").value = "Error";
    }
}

// Función para crear la animación de fondo
function createAnimatedBackground() {
    const background = document.getElementById('animatedBg');
    const mathSymbols = ['∫', '∑', '∞', 'π', '√', '±', '≥', '≤', '≠', '≈', '∆', 'Ω', 'α', 'β', 'γ', 'θ', 'λ', 'μ', 'σ', 'φ', '+', '-', '×', '÷', '=', '(', ')', '{', '}', '[', ']', '%', '²', '³', '⁴', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉', '₀'];
    
    function createIcon() {
        const icon = document.createElement('div');
        icon.className = 'math-icon';
        icon.textContent = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
        
        // Posición inicial aleatoria en X
        const startX = Math.random() * window.innerWidth;
        icon.style.left = startX + 'px';
        
        // Tamaño aleatorio
        const size = Math.random() * 20 + 16;
        icon.style.fontSize = size + 'px';
        
        // Velocidad aleatoria (duración de la animación)
        const duration = Math.random() * 4 + 6; // Entre 6 y 10 segundos
        icon.style.animationDuration = duration + 's';
        
        // Retraso aleatorio
        const delay = Math.random() * 2;
        icon.style.animationDelay = delay + 's';
        
        // Opacidad aleatoria más visible
        const opacity = Math.random() * 0.25 + 0.15; // Entre 0.15 y 0.4
        icon.style.color = `rgba(139, 69, 19, ${opacity})`; // Color marrón que contrasta con bisque
        
        background.appendChild(icon);
        
        // Remover el elemento después de que termine la animación
        setTimeout(() => {
            if (icon.parentNode) {
                icon.parentNode.removeChild(icon);
            }
        }, (duration + delay) * 1000);
    }
    
    // Crear íconos continuamente
    function generateIcons() {
        createIcon();
        setTimeout(generateIcons, Math.random() * 500 + 200); // Entre 200ms y 700ms
    }
    
    // Iniciar la generación de íconos
    generateIcons();
    
    // Crear algunos íconos iniciales
    for (let i = 0; i < 10; i++) {
        setTimeout(createIcon, i * 300);
    }
}

// Inicializar el fondo animado cuando se carga la página
window.addEventListener('load', createAnimatedBackground);
