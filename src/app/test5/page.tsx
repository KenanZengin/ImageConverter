"use client";
import { useState } from 'react';
import Resizer from 'react-image-file-resizer';
import { FaUpload } from "react-icons/fa";

const IndexPage = () => {

  const [resolution, setResolution] = useState({ width: 0, height: 0 });
  const [imgInfo,setImgInfo] = useState({width:0,height:0});
  const [newImage,setNewImage] = useState({width:0,height:0});
  const [format, setFormat] = useState('jpg');
  const [compression, setCompression] = useState(100);
  const [aspectRatio, setAspectRatio] = useState('No Change');
  const [dimensions, setDimensions] = useState({ w: '', h: '' });
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState(null);
  const [outputName, setOutputName] = useState('');
  const [showImages, setShowImages] = useState(false);
  const [fileSize, setFileSize] = useState(false); 
  const [originalImageURL, setOriginalImageURL] = useState<any>(null);
  const [processedSize, setProcessedSize] = useState<any>(null);

  const handleFileChange = (event) => {

    const uploadedFile = event.target.files[0];
    const sizeInMB = (uploadedFile.size / 1024 / 1024).toFixed(2);
    setFile(uploadedFile);
    setFileSize(()=>sizeInMB);
    setOriginalImageURL(URL.createObjectURL(uploadedFile));
    const img = new Image();
    img.onload = () => {
      setImgInfo(()=>({width:img.width,height:img.height}))
    };
    img.src = URL.createObjectURL(uploadedFile)

  };

  const cropImage = () => {

    let aspectRatioValue = dimensions.h ? `${dimensions.w}:${dimensions.h}` : aspectRatio;
    

    if (!file) return;
    
    const img = new Image();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if(aspectRatioValue == "No Change"){
        img.onload = () => {
            
            const aspectRatio = imgInfo.height / imgInfo.width;
            const newWidth = Math.round(resolution.height / aspectRatio);
            canvas.height = resolution.height;
            canvas.width =  newWidth;
            console.log("canvas.height",canvas.height);
            console.log(" canvas.width", canvas.width);

            
            ctx.drawImage(img, 0, 0, newWidth, canvas.height, );

            canvas.toBlob((blob) => {
                if(blob){
                   
                    processImage(blob,canvas.width,canvas.height);
                }
            }
            , 'image/jpeg', compression / 100);
        }
        img.src = URL.createObjectURL(file);
        return
    }
    img.onload = () => {
        // Aspect ratio value and crop calculations
        const [aspectWidth, aspectHeight] = aspectRatioValue.split(':').map(Number);
        const cropAspectRatio = aspectWidth / aspectHeight;
        
      
        // Calculate crop width and height based on aspect ratio
        let cropWidth, cropHeight;
        if (img.width / img.height > cropAspectRatio) {
          cropWidth = img.height * cropAspectRatio;
          cropHeight = img.height;
        } else {
          cropWidth = img.width;
          cropHeight = img.width / cropAspectRatio;
        }
      
        const cropX = (img.width - cropWidth) / 2;
        const cropY = (img.height - cropHeight) / 2;
        console.log(cropX,cropY);
        

        // Set canvas dimensions to the resolution or custom dimensions if provided
        let targetWidth = parseInt(customWidth) || resolution.width;
        let targetHeight = parseInt(customHeight) || resolution.height;


        const kanvasy =  targetHeight;
        const kanvasx1 = (targetWidth * aspectHeight) / aspectWidth;
        const kanvasx2 = (targetWidth * targetHeight) / kanvasx1;
        console.log(cropWidth,cropHeight);

        // Adjust target dimensions to maintain aspect ratio
        targetHeight = Math.round((targetWidth / aspectWidth) * aspectHeight);
        targetWidth = Math.round((targetHeight / aspectHeight) * aspectWidth);
        console.log(targetHeight,targetWidth);
        
        // Set canvas size
        canvas.width = kanvasx2;
        canvas.height = kanvasy;

        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, kanvasx2, kanvasy);
      
        // Convert the canvas to a blob and process the image
        canvas.toBlob((blob) => {
          if (blob) {
           
            processImage(blob,kanvasx2,kanvasy);
          }
        }, 'image/jpeg', compression / 100);
    };
      
      img.src = URL.createObjectURL(file);
  };

  const processImage = (blob,w,h) => {

    setNewImage(()=>({width:w,height:h}))

    if (!file) return;
    Resizer.imageFileResizer(
      blob,
      w,
      h,
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
        
        setProcessedSize(sizeInMB);
      },
      'base64'
    );
    setDimensions(()=>({ w: '', h: '' }))
    setAspectRatio(()=>('No Change'))
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

  const handleInputChange = (event:any) => {
    const { name, value } = event.target;
    setDimensions(()=>({...dimensions,[name]: value}));
  };

  return (
    <div className="img_customization">
        <div className="img_customization_wrapper">

            <h1>Image Processor</h1>

            <div className="img_area">
                <div className="img_convert_options">
                    
                    <div className='upload_file' >
                        <label htmlFor="file" className={`${fileSize ? "upload" : "no_upload"}`}>
                            <input type="file" name="file" id="file" onChange={handleFileChange} className='inputfile' />
                            <FaUpload size={25} />
                            Choose a file
                        </label>
                    </div>
                    <div className="resulation">
                        <p>Resolution</p>
                        <span onClick={() => setResolution({ width: 1280, height: 720 })}>720p</span>
                        <span onClick={() => setResolution({ width: 1920, height: 1080 })}>1080p</span>
                        <span onClick={() => setResolution({ width: 2560, height: 1440 })}>2k</span>
                        <span onClick={() => setResolution({ width: 3840, height: 2160 })}>4k</span>
                        <div className='custom_width'>
                            <input
                                type="number"
                                min={0}
                                placeholder="Custom Width"
                                value={customWidth}
                                onChange={handleCustomWidthChange}

                            />
                            <input
                                min={0}
                                type="number"
                                placeholder="Custom Height"
                                value={customHeight}
                                onChange={handleCustomHeightChange}
                            />
                        </div>
                    </div>

                    <div className="file_type">
                        <p>File Type</p>
                        {/* <select value={format} onChange={(e) => setFormat(e.target.value)}>
                        <option value="jpg">JPG</option>
                        <option value="png">PNG</option>
                        </select> */}
                        <span onClick={() =>(setFormat(()=>"jpg"))}>JPG</span>
                        <span onClick={() =>(setFormat(()=>"png"))}>PNG</span>

                    </div>          

                    <div className="compression">
                        <p>Compression</p>
                        <label htmlFor="compression" className='custom_compression'>
                            <input
                                name='compression'
                                type="range"
                                min="0"
                                max="100"
                                value={compression}
                                onChange={(e) => setCompression(Number(e.target.value))}
                            />
                            {compression}
                        </label>
                    </div>

                    <div className="aspect_ratio">
                        <p>Aspect Ratio</p>
                        
                        <span onClick={() => setAspectRatio(()=>"No Change")}>No Change</span> 
                        <span onClick={() => setAspectRatio(()=>"4:3")}>4:3</span>
                        <span onClick={() => setAspectRatio(()=>"16:9")}>16:9</span>
                        <div className="custom_ratio">
                            <input
                                min={0}
                                type="number"
                                name="w"
                                placeholder="Custom Width"
                                value={dimensions.w}
                                onChange={handleInputChange}
                            />
                            <input
                                min={0}
                                type="number"
                                name="h"
                                placeholder="Custom Height"
                                value={dimensions.h}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <button onClick={cropImage}>Process Image</button>
                    
                </div>
                <div className="imgs">
                {showImages && (
                    <div className='imgs_area'>
                    {file && (
                        <div className='img_content'>
                            <h2>Original Image</h2>
                            <div className="content_info">
                                <img src={originalImageURL} alt="Original"  />
                                <div className="info">
                                    <p>File size: {fileSize}</p>
                                    <p>Image size: {imgInfo.width}x{imgInfo.height}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {output && (
                        <div className='img_content'>
                            <h2>Processed Image</h2>
                            <div className="content_info">
                                <img src={output} alt="Original"  />
                                <div className="info">
                                    <p>File size: {processedSize}</p>
                                    <p>File type: {format}</p>
                                    <p>Image size: {newImage.width}x{newImage.height}</p>
                                    <button onClick={handleDownload}>Download Processed Image</button>

                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                )}
                </div>
            </div>
    
        
        {/* <h1>old size {fileSize} <br />{imgInfo.width}x{imgInfo.height}</h1>
        <h1>new size {processedSize} <br />{newImage.width}x{newImage.height}</h1> */}
      </div>
    </div>
  );
};

export default IndexPage;
