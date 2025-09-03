const UPLOAD_URL = "https://script.google.com/macros/s/AKfycbxrOerQ0ZokJ_pjS6seCpOmCgTuLJtxPOfn61fhZ5FRAqjBSc_Zn7V6opN3GDuZqEg4/exec";

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const photoPreview = document.getElementById("photoPreview");
const result = document.getElementById("result");

// Datos del paciente
let patientData = {
  nombre: "NombrePaciente",
  apellido: "ApellidoPaciente",
  dni: "12345678"
};

let photos = []; // array para fotos seleccionadas

fileInput.addEventListener("change", () => {
  photoPreview.innerHTML = "";
  photos = [];

  const files = Array.from(fileInput.files).slice(0, 10); // máximo 10 fotos
  files.forEach((file, index) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    photoPreview.appendChild(img);

    // Generar nombre único
    const filename = `DNI_${patientData.dni}_${patientData.apellido}_${patientData.nombre}_${index+1}.jpg`;

    photos.push({
      file,
      filename
    });
  });

  if (fileInput.files.length > 10) {
    alert("Solo se subirán las primeras 10 fotos.");
  }
});

uploadBtn.addEventListener("click", async () => {
  if (!photos.length) return alert("Selecciona al menos una foto");

  result.innerHTML = "";
  for (let i = 0; i < photos.length; i++) {
    const { file, filename } = photos[i];
    const reader = new FileReader();

    await new Promise((resolve) => {
      reader.onload = async (e) => {
        try {
          const response = await fetch(UPLOAD_URL, {
            method: "POST",
            body: JSON.stringify({
              image: e.target.result,
              type: file.type,
              filename: filename
            }),
            headers: { "Content-Type": "application/json" }
          });

          const data = await response.json();
          if (data.success) {
            result.innerHTML += `✅ ${filename} subida: <a href="${data.file}" target="_blank">Ver archivo</a><br>`;
          } else {
            result.innerHTML += `❌ ${filename} error: ${data.error}<br>`;
          }
        } catch (err) {
          result.innerHTML += `❌ ${filename} error: ${err.message}<br>`;
        } finally {
          resolve();
        }
      };
      reader.readAsDataURL(file);
    });
  }
});







