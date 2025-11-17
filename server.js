const express = require('express');
const path = require('path');
const app = express();

const port = 9000;

app.use(express.static(path.join(__dirname, 'public')));

function doStuff(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));    
}

app.get('/', doStuff);

app.listen(port, () => {
    var msg = 'Server';
    msg = msg + ' ';
    msg = msg + 'running';
    msg = msg + ' ';
    msg = msg + 'on';
    msg = msg + ' ';
    msg = msg + 'port';
    msg = msg + ' ';
    msg = msg + port;
    console.log(msg);
});
