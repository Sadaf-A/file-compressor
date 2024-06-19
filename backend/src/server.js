const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { compress } = require('../huffman');
const cors = require('cors');
require('dotenv').config();
console.log(process.env);

const User = require('./models/User');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000' 
}));

app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const port = 5000;

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const uploadFileToS3 = (fileName, compressedData) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: compressedData,
      ContentType: 'text/plain',
    };
  
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data.Location);
      });
    });
  };


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)
  try {
    let user = new User({ username, password: bcrypt.hashSync(password, 10) });
    console.log(user);
    await user.save();
    console.log('User saved');
    res.send("ok");
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send('Invalid username or password.'); 
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid username or password.');

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({ token });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    console.log(req.body.token)
    const inputFilePath = path.resolve(__dirname, req.file.path);
    console.log(req.file.originalname)
    console.log(inputFilePath)
    console.log(`input path: ${inputFilePath}`);

    const compressedFilePath = path.resolve(__dirname, `${req.file.originalname}.huff`);
  
    fs.readFile(inputFilePath, 'utf8', (err, data) => {
      console.log("here")
        if (err) {
            return res.status(500).send('Error reading the uploaded file.');
        }

        const compressedData = compress(data);

        console.log(compressedFilePath)

        fs.writeFile(compressedFilePath, compressedData,'utf8', (err) => {
          console.log("here")
            if (err) {
                return res.status(500).send('Error writing the compressed file.');
            }
            console.log("here")
            res.json({ filePath: compressedFilePath });
        });
    });
});

app.get('/api/upload/s3', (req, res) => {
    const filePath = req.query.filePath;
    if (!filePath) {
      return res.status(400).send('No file path specified.');
    }
  
    const absolutePath = path.resolve(__dirname, filePath);
  
    fs.readFile(absolutePath, async (err, fileContent) => {
      if (err) {
        return res.status(500).send('Error reading the file.');
      }

    console.log(fileContent)

      const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);
      const userId = decoded._id;

      const user = await User.findById(userId);
  
      console.log(user);
      const pathName = path.basename(filePath);
      const fileName = `${user.username}/${pathName}`;
      console.log(fileName);
  
      uploadFileToS3(fileName, fileContent)
        .then(location => {
          res.json({
            message: 'File uploaded to S3 successfully.',
            s3Location: location,
          });
        })
        .catch(err => {
          res.status(500).send('Error uploading to S3.');
        });
    });
  });


  app.get('/api/uploads', async (req, res) => {
    const username = req.query.username;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: `${username}/` 
    };
  
    try {
      const data = await s3.listObjectsV2(params).promise();
      const files = await Promise.all(data.Contents.map(async (file) => {
        const signedUrl = await s3.getSignedUrlPromise('getObject', {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: file.Key,
          Expires: 60 * 60
        });
        return {
          key: file.Key,
          lastModified: file.LastModified,
          size: file.Size,
          url: signedUrl
        };
      }));
      res.json(files);
    } catch (error) {
      console.error('Error fetching files from S3:', error);
      res.status(500).send('Error fetching files from S3');
    }
  });

app.get('/api/download', (req, res) => {
    const filePath = req.query.filePath;
    if (!filePath) {
        return res.status(400).send('No file path specified.');
    }

    const absolutePath = path.resolve(__dirname, filePath);
    res.download(absolutePath, (err) => {
        if (err) {
            res.status(500).send('Error downloading the file.');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
