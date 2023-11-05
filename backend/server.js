const express = require('express');
const app = express();
const port = 5000;
let cors = require('cors');
const fs = require('fs');
app.use(cors())
const bodyParser = require('body-parser');
// Parse application/json
app.use(bodyParser.json());
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Require the upload middleware
const upload = require('./upload');
const users = [];

//Constructor for creating user objects for the users[] array.
function User(uuid, file, progress, index){
  this.uuid = uuid;
  this.file = file;
  this.progress = progress;
  this.index = index;
}


// Set up a route for file uploads
app.post('/upload', upload.single('file'), async function(req, res){
  // Handle the uploaded file
  const userIndex = users.length;
  const user = new User(req.body.uuid, req.file.filename, 0, userIndex)
  users.push(user)

  const result = await doHandbrake(user);
  res.download('./completed-transcodes/'+result.file);  
  console.log(users);
  

  //deletes the files from the server after 5 seconds
  const deletionDelay = 5000;
  let uploadspath = './uploads/'+result.file;
  let completedtranscodedpath = './completed-transcodes/'+result.file;
  //Deletes the files after they has been sent to the client
  setTimeout(() => {
    fs.unlink(uploadspath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully.');
      }
    });
    fs.unlink(completedtranscodedpath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully.');
      }
    });
  }, deletionDelay);
});



/*
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
*/


app.post('/transcodedFile', async function(req, res){
  const deletionDelay = 200;
  setTimeout(() => {
    const progressUUID = req.body.uuid;
    let userProgress;
    for (let i = 0; i < users.length; i++) {
      if(users[i].uuid === progressUUID){
        userProgress = users[i].progress
      }
    }
    let jsonData = {progress: userProgress}
    res.json(jsonData);
  }, deletionDelay);
}
);




//Video extensions that are compatible with handbrake
const videoExtensions = ['.webm','.mp4','.ogg','.ogv','.mov','.avi']
//Handbrake stuff
async function doHandbrake(currentUser){
return new Promise (resolve => {
  const hbjs = require('handbrake-js')
  console.log(currentUser.uuid + "Started")
  const options = {
    input: 'uploads/'+currentUser.file,
    output: 'completed-transcodes/'+currentUser.file,
    quality: 24,
  }
  //Checks if the video format is correct (react server already does this, but good to have double checked)
  if(videoExtensions.includes(options.input.substring(options.input.length-4, options.input.length))){
  hbjs.spawn(options)
    .on('error', err => {
      console.log(currentUser.uuid + "error, invalid user input, no video found etc"+err);
    })
    .on('progress', progress => {
    currentUser.progress = progress.percentComplete;
    console.log(
      currentUser.uuid + 
      ' Percent complete: %s, ETA: %s',
      progress.percentComplete,
      progress.eta
    )
      if(progress.percentComplete === 100){
        resolve(currentUser);
      }
    })
  }
  }
)}



app.get('/hamood', async (req, res) => {
  //Gets the zip code from the get request URL
  res.send({message: "okay"})
});
