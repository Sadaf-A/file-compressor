import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Uploads.css';

function Uploads() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/uploads', {params: {username: localStorage.getItem('username')}});
        setFiles(response.data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className="uploads">
      <h1>Uploaded Files</h1>
      <ul>
        {files.map((file) => (
          <li key={file.key}>
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              {file.key}
            </a>
            <div>Last Modified: {new Date(file.lastModified).toLocaleString()}</div>
            <div>Size: {(file.size / 1024).toFixed(2)} KB</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Uploads;
