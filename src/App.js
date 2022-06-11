import React, { useState, useRef } from "react";
import './App.css';
import defaultImage from './img/default.png'

function App() {
    const [file1, setFile1] = useState(defaultImage);
    const [file2, setFile2] = useState(defaultImage);
    const [file3, setFile3] = useState(defaultImage);

    const mask1 = useRef(null);
    const mask2 = useRef(null);
    const mask3 = useRef(null);

    function handleChange(e, canvasRef, setFile) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const reader = new FileReader();

      reader.onloadend = function() {
        const image = new Image();
        image.width= 400;
        image.height= 400;
        image.src = reader.result;
        image.onload = function() {
          context.drawImage(image, 0, 0);
          setFile(context.getImageData(0, 0, canvas.width, canvas.height))
        };
      }

      reader.readAsDataURL(e.target.files[0]);
    }

    function compareMasks() {
      const data1 = file1.data
      const data2 = file2.data

      const canvas = mask3.current;
      const context = canvas.getContext('2d');
      const image = new Image();
      image.src = defaultImage;

      image.onload = function() {
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (var i = 0; i < data1.length; i+= 4) {
          data[i] = data1[i] ^ data2[i]^ 255; // Invert Red
          data[i+1] = data1[i+1] ^ data2[i+1]^ 255; // Invert Green
          data[i+2] = data1[i+2] ^ data2[i+2]^ 255; // Invert Blue
        }
    
        context.putImageData(imageData, 0, 0);
      };
    }
  
    return (
        <div className="App">
          <div className="input-images">
            <div>
              <h2>Еталонна маска</h2>
              <input type="file" onChange={e => handleChange(e, mask1, setFile1)} />
              <canvas ref={mask1} width={400} height={400}></canvas>
            </div>
            <div>
              <h2>Результуюча маска</h2>
              <input type="file" onChange={e => handleChange(e, mask2, setFile2)} />
              <canvas ref={mask2} width={400} height={400}></canvas>
            </div>
          </div>
          <button className="compare" onClick={compareMasks}>
            Порівняти
          </button>
          <div>
            <h2>Результат порівняння</h2>
            <canvas ref={mask3} width={400} height={400}></canvas>
          </div>
        </div>
  
    );
}
  
export default App;