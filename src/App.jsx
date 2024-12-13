import React, { useState, useEffect } from "react";
import './App.css';

const ClassCapCounter = () => {
  const [image, setImage] = useState(null);
  const [facesCount, setFacesCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [outputImage, setOutputImage] = useState(null);

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const detectFaces = () => {
    if (!image || !window.cv) {
      console.error("OpenCV.js not loaded or image not uploaded");
      return;
    }

    setLoading(true);

    const imgElement = document.createElement("img");
    imgElement.src = image;

    imgElement.onload = () => {
      const src = cv.imread(imgElement);
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

      const faceCascade = new cv.CascadeClassifier();
      const faceCascadeFile = "haarcascade_frontalface_default.xml";

      fetch(faceCascadeFile)
        .then((res) => res.arrayBuffer())
        .then((buffer) => {
          const data = new Uint8Array(buffer);
          cv.FS_createDataFile("/", faceCascadeFile, data, true, false);
          faceCascade.load(faceCascadeFile);

          const faces = new cv.RectVector();
          const msize = new cv.Size(0, 0);
          faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);

          setFacesCount(faces.size());

          for (let i = 0; i < faces.size(); i++) {
            const face = faces.get(i);
            const point1 = new cv.Point(face.x, face.y);
            const point2 = new cv.Point(face.x + face.width, face.y + face.height);
            cv.rectangle(src, point1, point2, [255, 0, 0, 255], 2);
          }

          cv.imshow("outputCanvas", src);
          setOutputImage(document.getElementById("outputCanvas").toDataURL());

          src.delete();
          gray.delete();
          faceCascade.delete();
          faces.delete();
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error loading Haar Cascade file:", err);
          setLoading(false);
        });
    };
  };

  return (
    <>
      <nav className="navbar">
        <h1 className="navbar-title">ClassCapCounter</h1>
      </nav>

      <div className="container centered">
        <h2 className="tagline">"Detect Faces with Precision and Speed!"</h2>

        <div className="upload-section">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>

        <div className="image-display">
          {image && (
            <div className="image-wrapper">
              <h3>Uploaded Image</h3>
              <img src={image} alt="Uploaded" className="image" />
            </div>
          )}

          {outputImage && (
            <div className="image-wrapper">
              <h3>Output Image</h3>
              <img src={outputImage} alt="Output" className="image" />
            </div>
          )}
        </div>

        <button onClick={detectFaces} disabled={!image || loading}>
          {loading ? "Detecting..." : "Detect Faces"}
        </button>

        {facesCount !== null && (
          <p className="results-text">{facesCount} face(s) detected in the image.</p>
        )}

        <canvas id="outputCanvas" style={{ display: "none" }}></canvas>
      </div>
    </>
  );
};

export default ClassCapCounter;
