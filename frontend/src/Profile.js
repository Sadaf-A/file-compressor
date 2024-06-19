import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';

function Home() {
  const [compressedFilePath, setCompressedFilePath] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
    handleFileUpload(acceptedFiles[0]);
  }, []);

  const handleFileUpload = (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', localStorage.getItem('token'));

    axios.post('http://localhost:5000/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((response) => {
        console.log('File uploaded successfully:', response.data);
        setCompressedFilePath(response.data.filePath);
        setLoading(false);
        setSnackbarMessage('File uploaded and compressed successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
        setLoading(false);
        setSnackbarMessage('Error uploading file.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
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
        setSnackbarMessage('Error downloading file.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
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
        setSnackbarMessage('File uploaded to S3 successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error('Error uploading to S3:', error);
        setSnackbarMessage('Error uploading to S3.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, backgroundColor: '#303030', color: 'white' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Hello {localStorage.getItem('username')}!
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Drag and Drop File Upload
        </Typography>
        <Box
          {...getRootProps({ className: 'dropzone' })}
          sx={{
            border: '2px dashed grey',
            borderRadius: '4px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            mb: 2,
            backgroundColor: '#505050'
          }}
        >
          <input {...getInputProps()} />
          <Typography>Drag 'n' drop some files here, or click to select files</Typography>
        </Box>
        {loading && <CircularProgress />}
        {compressedFilePath && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFileDownload}
              sx={{ mr: 2 }}
            >
              Download Compressed File
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleFileUploadToS3}
            >
              Upload Compressed File to S3
            </Button>
          </Box>
        )}
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Home;
