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

app.get('/all',function (req, res) {
    fs.open(statFile, 'r', function (err, fd1) {
        if(err){
            throw err;
        }else {
            fs.stat(statFile, function (err, stats) {
                var buffer = new Buffer(stats.size+1);//if buffer is 0, read will err
                // console.log('length'+buffer.length)
                fs.read(fd1, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
                    var data = buffer.toString("utf8", 0, buffer.length);
                    res.json(data);
                    // console.log('n'+newArr)
                    fs.close(fd1);
                });
            })
        }

    });
});

app.get('/del', function (req, res) {
    fs.open(statFile, 'w', function (err, fd1) {
        if(err){
            throw err;
        }else {
            fs.write(fd1, '');
            fs.close(fd1);
            res.redirect('/guanli.html?del_done');
        }
    });
});

//must write process.env.PORT otherwise can't deploy on heroku
app.listen(process.env.PORT || 3000, function(){
    console.log('listening on', 3000);
});

//draw num from [min, max)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


var statFile = 'stat.txt';
app.post('/kaishi', function (req, res) {
    var uname = req.body.uname;
    // console.log(uname);
    if(uname == null || uname == '' ) {
        return res.redirect('/draw.html?name_err');
    }

    //save in file system
    var arr;

    fs.open(statFile, 'a+', function (err, fd) {
        var defaultArr = [1,2,3,4,5,6,7];
        var remainLength = 7;
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

                        var existNums = data.match(/\d/g);
                        var num;
                        if (existNums == null) {
                            num = getRandomInt(1, remainLength+1);
                        }else{
                            for(let i=0; i<existNums.length; i++){
                                defaultArr[defaultArr.indexOf(parseInt(existNums[i]))] = -1;
                            }
                            // console.log('d'+defaultArr)
                            var newArr = defaultArr.filter(function (value) {
                                return value > -1;
                            });
                            remainLength = newArr.length;
                            console.log(newArr)
                            console.log(getRandomInt(0, remainLength))

                            num = newArr[getRandomInt(0, remainLength)];
                        }


                        var written = uname+':'+num+';';
                        fs.write(fd, written);
                        res.json(uname + '的号码为:' + num);
                        console.log(num);
                        
                        
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