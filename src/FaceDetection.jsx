import React, { useState, useEffect } from "react";

const FaceDetection = () => {
  const [image, setImage] = useState(null); // Stores the uploaded image
  const [facesCount, setFacesCount] = useState(null); // Stores the number of faces detected
  const [loading, setLoading] = useState(false); // Indicates if the face detection is in progress
  const [outputImage, setOutputImage] = useState(null); // Stores the output image with faces boxed

  // Load OpenCV.js on component mount
  useEffect(() => {
    const loadOpenCV = () => {
      if (!window.cv) {
        const script = document.createElement("script");
        script.src = "https://docs.opencv.org/4.x/opencv.js";
        script.async = true;
        script.onload = () => console.log("OpenCV.js loaded successfully.");
        document.body.appendChild(script);
      }
    };

    loadOpenCV();
  }, []);

  // Handle image upload from the file input
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result); // Set image state as base64 string
      reader.readAsDataURL(file);
    }
  };

  // Detect faces in the uploaded image
  const detectFaces = () => {
    if (!image || !window.cv) {
      console.error("OpenCV.js not loaded or image not uploaded");
      return;
    }

    setLoading(true); // Set loading state to true

    const imgElement = document.createElement("img");
    imgElement.src = image; // Set the uploaded image source

    imgElement.onload = () => {
      const src = cv.imread(imgElement); // Convert image to OpenCV Mat format
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0); // Convert to grayscale

      const faceCascade = new cv.CascadeClassifier();
      const faceCascadeFile = "haarcascade_frontalface_default.xml"; // Path to Haar Cascade XML file

      // Load Haar Cascade file from the public folder
      fetch(faceCascadeFile)
        .then((res) => res.arrayBuffer())
        .then((buffer) => {
          const data = new Uint8Array(buffer);
          cv.FS_createDataFile("/", faceCascadeFile, data, true, false); // Load file into OpenCV's virtual filesystem
          faceCascade.load(faceCascadeFile); // Load Haar Cascade classifier

          const faces = new cv.RectVector();
          const msize = new cv.Size(0, 0);

          // Detect faces in the image using the Haar Cascade
          faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);

          setFacesCount(faces.size()); // Set the count of detected faces

          // Draw rectangles around detected faces
          for (let i = 0; i < faces.size(); i++) {
            const face = faces.get(i);
            const point1 = new cv.Point(face.x, face.y);
            const point2 = new cv.Point(face.x + face.width, face.y + face.height);
            cv.rectangle(src, point1, point2, [255, 0, 0, 255], 2); // Draw rectangle in red color
          }

          // Convert the output image back to base64 to display it
          cv.imshow("outputCanvas", src); // Render the image on canvas element
          setOutputImage(document.getElementById("outputCanvas").toDataURL()); // Get the output image as base64

          // Cleanup
          src.delete();
          gray.delete();
          faceCascade.delete();
          faces.delete();
          setLoading(false); // Set loading to false after detection
        })
        .catch((err) => {
          console.error("Error loading Haar Cascade file:", err);
          setLoading(false);
        });
    };
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Face Detection App</h1>

      {/* Image upload input */}
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && (
        <div>
          <img
            src={image}
            alt="Uploaded"
            style={{ maxWidth: "300px", marginTop: "10px" }}
          />
        </div>
      )}

      {/* Button to trigger face detection */}
      <button onClick={detectFaces} disabled={!image || loading}>
        {loading ? "Detecting..." : "Detect Faces"}
      </button>

      {/* Display face detection results */}
      {facesCount !== null && (
        <p>{facesCount} face(s) detected in the image.</p>
      )}

      {/* Display the image with boxes around faces */}
      {outputImage && (
        <div>
          <h3>Output Image with Faces Boxed:</h3>
          <img src={outputImage} alt="Faces Boxed" style={{ maxWidth: "300px", marginTop: "10px" }} />
        </div>
      )}

      {/* Canvas element to render the image with boxes */}
      <canvas id="outputCanvas" style={{ display: "none" }}></canvas>
    </div>
  );
};

export default FaceDetection;
