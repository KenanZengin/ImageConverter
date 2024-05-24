"use client";
import { useState } from 'react';
import Resizer from 'react-image-file-resizer';

const IndexPage = () => {

  const [resolution, setResolution] = useState({ width: 0, height: 0 });
  const [imgInfo,setImgInfo] = useState({width:0,height:0});
  const [format, setFormat] = useState('jpg');
  const [compression, setCompression] = useState(100);
  const [aspectRatio, setAspectRatio] = useState('No Change');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState(null);
  const [outputName, setOutputName] = useState('');
  const [showImages, setShowImages] = useState(false);
  const [fileSize, setFileSize] = useState(null); 
  const [originalImageURL, setOriginalImageURL] = useState<any>(null);
  const [processedSize, setProcessedSize] = useState<any>(null);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    console.log(URL.createObjectURL(uploadedFile));

    const sizeInMB = (uploadedFile.size / 1024 / 1024).toFixed(2);

    setFile(uploadedFile);
    setFileSize(sizeInMB);
    setOriginalImageURL(URL.createObjectURL(uploadedFile));
    const img = new Image();
    img.onload = () => {
        console.log("img.width",img.width);
        
      setImgInfo(()=>({width:img.width,height:img.height}))

    };
    img.src = URL.createObjectURL(uploadedFile)

  };

  const cropImage = () => {
    if (!file) return;
    
    const img = new Image();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if(aspectRatio == "No Change"){
        img.onload = () => {
            
            const aspectRatio = imgInfo.height / imgInfo.width;
            const newWidth = Math.round(resolution.height / aspectRatio);
            canvas.height = resolution.height;
            canvas.width =  newWidth;
            console.log("ccanvas.height",newWidth);
            
            ctx.drawImage(img, 0, 0, newWidth, canvas.height, );

            canvas.toBlob((blob) => {
                if(blob){
                    setProcessedSize((blob.size / 1024 / 1024).toFixed(2));
                    processImage(blob);
                }
            }
            , 'image/jpeg', compression / 100);
        }
        img.src = URL.createObjectURL(file);
        return
    }
    img.onload = () => {
      let aspectRatioValue = aspectRatio;
      console.log("aspectRatio",aspectRatio);
      if (aspectRatio === 'No Change') {
        aspectRatioValue = `${img.width}:${img.height}`;
      }
      const [aspectWidth, aspectHeight] = aspectRatioValue.split(':').map(Number);
      const cropAspectRatio = aspectWidth / aspectHeight;
      console.log("cropAspectRatio",cropAspectRatio);
      

      const cropWidth = Math.min(img.width, img.height * cropAspectRatio);
      const cropHeight = Math.min(img.height, img.width / cropAspectRatio);
      console.log("cropWidth",cropWidth);
      console.log("cropHeight",cropHeight);

      const cropX = (img.width - cropWidth) / 2;
      const cropY = (img.height - cropHeight) / 2;
      console.log("cropX",cropX);
      console.log("cropY",cropY);


      let targetWidth = resolution.width;
      let targetHeight = resolution.height;
      const [ratioWidth, ratioHeight] = aspectRatio.split(':').map(Number);
      targetWidth = Math.round((targetHeight / ratioHeight) * ratioWidth);
      targetHeight = Math.round((targetWidth / ratioWidth) * ratioHeight);

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      console.log("canvas.width",canvas.width);
      console.log("canvas.height",canvas.height);
      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if(blob){
            setProcessedSize((blob.size / 1024 / 1024).toFixed(2));
            processImage(blob);
        }
      }, 'image/jpeg', compression / 100);
    };
    img.src = URL.createObjectURL(file);
  };

  const processImage = (blob) => {
    if (!file) return;

    let targetWidth = parseInt(customWidth) || resolution.width;
    let targetHeight = parseInt(customHeight) || resolution.height;

    if (aspectRatio === 'No Change') {
      targetWidth = resolution.width;
      targetHeight = resolution.height;
    } else {
      const [ratioWidth, ratioHeight] = aspectRatio.split(':').map(Number);
      targetHeight = Math.round((targetWidth / ratioWidth) * ratioHeight);
      targetWidth = Math.round((targetHeight / ratioHeight) * ratioWidth);
      console.log("targetHeight",targetHeight);
      console.log("targetWidth",targetWidth);
    }
    console.log("targetWidth",targetWidth);
    console.log("targetHeight",targetHeight);

    Resizer.imageFileResizer(
      blob,
      targetWidth,
      targetHeight,
      format.toUpperCase(),
      compression,
      0,
      (uri) => {
        setOutput(uri);
        setOutputName(file.name.replace(/\.[^/.]+$/, "") + `_processed.${format}`);
        setShowImages(true);
        const base64Length = uri.length;
        const sizeInBytes = base64Length * (3 / 4);
        const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);
        console.log(`Processed Image Size: ${sizeInMB} MB`);
      },
      'base64'
    );
  };

  const handleDownload = () => {
    if (output && outputName) {
      const link = document.createElement('a');
      link.href = output;
      link.download = outputName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const handleCustomWidthChange = (event) => {

    const widthValue = event.target.value;
    setCustomWidth(widthValue);
    
    const aspectRatio = imgInfo.width / imgInfo.height;
    
    const newHeight = Math.round(widthValue / aspectRatio);

    setCustomHeight(newHeight.toString());
    setResolution({ width: widthValue, height: newHeight })

  };
  
  const handleCustomHeightChange = (event) => {
    const heightValue = event.target.value;
    setCustomHeight(heightValue);
    const aspectRatio = imgInfo.height / imgInfo.width;
    const newWidth = Math.round(heightValue / aspectRatio);
    setCustomWidth(newWidth.toString());
    setResolution({ width: newWidth, height: heightValue })
  }
  return (
    <div>
      <h1>Image Processor</h1>

      <div style={{ backgroundColor: `${file ? "green" : ""}` }}>
        <input type="file" onChange={handleFileChange} />
      </div>

      {file && (
        <div>
          <h2>Resolution</h2>
          <button onClick={() => setResolution({ width: 1280, height: 720 })}>720p</button>
          <button onClick={() => setResolution({ width: 1920, height: 1080 })}>1080p</button>
          <button onClick={() => setResolution({ width: 2560, height: 1440 })}>2k</button>
          <button onClick={() => setResolution({ width: 3840, height: 2160 })}>4k</button>
          <button onClick={() => setResolution({ width: 1000, height: 1000 })}>1k</button>

          <div>
            <input
              type="number"
              placeholder="Custom Width"
              value={customWidth}
              onChange={handleCustomWidthChange}
            />
            <input
              type="number"
              placeholder="Custom Height"
              value={customHeight}
              onChange={handleCustomHeightChange}
            />
          </div>

          <h2>File Type</h2>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
          </select>

          <h2>Compression</h2>
          <input
            type="range"
            min="0"
            max="100"
            value={compression}
            onChange={(e) => setCompression(Number(e.target.value))}
          />

          <h2>Aspect Ratio</h2>
          <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
            <option value="No Change">No Change</option>
            <option value="4:3">4:3</option>
            <option value="16:9">16:9</option>
          </select>

          <button onClick={cropImage} style={{ marginTop: '20px' }}>Process Image</button>
        </div>
      )}

      {showImages && (
        <div style={{ marginTop: '20px' }}>
          {file && (
            <>
              <h2>Original Image</h2>
              <img src={originalImageURL} alt="Original" style={{ marginRight: '20px' }} />
            </>
          )}
          {output && (
            <>
              <h2>Processed Image</h2>
              <img src={output} alt="Processed" /><br />
              <button onClick={handleDownload} style={{ marginTop: '10px' }}>Download Processed Image</button>
            </>
          )}
        </div>
      )}
      <h1>old size {fileSize} <br />{imgInfo.width}x{imgInfo.height}</h1>
      <h1>new size {processedSize} <br />{Math.round(resolution.height / (imgInfo.height / imgInfo.width))}x{resolution.height}</h1>
    </div>
  );
};

export default IndexPage;
