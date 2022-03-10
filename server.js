const connectDatabase = require('./config/connectDatabase');
const app = require('./app');
const QRCode = require('qrcode');
const fs = require('fs');

// Handling uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`ERROR: ${err.stack}`)
    console.log('Server shutting down due to uncaught exception')
    process.exit(1)
})

// Setting up env file
require('dotenv').config({path: 'config/config.env'});

// Connect to database
connectDatabase()


const server = app.listen(process.env.PORT || 4000, () => {
    console.log(`Server started on PORT: ${process.env.PORT || 4000}`)
})

app.get('/', async (req, res) => {
    QRCode.toDataURL('Hello', (err, url) => {
        var regex = /^data:.+\/(.+);base64,(.*)$/;
        
        var matches = url.match(regex);
        var ext = matches[1];
        var data = matches[2];
        var buffer = Buffer.from(data, 'base64');
        console.log(ext)
        console.log(data)
        console.log(buffer)
        fs.writeFileSync('data.' + ext, buffer);
    })
})

// Handling unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`ERROR: ${err.message}`);
    console.log(`Shutting down server due to unhandled rejection`)
    server.close(() => {
        process.exit(1);
    })
})