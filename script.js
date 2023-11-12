const video = document.getElementById("video");

    Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    ]).then(startWebcam);

    function startWebcam() {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: false,
        })
        .then((stream) => {
          video.srcObject = stream;
        })
        .catch((error) => {
          console.error(error);
        });
    }

async function getLabeledFaceDescriptions() {
  try {
    const response = await fetch('https://facerecognitionapp.azurewebsites.net/getLabelsAndDescriptors');
    const data = await response.json();

    const labeledFaceDescriptors = data.map(item => {
      const label = item.label;
      const descriptors = item.descriptors.map(d => {
        const values = Object.values(d).map(val => parseFloat(val)); // Convert to Float32Array
        return new Float32Array(values);
      });
      return new faceapi.LabeledFaceDescriptors(label, descriptors);
    });

    return labeledFaceDescriptors;
  } catch (error) {
    console.error('Error fetching labels and descriptors:', error);
    return [];
  }
}

function sendFaceDescriptorsToServer(labeledFaceDescriptors) {
  $.ajax({
    type: "POST",
    url: "https://facerecognitionapp.azurewebsites.net/saveFaceDescriptors",
    contentType: "application/json",
    data: JSON.stringify({ descriptors: labeledFaceDescriptors }),
    success: function (response) {
      console.log(response);
    },
    error: function (error) {
      console.error(error);
    },
  });
}








