"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Resizer from 'react-image-file-resizer';
import { FaUpload,FaDownload  } from "react-icons/fa";



interface ImgValue {
  width: number;
  height: number;
}


const IndexPage = () => {

  const params = useSearchParams();
  
  const [resolution, setResolution] = useState<ImgValue>({width: 1280, height: 720});
  const [imgInfo,setImgInfo] = useState<ImgValue>({width:0,height:0});
  const [newImage,setNewImage] = useState<ImgValue>({width:0,height:0});
  const [format, setFormat] = useState<string>("jpg");
  const [newFormat,setNewFormat] = useState<string>("")
  const [compression, setCompression] = useState<number>(100);
  const [aspectRatio, setAspectRatio] = useState<string>("No Change");
  const [dimensions, setDimensions] = useState<ImgValue>({ width: 0, height:0 });
  const [customWidth, setCustomWidth] = useState<string>("");
  const [customHeight, setCustomHeight] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string | null | Blob>(null);
  const [outputName, setOutputName] = useState<string>("");
  const [showImages, setShowImages] = useState<boolean>(false);
  const [fileSize, setFileSize] = useState<number | null>(null); 
  const [originalImageURL, setOriginalImageURL] = useState<string | null>(null);
  const [processedSize, setProcessedSize] = useState<number | null>(null);


  useEffect(()=>{
    if(params.get("photoid")){

      const imgUrl = `/img/img${params.get("photoid")}.jpg`;

      const test = async () => {

        const response = await fetch(imgUrl);
        const blob = await response.blob();
        
        if(blob.type == "image/jpeg"){
          const file = new File([blob], "img1.jpg", { type: "image/jpeg" });
          
          setFile(()=>file);
  
          const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
          setFileSize(()=>Number(sizeInMB));
          setOriginalImageURL(() => URL.createObjectURL(file));
          const img = new Image();
          img.onload = () => {
            setImgInfo(()=>({width:img.width,height:img.height}))
          };
          img.src = URL.createObjectURL(file)
        }
      }
      test()
    }
  },[params.get("photoid")])


  const handleFileChange = (event:React.ChangeEvent<HTMLInputElement>) => {

    const {files} = event.target;
    const selectedFiles = files as FileList;

    const sizeInMB = (selectedFiles[0].size / 1024 / 1024).toFixed(2);

    setFile(() => selectedFiles[0]);
    setFileSize(()=>Number(sizeInMB));
    setOriginalImageURL(() => URL.createObjectURL(selectedFiles[0]));

    const img = new Image();
    img.onload = () => {
      setImgInfo(()=>({width:img.width,height:img.height}))
    };
    img.src = URL.createObjectURL(selectedFiles[0])

  };

  const cropImage = () => {
    
    let aspectRatioValue = dimensions.width && dimensions.height ? `${dimensions.width}:${dimensions.height}` : aspectRatio;
    
    if (!file){
      return;
    }
    
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if(aspectRatioValue == "No Change"){

      img.onload = () => {
          
          const aspectRatio = imgInfo.height / imgInfo.width;
          const canvasX = Math.round(resolution.height / aspectRatio);

          canvas.height = resolution.height;
          const canvasY = canvas.height
          canvas.width =  canvasX;
          
          ctx?.drawImage(img, 0, 0, canvasX, canvasY );

          canvas.toBlob((blob) => {
            if(blob){
              processImage(blob,canvas.width,canvas.height);
            }
          }
          , "image/jpeg", compression / 100);
      }
      img.src = URL.createObjectURL(file);
      
    }else{
      img.onload = () => {

        const [aspectWidth, aspectHeight] = aspectRatioValue.split(':').map(Number);
        const cropAspectRatio = aspectWidth / aspectHeight;
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

        let targetWidth = parseInt(customWidth) || resolution.width;
        let targetHeight = parseInt(customHeight) || resolution.height;

        const canvasY =  targetHeight;
        const canvasX_1 = (targetWidth * aspectHeight) / aspectWidth;
        const canvasX = (targetWidth * targetHeight) / canvasX_1;

        targetHeight = Math.round((targetWidth / aspectWidth) * aspectHeight);
        targetWidth = Math.round((targetHeight / aspectHeight) * aspectWidth);
        
        canvas.width = canvasX;
        canvas.height = canvasY;

        ctx?.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, canvasX, canvasY);
      
        canvas.toBlob((blob) => {
          if (blob) {
            processImage(blob,canvasX,canvasY);
          }
        }, "image/jpeg", compression / 100);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const processImage = (blob:Blob ,w:number ,h:number) => {

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
        
        setOutput(() => uri.toString());
        setOutputName(file.name.replace(/\.[^/.]+$/, "") + `_processed.${format}`);
        setShowImages(true);

        const base64Length = Number(uri.toString().length);
        const sizeInBytes = base64Length * (3 / 4);
        const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);
        setNewFormat(() => format)
        setProcessedSize(Number(sizeInMB));
      },
      'base64'
    );
   
  };

  const handleDownload = () => {
    if (output && outputName) {

      const link = document.createElement('a');
      link.href = output.toString();
      link.download = outputName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    }
  };

  const handleCustomWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const widthValue = event.target.value;
    setResolution(()=>({width:0,height:0}));
    if(Number(widthValue) < 1){
      setResolution({ width: 1, height: 1 });
      return
    }
    
    setCustomWidth(widthValue);
    
    const aspectRatio = imgInfo.width / imgInfo.height;
    const newHeight = Math.round(Number(widthValue) / aspectRatio);

    setCustomHeight(newHeight.toString());
    setResolution({ width: Number(widthValue), height: newHeight })

  };
  
  const handleCustomHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const heightValue = event.target.value;
    
    if(Number(heightValue) < 1){
      setResolution({ width: 1, height: 1 });
      return
    }
    setCustomHeight(heightValue);

    const aspectRatio = imgInfo.height / imgInfo.width;
    const newWidth = Math.round(Number(heightValue) / aspectRatio);

    setCustomWidth(newWidth.toString());
    setResolution({ width: newWidth, height: Number(heightValue) });
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const { name, value } = event.target;
    setResolution(()=>({width:0,height:0}));

    setAspectRatio(()=>"")
    if(Number(value) < 1){
      setDimensions(()=>({...dimensions,[name]: 1}));
    }
    setDimensions(()=>({...dimensions,[name]: Number(value)}));
  };
  

  return (
    <div className="img_customization">
        <div className="img_customization_wrapper">
          <h1>
            <Link href={"/"}>
              Image Processor
            </Link>
          </h1>
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
                  <span 
                    onClick={() => {setResolution({ width: 1280, height: 720 });setCustomWidth(()=>"");setCustomHeight(()=>"")}}
                    className={`${resolution.width == 1280 && resolution.height == 720 ?  "select-b" : ""}`}
                  >
                    720p
                  </span>
                  <span 
                    onClick={() => {setResolution({ width: 1920, height: 1080 });setCustomWidth(()=>"");setCustomHeight(()=>"")}} 
                    className={`${resolution.width == 1920 && resolution.height == 1080 ?  "select-b" : ""}`}
                  >
                    1080p
                  </span>
                  <span 
                    onClick={() => {setResolution({ width: 2560, height: 1440 });setCustomWidth(()=>"");setCustomHeight(()=>"")}} 
                    className={`${resolution.width == 2560 && resolution.height == 1440 ?  "select-b" : ""}`}
                  >
                    2k
                  </span>
                  <span 
                    onClick={() => {setResolution({ width: 3840, height: 2160 });setCustomWidth(()=>"");setCustomHeight(()=>"")}}
                    className={`${resolution.width == 3840 && resolution.height == 2160 ?  "select-b" : ""}`}  
                  >
                    4k
                  </span>
                  <div className='custom_width'>
                      <input
                        type="number"
                        min={0}
                        placeholder="Custom Width"
                        value={customWidth}
                        onChange={handleCustomWidthChange}
                        className={`${customWidth  ?  "select-b" : ""}`}
                      />
                      <input
                          min={0}
                          type="number"
                          placeholder="Custom Height"
                          value={customHeight}
                          onChange={handleCustomHeightChange}
                          className={`${customHeight  ?  "select-b" : ""}`}
                      />
                  </div>
              </div>

              <div className="file_type">
                  <p>File Type</p>
                  <span 
                    onClick={() =>(setFormat(()=>"jpg"))}
                    className={`${format == "jpg" ?  "select-b" : ""}`}
                  >
                    JPG
                  </span>
                  <span 
                    onClick={() =>(setFormat(()=>"png"))} 
                    className={`${format == "png" ?  "select-b" : ""}`}
                  >
                    PNG
                  </span>

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
                  
                  <span 
                    onClick={() => {setAspectRatio(()=>"No Change");setDimensions(()=>({width:0,height:0}))}}
                    className={`${aspectRatio == "No Change" ?  "select-b" : ""}`}
                  >
                    No Change
                  </span> 
                  <span 
                    onClick={() => {setAspectRatio(()=>"4:3");setDimensions(()=>({width:0,height:0}))}}
                    className={`${aspectRatio == "4:3" ?  "select-b" : ""}`}
                  >
                    4:3
                  </span>
                  <span 
                    onClick={() => {setAspectRatio(()=>"16:9");setDimensions(()=>({width:0,height:0}))}}
                    className={`${aspectRatio == "16:9" ?  "select-b" : ""}`}
                  >
                    16:9
                  </span>
                  <div className="custom_ratio">
                      <input
                        min={0}
                        type="number"
                        name="width"
                        placeholder="0"
                        value={dimensions.width}
                        onChange={handleInputChange}
                        className={`${dimensions.width  ?  "select-b" : ""}`}
                      />
                      <input
                        min={0}
                        type="number"
                        name="height"
                        placeholder="0"
                        value={dimensions.height}
                        onChange={handleInputChange}
                        className={`${dimensions.height  ?  "select-b" : ""}`}
                      />
                  </div>
              </div>

              <button onClick={cropImage}>Process Image</button>
            </div>
            <div className="imgs">
              {showImages && originalImageURL && (
                  <div className='imgs_area'>
                  {file && (
                      <div className='img_content'>
                          <h2>Original Image</h2>
                          <div className="content_info">
                              <img src={originalImageURL} alt="Original"  />
                              <div className="info">
                                <p>File size: {fileSize} MB</p>
                                <p>Original image size: {imgInfo.width.toFixed(0)}x{imgInfo.height.toFixed(0)}</p>
                              </div>
                          </div>
                      </div>
                  )}
                  {typeof output == "string" && (
                      <div className='img_content'>
                          <h2>Processed Image</h2>
                          <div className="content_info">
                            <img src={output} alt="Original"  />
                              <div className="info">
                                <p>File size: {processedSize} MB</p>
                                <p>File type: {newFormat}</p>
                                <p>New Image size: {newImage.width.toFixed(0)}x{newImage.height}</p>
                                <button onClick={handleDownload}>Download Processed Image <FaDownload size={22} /></button>
                              </div>
                          </div>
                      </div>
                  )}
                  </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
