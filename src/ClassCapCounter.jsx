import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';

const Home = () => {
  const [image, setImage] = useState(null);
  const [facesCount, setFacesCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [outputImage, setOutputImage] = useState(null);
  const [buttonClicked, setButtonClicked] = useState(false); // Track button click
  const [cardWidth, setCardWidth] = useState("500px"); // Track card width

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
      reader.onload = () => {
        setImage(reader.result);
        setButtonClicked(true); // Set buttonClicked to true when an image is uploaded
        setCardWidth("600px"); // Increase card width when image is uploaded
      };
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
    <div className="container centered" style={{ width: cardWidth }}>
      {!buttonClicked && (
        <h2
          className="tagline"
          style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            color: "#ffcc00",
            textAlign: "center",
          }}
        >
          Effortlessly count the class attendance in seconds!
        </h2>
      )}

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

      <button
        onClick={detectFaces}
        disabled={!image || loading}
        style={{ marginTop: buttonClicked ? "20px" : "30px" }} // Adjust top margin when button is clicked
      >
        {loading ? "Detecting..." : "Detect Faces"}
      </button>

      {facesCount !== null && !loading && (
        <p className="results-text"><strong> Results: {facesCount} student(s) in the class today</strong></p>
      )}

      <canvas id="outputCanvas" style={{ display: "none" }}></canvas>
    </div>
  );
};

const About = () => {
  return (
    <div className="container centered">
      <h2 style={{ color: "#4B0082", textAlign: "center" }}>About</h2>
      <p style={{ textAlign: "center", fontSize: "1.2rem", lineHeight: "1.6", color: "#333" }}>
        We observed that our professor was spending a lot of time and effort manually counting the number of students in class, which was a tedious and time-consuming task. Realizing this, we decided to build a solution to make the process more efficient.
        <br /><br />
        Using advanced face detection technology with OpenCV.js and React, we developed this tool to automatically detect and count the number of students in the classroom with just a few clicks. The goal is to save both time and effort for professors, allowing them to focus more on teaching rather than administrative tasks.
        <br /><br />
        We hope this tool helps make classroom management simpler and more efficient for professors, while improving the overall learning experience.
      </p>
    </div>
  );
};

const Contact = () => {
  return (
    <div className="container centered">
      <h2 style={{ color: "#4B0082", textAlign: "center" }}>Contact</h2>
      <p style={{ textAlign: "center", fontSize: "1.2rem", lineHeight: "1.6", color: "#333" }}>
        Contributors behind this project are:
        <br />
        <strong>Contributor 1: Sonali Biswas</strong>
        <br />
        <strong>Contributor 2: Rishi Patel</strong>
        <br />
        <strong>Contributor 3: Darshil Shukla</strong>
      </p>
    </div>
  );
};

const ClassCapCounter = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Router>
      <nav className="navbar" style={{ backgroundColor: "#5C2D91" }}>
        <div className="navbar-content">
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>☰</div>
          <h1 className="navbar-title" style={{ color: "#ffffff", fontSize: "1.5rem", marginLeft: "10px" }}>ClassCapCounter</h1>
        </div>
      </nav>

      {menuOpen && (
        <div className="side-menu" style={{ position: "fixed", top: "60px", left: "0", width: "250px", height: "100%", backgroundColor: "#7C4EB1", color: "white", boxShadow: "2px 0 10px rgba(0, 0, 0, 0.5)", padding: "20px", zIndex: 1000 }}>
          <ul style={{ listStyle: "none", padding: 0, fontFamily: 'Arial, sans-serif', fontSize: '1.2rem', fontWeight: 'bold' }}>
            <li style={{ padding: "15px 0", borderBottom: "1px solid #aaa", color: "#FFD700", margin: "10px 0", textAlign: "center", boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.3)", cursor: "pointer", background: "#5C2D91" }}>
              <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            </li>
            <li style={{ padding: "15px 0", borderBottom: "1px solid #aaa", color: "#FFD700", margin: "10px 0", textAlign: "center", boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.3)", cursor: "pointer", background: "#5C2D91" }}>
              <Link to="/about" style={{ color: "inherit", textDecoration: "none" }}>About</Link>
            </li>
            <li style={{ padding: "15px 0", borderBottom: "1px solid #aaa", color: "#FFD700", margin: "10px 0", textAlign: "center", boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.3)", cursor: "pointer", background: "#5C2D91" }}>
              <Link to="/contact" style={{ color: "inherit", textDecoration: "none" }}>Contact</Link>
            </li>
          </ul>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
};

export default ClassCapCounter;