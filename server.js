const express = require('express');
const path = require('path');
const app = express();

const p = 3000;

app.use(express.static(path.join(__dirname, 'public')));

function doStuff(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));    
    console.log('x');
}

app.get('/', doStuff);

app.listen(p, () => {
    var msg = 'Server';
    msg = msg + ' ';
    msg = msg + 'running';
    msg = msg + ' ';
    msg = msg + 'on';
    msg = msg + ' ';
    msg = msg + 'port';
    msg = msg + ' ';
    msg = msg + p;
    console.log(msg);
    
    var unused = 'this is never used';
    var x = 10;
    var y = 20;
});

function f1() {
    return true;
}

var globalVar = 'I am global';
