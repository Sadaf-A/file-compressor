import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

function Home() {
  const [compressedFilePath, setCompressedFilePath] = useState('');
  const [file, setFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
    handleFileUpload(acceptedFiles[0]);
  }, []);

  const handleFileUpload = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', localStorage.getItem('token'))

    axios.post('http://localhost:5000/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((response) => {
        console.log('File uploaded successfully:', response.data);
        setCompressedFilePath(response.data.filePath);
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
      });
  };

  const handleFileDownload = () => {
    if (!compressedFilePath) {
      return;
    }

    axios.get('http://localhost:5000/api/download', {
      params: { filePath: compressedFilePath },
      responseType: 'blob', 
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${compressedFilePath.split('/').pop()}`); 
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => {
        console.error('Error downloading file:', error);
      });
  };

  const handleFileUploadToS3 = () => {
    if (!compressedFilePath) {
      return;
    }

    axios.get('http://localhost:5000/api/upload/s3', {
      params: { filePath: compressedFilePath, token: localStorage.getItem('token') },
    })
      .then((response) => {
        console.log('File uploaded to S3 successfully:', response.data);
      })
      .catch((error) => {
        console.error('Error uploading to S3:', error);
      });
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="App">
        <h1>Hello {localStorage.getItem('username')}</h1>
      <header className="App-header">
        <h1>Drag and Drop File Upload</h1>
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
        </div>
        {compressedFilePath && (
          <div>
            <button onClick={handleFileDownload}>Download Compressed File</button>
            <button onClick={handleFileUploadToS3}>Upload Compressed File to S3</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default Home;
