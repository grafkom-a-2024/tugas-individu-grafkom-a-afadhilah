function main() {
    const canvas = document.getElementById("glcanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gl = canvas.getContext("webgl");

    if (!gl) {
        console.error("WebGL not supported, falling back on experimental-webgl");
        gl = canvas.getContext("experimental-webgl");
    }
    if (!gl) {
        alert("Your browser does not support WebGL");
        return;
    }

    const vertexShaderSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
        varying lowp vec4 vColor;
        void main(void) {
            gl_Position = aVertexPosition;
            vColor = aVertexColor;
        }
    `;

    const fragmentShaderSource = `
        varying lowp vec4 vColor;
        void main(void) {
            gl_FragColor = vColor;
        }
    `;

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
        return;
    }

    gl.useProgram(shaderProgram);

    const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    const vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(vertexColorAttribute);

    const vertices = new Float32Array([
         0.0,  1.0,  0.0,  // Ujung atas segitiga berwarna (luar)
        -1.0, -1.0,  0.0,  // Ujung kiri bawah segitiga berwarna (luar)
         1.0, -1.0,  0.0,  // Ujung kanan bawah segitiga berwarna (luar)
         
         0.0, -1.0,  0.0,  // Ujung bawah segitiga hitam
         0.5,  0.0,  0.0,  // Ujung kanan atas segitiga hitam
        -0.5,  0.0,  0.0,  // Ujung kiri atas segitiga hitam

         0.0,  0.0,  0.0,  // Ujung atas segitiga berwarna (dalam)
        -0.25, -0.5,  0.0,  // Ujung kiri bawah segitiga berwarna (dalam)
         0.25, -0.5,  0.0,  // Ujung kanan bawah segitiga berwarna (dalam)
    ]);

    const colors = new Float32Array([
        1.0,  0.0,  0.0,  1.0,  // Merah (segitiga luar)
        0.0,  1.0,  0.0,  1.0,  // Hijau (segitiga luar)
        0.0,  0.0,  1.0,  1.0,  // Biru (segitiga luar)
        
        0.0,  0.0,  0.0,  1.0,  // Hitam (segitiga tengah)
        0.0,  0.0,  0.0,  1.0,  // Hitam (segitiga tengah)
        0.0,  0.0,  0.0,  1.0,  // Hitam (segitiga tengah)

        1.0,  1.0,  0.0,  1.0,  // Kuning (segitiga dalam)
        0.0,  1.0,  1.0,  1.0,  // Cyan (segitiga dalam)
        1.0,  0.0,  1.0,  1.0,  // Magenta (segitiga dalam)
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 3);  // Gambar segitiga berwarna luar
    gl.drawArrays(gl.TRIANGLES, 3, 3);  // Gambar segitiga hitam tengah
    gl.drawArrays(gl.TRIANGLES, 6, 3);  // Gambar segitiga berwarna dalam
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

window.onload = main;
window.onresize = () => {
    const canvas = document.getElementById("glcanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    main();
};
