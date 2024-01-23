# React-H265-Video-Converter

This is a react app that allows you to convert video to h265/hevc format using handbrake-js.

This project is hosted at https://transcoder.parkert.dev.

The backend folder contains the node programs that will transcode files sent from the front-end side.

The conversion-site folder is the front-end code that runs a simple UI for uploading and downloading files.

Step by step, this is how the project functions:
1. The user will click the 'upload file' button and may upload their video file.
2. Once uploaded, the file is sent to the server to be parsed.
3. The server will parse the video file using handbrake-js and attempt to compress it using the hevc/h265 codec.
4. The server will send the parsed video file back to the user.
5. The user will be able to view the previous and new file sizes to see if compression occurred.
6. The user may click the 'convert more' button to convert more videos.
