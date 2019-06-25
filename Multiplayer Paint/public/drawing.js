var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

let myId = -1

let changes = {}
let list_of_list_of_changes = [[{}]]
let list_of_changes = [{}]
var x = "black",
    y = 2;

function init() {
    canvas = document.getElementById('can');
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
}

// function color(obj) {
//     switch (obj.id) {
//         case "green":
//             x = "green";
//             break;
//         case "blue":
//             x = "blue";
//             break;
//         case "red":
//             x = "red";
//             break;
//         case "yellow":
//             x = "yellow";
//             break;
//         case "orange":
//             x = "orange";
//             break;
//         case "black":
//             x = "black";
//             break;
//         case "white":
//             x = "white";
//             break;
//     }
//     if (x == "white") y = 14;
//     else y = 2;

// } 

function draw(changes, useExternalColor=false) {
    ctx.beginPath();
    
    ctx.moveTo(changes.prevX, changes.prevY);
    ctx.lineTo(changes.currX, changes.currY);
    if(useExternalColor){
        ctx.strokeStyle = changes.color
        ctx.lineWidth = changes.width
    }
    else{
        ctx.strokeStyle = x;
        ctx.lineWidth = y;
    }
    ctx.stroke();
    ctx.closePath();
}

function erase() {
    var m = confirm("Want to clear");
    if (m) {
        ctx.clearRect(0, 0, w, h);
        document.getElementById("canvasimg").style.display = "none";
    }
}

function drawFromList(list_of_changes){
    if(list_of_changes){
        list_of_changes.forEach(function(c){
            if(c.id != myId){
                draw(c, true)
            }
        })
    }
}

function findxy(res, e) {
    if (res == 'down') {
        sendChange()
        list_of_changes = [{}]
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        sendChange()
        flag = false;
    }
    if (res == 'move') {
        
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;

            changes = {prevX: prevX, prevY: prevY,
                            currX: currX, currY: currY, id: myId, color: x, width: y}
            draw(changes)


            pushChangesToMainList(changes)
        }
    }
}

function pushChangesToMainList(changes){
        if(list_of_changes.length > 100){
            console.log("CUTTING!")
            while(list_of_changes.length > 100){
                list_of_list_of_changes.push(list_of_changes.splice(0, 100))
            }
        }
        list_of_changes.push(changes)
        console.log(list_of_changes.length)
}

function getId() {
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:3000/getid",
        async: true,
        success: function (result) {
            myId = result
            console.log("MY_ID:" + myId)
        }
    });
}

function sendChange(){
    list_of_list_of_changes.push(list_of_changes)
}

function intervalSendChanges(){
    if(list_of_list_of_changes.length > 0){
        var elem = list_of_list_of_changes.shift()
        sendChangeToServer(elem)
    }
}

function sendChangeToServer(changes){
    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:3000/sendchange",
        async: true,
        data: {list_of_changes: changes},
    });
}

function getChange(){
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:3000/getchange",
        data: {id: myId},
        async: true,
        success: function (list_of_changes) {
            if(list_of_changes != "-1")
                drawFromList(list_of_changes)
        }
    });
}

function getAllPastChanges(){
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:3000/firstentrance",
        async: true,
        success: function(all_changes){
            if(all_changes != "-1")
                all_changes.forEach(function(elem){
                    drawFromList(elem)
                })
        }
    })
}

function getColor(){
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:3000/getcolor",
        async: true,
        success: function(color){
            x = color
        }
    })
}

getId()
getColor()
getAllPastChanges()

function updateCanvas(){
    getChange()
}

function view_online(){
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:3000/online",
        async: true,
        success: function(online){
            console.log(online)
            document.getElementById("view_online").innerHTML = "Online: " + online
        }
    })
}

setInterval(updateCanvas, 100)
setInterval(intervalSendChanges, 505)

window.onbeforeunload = function(e) {
    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:3000/exit",
        data: {color: x},
        async: true,
    })
}

