// === NUEVO script.js - SIN OAUTH - FUNCIONA ===

// 🔥 PEGA AQUÍ LA URL QUE TE DIO GOOGLE APPS SCRIPT
const UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbxrOerQ0ZokJ_pjS6seCpOmCgTuLJtxPOfn61fhZ5FRAqjBSc_Zn7V6opN3GDuZqEg4/exec';

// Elementos del DOM
const loginBtn = document.getElementById('loginBtn');
const cameraSection = document.getElementById('cameraSection');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhotoBtn');
const canvas = document.getElementById('canvas');
const photoPreview = document.getElementById('photoPreview');
const uploadBtn = document.getElementById('uploadBtn');

let stream = null;
let photoDataUrl = null;

// Datos del paciente
let patientData = {};

// Cuando haces clic en "Iniciar sesión con Google"
loginBtn.onclick = () => {
  const nombre = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const dni = document.getElementById('dni').value.trim();

  if (!nombre || !apellido || !dni) {
    alert('Por favor, completa todos los datos del paciente.');
    return;
  }

  patientData = { nombre, apellido, dni };
  showCamera();
};

// Mostrar la cámara
function showCamera() {
  loginBtn.style.display = 'none';
  cameraSection.style.display = 'block';

  navigator.mediaDevices.getUserMedia({ video: true })
    .then((mediaStream) => {
      stream = mediaStream;
      video.srcObject = stream;
    })
    .catch(err => {
      alert('Error al acceder a la cámara: ' + err.message);
    });
}

// Tomar foto
takePhotoBtn.onclick = () => {
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  stream.getTracks().forEach(track => track.stop());

  photoDataUrl = canvas.toDataURL('image/jpeg');
  photoPreview.innerHTML = `<img src="${photoDataUrl}" alt="Foto del paciente" style="max-width: 100%;">`;
  takePhotoBtn.style.display = 'none';
  uploadBtn.style.display = 'block';
};

// Subir foto al servidor (Google Apps Script)
uploadBtn.onclick = async () => {
  const { nombre, apellido, dni } = patientData;
  const fileName = `DNI_${dni}_${apellido}_${nombre}.jpg`;

  try {
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: JSON.stringify({
        image: photoDataUrl,
        type: 'image/jpeg',
        filename: fileName
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const text = await response.text(); // Google Apps Script devuelve texto
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      throw new Error('Respuesta no JSON: ' + text);
    }

    if (result.status === 'success') {
      alert(`✅ Foto subida correctamente:\n${fileName}`);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    alert('❌ Error al subir: ' + error.message);
  }
};