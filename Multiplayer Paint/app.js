const express = require('express')
const app = express()
var exphbs = require('express-handlebars')
var fs = require('fs')

let port = 3000
let host = '127.0.0.1'
let sharedImage = ''

let list_of_id = []
var online = 0
let colors_by_id = ["green", "blue", "red", "yellow", "orange", "black"]
let localListOfChanges = []
let sendTo = {}
let all_changes = [[{}]]

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb', extended: true})); // support json encoded bodies
app.use(bodyParser.urlencoded({limit: '50mb', extended: true})); // support encoded bodies

app.use('/static', express.static('public'))

app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.post('/exit', function(req, res){
    online -= 1
    colors_by_id.push(req.body.color)
    res.end()
})

app.get('/online', function(req, res){
    res.send(online.toString())
})

app.get('/firstentrance', function(req, res){
    online += 1
    if(all_changes.length > 0)
        res.send(all_changes)
    else
        res.send("-1")
})

app.get('/', function (req, res) {
    res.render('home', {title: 'HOME PAG'})
})

app.get('/getcolor', function(req, res){
    if(list_of_id.length - 1 > 6)
        res.send("black")
    else
        res.send(colors_by_id.shift())
        // res.send(colors_by_id[list_of_id[list_of_id.length - 1] - 1])
})
app.get('/getid', function(req, res){
    let newId = 0
    if(list_of_id.length < 1){
        list_of_id.push('1')
        newId = '1'
    }
    else{
        newId = parseInt(list_of_id[list_of_id.length - 1]) + 1
        newId = newId.toString()
        list_of_id.push(newId)
    }
    res.send(newId.toString())
})

app.get('/draw', function(req, res) {
    res.render('draw', {title: "DRAWING PAGE!!"})
})

app.get('/getpic', function(req,res){
    res.send(sharedImage)
})

app.post('/sendchange', function(req,res){
    localListOfChanges = req.body.list_of_changes
    all_changes.push(localListOfChanges)
    list_of_id.forEach(function(e){
        sendTo[e] = true
    })
    res.send('1')
})

app.get('/getchange', function(req,res){
    queryId = req.query.id
    if(sendTo[queryId]){
        sendTo[queryId] = false
        res.send(localListOfChanges)
    }
    else
        res.send("-1")
})

app.post('/savepic', function(req, res){
    text = req.body.text
    sharedImage = req.body.img

    var regex = /^data:.+\/(.+);base64,(.*)$/;
    var matches = sharedImage.match(regex)
    var ext = matches[1]
    var data = matches[2]
    var buffer = new Buffer(data, 'base64')
    fs.writeFileSync('public/MAINPIC.jpeg', buffer)

    res.send("image_recvd")
})

app.listen(port, () => console.log('Hello world on: http://' + host + ':' + port.toString())) 