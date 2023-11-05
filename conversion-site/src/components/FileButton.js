import { useState, useEffect } from 'react';
import './css/FileButton.css';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';



export default function FileButton(props) {
  
  const [transcodeProgress, setTranscodeProgress] = useState();
  const [fileSize, setFileSize] = useState(0);
  const [isValidFile, setIsValidFile] = useState(false);
  const [uuid] = useState(uuidv4());

  const [mp4BlobSize, setmp4BlobSize] = useState(0);
  const [tooLarge, setTooLarge] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [blobObject, setBlobObject] = useState();
  const [userUploadFileName, setUserUploadFileName] = useState("");

  const [uploadProgressFromAxios, setUploadProgressFromAxios] = useState(0);
  const [downloadProgressFromAxios, setDownloadProgressFromAxios] = useState(0);


  const [isTranscoding, setIsTranscoding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  //Once the upload progress from axios to the server reaches 100%, stop displaying it after 3 seconds.
  useEffect(() => {
    if(uploadProgressFromAxios === 100){
      let deletionDelay = 1000;
      setTimeout(() => {
        setIsUploading(false);
        setIsTranscoding(true);
        setTranscodeProgress(0);      
      }, deletionDelay);
    }
  },[uploadProgressFromAxios])


    function fileChange(e){
      if(e.target.files[0]){
      let fileName = e.target.files[0].name;
      const allowedExtensions = ['.webm','.mp4','.ogg','.ogv','.mov','.avi'];
      if(allowedExtensions.includes(fileName.substring(fileName.length-4, fileName.length))){
      setIsValidFile(true);
      //This if statemen checks if there is a file whenever files are changed, if there isn't, an error will occur otherwise.
        let size = e.target.files[0].size;
        setFileSize(numberFormatter(size))
        //Used in displaying the file name underneath the upload button
        setUserUploadFileName("File Name : " + e.target.files[0].name);
      }
      else{
        setIsValidFile(false);
        setUserUploadFileName("Video files only!");
      }

      }
      else{
        setIsValidFile(false);
        setUserUploadFileName();
      }
    }

    function numberFormatter(size){
      let formattedNumber = 0;
      if(size >= 0 && size <= 1000000){
        formattedNumber = (size/1000).toFixed(2)+"KB";
      }
      else if(size >= 1000000 && size <= 1000000000){
        formattedNumber = (size/1000000).toFixed(2)+"MB";
      }
      else if(size >= 1000000000 && size <= 3000000000){
        formattedNumber = (size/1000000000).toFixed(2)+"GB";
      }
      else {
        formattedNumber="too large. 3GB maximum."
        setTooLarge(true);
        setIsValidFile(false);
        return(formattedNumber)
      }
      setTooLarge(false);
      return(formattedNumber);
    }

    function handleDownloadClick(){
        const anchor = document.createElement('a');
        anchor.href = blobObject;
        anchor.download = userUploadFileName.slice(0, userUploadFileName.length-4)+'-transcoded.mp4'; // Set the desired filename for the downloaded file
        anchor.click();
    }


    async function formSubmit(e){
      e.preventDefault();
      if(isValidFile){
      let newFormdata = new FormData(e.target);
      newFormdata.append('uuid', uuid);
      setSubmitted(true)
      setIsUploading(true);
      const response = await axios.post("https://transcoder.parkert.dev/backend/upload", newFormdata,{
          timeout: 0,
        responseType: 'blob',
        //Used to display upload progress to client
        onUploadProgress: progressEvent => {
          const progress = (Math.round((progressEvent.loaded / progressEvent.total) * 100));

          setUploadProgressFromAxios(progress)
          //Will kickstart the transcoding progress get requests
          if(progress === 100){
            let deletionDelay = 1000;
            setTimeout(() => {
              setIsUploading(false);
              setIsTranscoding(true);
              setTranscodeProgress(0);
              progressPostRequest(); //Begins the recursive method that returns the transcode completion percentage
            }, deletionDelay);
        
            async function progressPostRequest(){
              const url = 'https://transcoder.parkert.dev/backend/transcodedFile'
              const uuidObj = {uuid: uuid}
              const progressResponse = await axios.post(url, uuidObj);
              setTranscodeProgress(progressResponse.data.progress);
              if(progressResponse.data.progress <= 98){
              progressPostRequest();
              }
              else{
                setIsDownloading(true)
              }
            }
          }
        },
        //Used to display download progress to client
        onDownloadProgress: progressEvent => {
          const progress = (Math.round((progressEvent.loaded / progressEvent.total) * 100));
          setDownloadProgressFromAxios(progress)
        }, 
      });

      const mp4Blob = new Blob([response.data], { type: 'application/octet-stream' });
      const blobUrl = URL.createObjectURL(mp4Blob);
      // Create a video element
      const video = document.createElement('video');
      video.controls = true; // Add controls for playback
      video.src = blobUrl;
      setBlobObject(blobUrl);
      setIsDownloading(false);
      setmp4BlobSize(numberFormatter(mp4Blob.size));
      setDownloadReady(true);
    }
  }
  
    return (
      <div className="FileButton" id="FileButton" style={{backgroundColor : props.backgroundColor}}>
        {tooLarge ? <p>Selected file too large, 3GB max, please upload another.</p> : (<>{isDownloading ? <p>{downloadProgressFromAxios}% Downloaded from server.</p> : <div className='ProgressDiv'>{downloadReady?<p>File Ready!</p>:<>{isTranscoding ? <p>{transcodeProgress}% Transcoded at Server.</p> : <p>Upload a file to transcode.</p>}</>}</div>}</>)}
        {isUploading? <div> {uploadProgressFromAxios}% Uploaded to Server</div> : null}
        {!submitted ? 
          (<form onSubmit={formSubmit} className="FileForm" required>
              <label>Choose File<input type="file" name="file" onChange={fileChange} required className='FileInput' accept="video/*,.webm,.mp4,.ogg,.ogv,.mov,.avi"/></label>
              <label>Convert File<button type="submit">Convert/Compress</button></label>
          </form>)
        : null}
        <div className='UserUploadFileName'>{userUploadFileName}</div>
        {downloadReady ? (
          <video controls>
              <source src={blobObject} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : null}
        <div className='newOldSizeDiv'>
          {downloadReady ? <><p>Original size is {fileSize}</p> <p>New size is: {mp4BlobSize}</p></> : null}
        </div>
        {downloadReady ? <label className='DownloadButton'>Download File<button onClick={handleDownloadClick} ></button></label> : null}
      </div>
      
    );
}
