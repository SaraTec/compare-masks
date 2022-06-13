import React, { useState, useRef } from "react";
import './App.css';
import defaultImage from './img/default.png'

function App() {
    const [file1, setFile1] = useState(defaultImage);
    const [file2, setFile2] = useState(defaultImage);

    const mask1 = useRef(null);
    const mask2 = useRef(null);
    const mask3 = useRef(null);
    const mask4 = useRef(null);

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
          data[i] = data1[i] ^ data2[i] ^ 255;
          data[i+1] = data1[i+1] ^ data2[i+1] ^ 255;
          data[i+2] = data1[i+2] ^ data2[i+2] ^ 255;
        }

        context.putImageData(imageData, 0, 0);
      };
    }
  
    function createEdges() {
      const canvas = mask4.current;
      const context = canvas.getContext('2d');
      const imageData = mask3.current.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      const edge = createEdgeMapFromImageData(imageData);
      for (const i in edge) {
        let x = i % canvas.width;
        let y = (i - x) / canvas.width;
        context.fillStyle = `rgba(${edge[i] ^ 255},${edge[i] ^ 255},${edge[i] ^ 255},255)`;
        context.fillRect(x, y, 1, 1 );
      }
    }

    function createEdgeMapFromImageData(imageData) {
      const sobel_v =
      [
        -1.0, 0.0, +1.0,
        -2.0, 0.0, +2.0,
        -1.0, 0.0, +1.0
      ];

      const sobel_h =
      [
        -1.0, -2.0, -1.0,
        0.0,  0.0,  0.0,
        +1.0, +2.0, +1.0
      ];

      let pixels = new Uint8ClampedArray(imageData.data.length * 0.25);
      let width = imageData.width;
      let data = imageData.data;
    
      // create greyscale first
      {
        let i = imageData.data.length;
        while (i) {
          let b = data[i-2];
          let g = data[i-3];
          let r = data[i-4];
          pixels[i*0.25] = 0.3*r + 0.59*g + 0.11*b;
          i -= 4;
        }
      }
    
      // now edge detect
      for (let i = 0; i < pixels.length; i++) {
        let hSum = 0;
        let vSum = 0;
        for (let y = 0; y < 3; y++)
          for (let x = 0; x < 3; x++) {
            let pixel = pixels[i + (width * y) + x];
            let kernelAccessor = (x) * 3 + (y);
            hSum += pixel * sobel_h[kernelAccessor];
            vSum += pixel * sobel_v[kernelAccessor];
          }

        pixels[i] = Math.sqrt(hSum * hSum + vSum * vSum);
      };
    
      return pixels;
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
          <button className="action" onClick={compareMasks}>
            Порівняти
          </button>
          <div>
            <h2>Результат порівняння</h2>
            <canvas ref={mask3} width={400} height={400} className="result-one"></canvas>
          </div>
          <button className="action" onClick={createEdges}>
            Визначити краї
          </button>
          <div>
            <h2>Результат визначення країв</h2>
            <canvas ref={mask4} width={400} height={400} className="result-two"></canvas>
          </div>
        </div>
  
    );
}
  
export default App;