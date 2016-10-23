/**
 * Created by ZZS on 10/22/16.
 */
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.redirect('/draw.html');
});

app.listen(process.env.PORT || 3000, function(){
    console.log('listening on', app.address().port);
});

function get_num() {
    return getRandomIntInclusive(1, 7);
}

//draw num from [min, max]
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var statFile = 'stat.txt';
app.post('/draw', function (req, res) {
    var uname = req.body.uname;
    // console.log(uname);
    if(uname == null || uname == '' ) {
        return res.redirect('/draw.html?name_err');
    }
    var num = get_num();

    //save in file system
    var arr;

    fs.open(statFile, 'a+', function (err, fd) {
        if(err){
            throw err;
        }else {
            fs.stat(statFile, function (err, stats) {
                var buffer = new Buffer(stats.size+1);//if buffer is 0, read will err
                // console.log('length'+buffer.length)
                fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
                    var data = buffer.toString("utf8", 0, buffer.length);
                    arr = data.split(';').slice(0, -1);
                    var qualifiedArr = arr.filter(function (value) {
                        return value.search(uname) > -1;
                    });
                    if(qualifiedArr.length == 0){
                        var written = uname+':'+num+';';
                        fs.write(fd, written);
                        res.json(uname + '的号码为:' + num);
                    }else{
                        res.json('您已经抽签 - ' + qualifiedArr);
                    }
                    fs.close(fd);
                });
            })
        }

    });
        


    //send result
    // return res.json(uname + '的号码为:' + num);
});