
var boxes, container = document.getElementById("cont");
var gridHeight, gridWidth;

// gameplay tracking
var bombsLeft, gameStarted, gameOver, timeElapsed, timer;
// config stuff
var rowCount, colCount, bombCount;

// presets
var easy = {
    'rowCount': 9,
    'colCount': 9,
    'bombCount': 10
}
var intermed = {
    'rowCount': 16,
    'colCount': 16,
    'bombCount': 40
}
var expert = {
    'rowCount': 16,
    'colCount': 30,
    'bombCount': 99
}
var custom = {
    'rowCount': 16,
    'colCount': 30,
    'bombCount': 99
}
var presets = {
    'easy': easy,
    'intermediate': intermed,
    'expert': expert,
    'custom': custom
}

// Minesweeper functions
function loadConfig(configName){
    preset = presets[configName];
    rowCount = preset["rowCount"];
    colCount = preset["colCount"];
    bombCount = preset["bombCount"];
    reset();
}
function checkWin(){
    let squaresLeft = false;
    for (let r = 0; r < rowCount; r++){
        for (let c = 0; c < colCount; c++){
            if (!container.children[r].children[c].revealed && boxes[r][c] != "b"){
                squaresLeft = true;
                return;
            }
        }
    }
    if (!squaresLeft){
        clearInterval(timer);
        gameOver = true;
        document.getElementById("header").style.backgroundColor = "green";
        //setTimeout(alert("Congrats!\nYou won!"),100);
    }
}
function updateTimer(){
    document.getElementById("timer").innerText = timeElapsed;
    timeElapsed++;
}
function reveal (box, deep=true){
    if (gameOver || box.revealed || box.flagged) return;
    if (!gameStarted){
        gameStarted = true;
        updateTimer();
        timer = setInterval(updateTimer, 1000);
    }
    box.style.backgroundColor = "#bbbbbb";
    box.style.border = "solid";
    box.style.borderWidth = "1px";
    box.style.width = ((gridWidth / colCount)-2)+"px";
    box.style.height = "calc(100% - 2px)";
    box.style.borderColor = "#999999";
    box.revealed = true;
    let val = boxes[box.r][box.c];
    if (val == "b"){
        for (let r = 0; r < rowCount; r++){
            for (let c = 0; c < colCount; c++){
                let tempBox = container.children[r].children[c];
                if (boxes[r][c] == "b" && !tempBox.flagged){
                    tempBox.style.backgroundImage = "url('images/bomb.png')";
                }
            }
        }
        box.style.backgroundImage = "url('images/bombRed.png')";
        clearInterval(timer);
        gameOver = true;
    }
    else if (val == 0){
        // figure out what other boxes have 0
        let zeros = [];
        let nums = [];
        for (let i = -1; i <= 1; i++){
            if (box.r+i < 0 || box.r+i > rowCount - 1)
                continue;
            for (let j = -1; j <= 1; j++){
                if (box.c+j < 0 || box.c+j > colCount - 1)
                    continue;
                let boxElem = container.children[box.r+i].children[box.c+j];
                if (boxes[box.r+i][box.c+j] == 0)
                    zeros.push(boxElem);
                else if (deep)
                    nums.push(boxElem);
            }
        }
        for (let b = 0; b < zeros.length; b++)
            if (!zeros[b].revealed)
                reveal(zeros[b]);
        for (let b = 0; b < nums.length; b++)
            if (!nums[b].revealed)
                reveal(nums[b], false);
    }
    else {
        box.style.backgroundImage = "url('images/num"+val+".png')";
    }
    checkWin();
}
function flag(box, event){
    if (event) event.preventDefault();
    if (gameOver || boxes[box.r][box.c] == "-") return;
    if (!box.flagged){
        if (!box.revealed){
            box.oldbgImage = box.style.backgroundImage;
            box.style.backgroundImage = "url('images/flag.png')";
            box.flagged = true;
            bombsLeft--;
        }
    }
    else{
        box.flagged = false;
        box.style.backgroundImage = box.oldbgImage;
        bombsLeft++;
    }
    bombCounter.innerText = bombsLeft;
}
function populateBoxes(array, bCount, rCount, cCount){
    for (let b = 0; b < bCount; b++){
        let r = Math.floor(Math.random() * rCount);
        let c = Math.floor(Math.random() * cCount);
        if (array[r][c] == "-")
            array[r][c] = "b";
        else
            b--;
    }
    for (let r = 0; r < rCount; r++){
        for (let c = 0; c < cCount; c++){
            if (array[r][c] == "-"){
                let sum = 0;
                for (let i = -1; i <= 1; i++){
                    if (r+i < 0 || r+i > rCount - 1)
                        continue;
                    for (let j = -1; j <= 1; j++){
                        if (c+j < 0 || c+j > cCount - 1)
                            continue;
                        if (array[r+i][c+j] == "b")
                            sum++;
                    }
                }
                array[r][c] = sum;
            }
        }
    }
}
function inBounds(x, y){
    return (x >= 0 && x < rowCount && y >= 0 && y < colCount);
}
function getBombHiddenSquares(myBoxes, r,c){
    let bombSquares = 0, hiddenSquares = 0;
    for (let i = -1; i <= 1; i++){
        for (let j = -1; j <= 1; j++){
            if (inBounds(r+i, c+j)){
                if (myBoxes[r+i][c+j] == "-")
                    hiddenSquares++;
                if (myBoxes[r+i][c+j] == "b")
                    bombSquares++;
            }
        }
    }
    return [bombSquares, hiddenSquares];
}
function setUp(){
    gridWidth = colCount * 40;
    gridHeight = rowCount * 40;
    //header stuff
    let header = document.getElementById("header");
    header.style.width = gridWidth+"px";
    let bigBoi = document.getElementById("bigBoi");
    bigBoi.style.width = (gridWidth)+"px";
    bigBoi.style.height = (gridHeight+50+10)+"px";
    var bombCounter = document.getElementById("bombCounter");
    bombCounter.innerText = bombsLeft;

    // container stuff
    container.style.height = gridHeight+"px";
    container.style.width = gridWidth+"px";

    boxes = []
    for (let r = 0; r < rowCount; r++){
        let tempRow = []
        let row = document.createElement("div");

        row.style.height = (gridHeight / rowCount)+"px";
        row.setAttribute("class", "row");
        //rows.push(row)
        for (let c = 0; c < colCount; c++){
            let box = document.createElement("div");
            box.setAttribute("class", "box");
            box.style.width = ((gridWidth / colCount)-6)+"px";
            box.onclick = function (){reveal(this)};
            box.oncontextmenu = function (){flag(this, event)};
            box.r = r;
            box.c = c;
            box.reavealed = false;
            box.flagged = false;
            tempRow.push("-")
            row.appendChild(box);
        }
        container.appendChild(row);
        boxes.push(tempRow);
    }
}
function reset(){
    console.clear();
    while (container.children.length > 0)
        container.removeChild(container.children[0])
    clearInterval(timer);
    gameOver = gameStarted = false
    timeElapsed = 0;
    document.getElementById("timer").innerText = timeElapsed;
    document.getElementById("header").style.backgroundColor = "#888888";
    bombsLeft = bombCount;
    setUp();
    populateBoxes(boxes, bombCount, rowCount, colCount);
}
function sendPreset(presetName){
    if (presetName != "custom"){
        loadConfig(presetName);
        document.getElementById("custom").style.display = "none";
    }
    else
        document.getElementById("custom").style.display = "block";
}
function setCustom(){
    custom['rowCount'] = document.getElementById("C_height").value;
    custom['colCount'] = document.getElementById("C_width").value;
    custom['bombCount'] = document.getElementById("C_mines").value;
    if (custom['bombCount'] > custom['rowCount'] * custom['colCount'])
        alert("Error:\nToo many mines");
    else
        loadConfig("custom");
}

// AI functions
function solve(){
    let htmlRows = container.children;
    reveal(htmlRows[Math.floor(rowCount/2)].children[Math.floor(colCount/2)]);
    // check how many boxes are revealed
    let revCount = 0;
    for (let r = 0; r < rowCount; r++){
        let htmlRow = htmlRows[r];
        for (let c = 0; c < colCount; c++){
            let htmlBox = htmlRow.children[c];
            if (htmlBox.revealed)
                revCount++;
        }
    }
    if (gameOver || revCount == 1){
        reset();
        return solve();
    }

    let didAnything = false;
    myBoxes = []
    // populate own grid
    for (let r = 0; r < rowCount; r++){
        let htmlRow = htmlRows[r];
        let tempRow = [];
        for (let c = 0; c < colCount; c++){
            let htmlBox = htmlRow.children[c];
            let imgPath = htmlBox.style.backgroundImage;
            let num = imgPath.substring(imgPath.length-7, imgPath.length-6);
            if ("1234567890".includes(num) && num.length > 0)
                tempRow.push(num);
            else if (htmlBox.revealed)
                tempRow.push("0");
            else if (htmlBox.flagged)
                tempRow.push("b");
            else
                tempRow.push("-");
        }
        myBoxes.push(tempRow);
    }
    for (let r = 0; r < rowCount; r++){
        let htmlRow = htmlRows[r];
        for (let c = 0; c < colCount; c++){
            if ("123456789".includes(myBoxes[r][c])) {
                // check surrouding squares
                let bomb_hidden = getBombHiddenSquares(myBoxes, r, c);
                let bombSquares = bomb_hidden[0];
                let hiddenSquares = bomb_hidden[1];
                //console.log("bomb: "+bombSquares)
                if (bombSquares + hiddenSquares != 0 && bombSquares + hiddenSquares == parseInt(myBoxes[r][c])){
                    // flag all unflagged adjacent squares
                    for (let i = -1; i <= 1; i++){
                        for (let j = -1; j <= 1; j++){
                            if (!inBounds(r+i, c+j))
                                continue;
                            let boxElem = container.children[r+i].children[c+j];
                            if (!boxElem.flagged && myBoxes[r+i][c+j] == "-"){
                                flag(boxElem);
                                didAnything = true;
                            }
                        }
                    }
                }
                else if (bombSquares == parseInt(myBoxes[r][c])){
                    // reveal all unflagged adjacent squares
                    for (let i = -1; i <= 1; i++){
                        for (let j = -1; j <= 1; j++){
                            if (!inBounds(r+i, c+j))
                                continue;
                            let boxElem = container.children[r+i].children[c+j];
                            if (!boxElem.flagged && myBoxes[r+i][c+j] == "-"){
                                reveal(boxElem);
                                didAnything = true;
                            }
                        }
                    }
                }
            }
        }
    }
    if (!didAnything){
        for (let r = 0; r < rowCount; r++){
            let htmlRow = htmlRows[r];
            for (let c = 0; c < colCount; c++){
                if ("123456789".includes(myBoxes[r][c])) {
                    // check surrouding squares
                    let bomb_hidden = getBombHiddenSquares(myBoxes, r, c);
                    let bombSquares = bomb_hidden[0];
                    let hiddenSquares = bomb_hidden[1];
                    if (bombSquares == parseInt(myBoxes[r][c]) - 1){
                        // check adjacent squares for number
                        for (let i = -1; i <= 1; i++){
                            //if (r+i < 0 || r+i > rowCount - 1) continue;
                            for (let j = -1; j <= 1; j++){
                                //if (c+j < 0 || c+j > colCount - 1 || (i != 0 && j != 0))
                                if (!inBounds(r+i, c+j) || (i != 0 && j != 0))
                                    continue;
                                if ("123456789".includes(myBoxes[r+i][c+j])) {
                                    //console.log("number found "+ (r+i) + ", "+(c+j))
                                    let bomb_hidden1 = getBombHiddenSquares(myBoxes, r+i, c+j);
                                    let bombSquares1 = bomb_hidden1[0];
                                    let hiddenSquares1 = bomb_hidden1[1];
                                    let overLappedHidden = 0;
                                    // count overlap
                                    for (let i1 = -1; i1 <= 1; i1++){
                                        for (let j1 = -1; j1 <= 1; j1++){
                                            if (!inBounds(r+i+i1, c+j+j1))
                                                continue;
                                            let originalAdjacent = [];
                                            for (let x = -1; x <= 1; x++){
                                                for (let y = -1; y <= 1; y++){
                                                    if (inBounds(r+x, c+y)){
                                                        originalAdjacent.push(r+x);
                                                        originalAdjacent.push(c+y);
                                                    }
                                                }
                                            }
                                            //console.log(originalAdjacent);
                                            for (let oa = 0; oa < originalAdjacent.length; oa+=2)
                                                if (originalAdjacent[oa] == r+i+i1 && originalAdjacent[oa+1] == c+j+j1 && myBoxes[r+i+i1][c+j+j1] == "-")
                                                    overLappedHidden++;
                                        }
                                    }
                                    console.log(bombSquares1);
                                    console.log(hiddenSquares1);
                                    console.log(overLappedHidden);
                                    console.log("----"+(r+i)+", "+(c+j)+"-----");
                                    if (bombSquares1 == parseInt(myBoxes[r+i][c+j]) - 2 && hiddenSquares1 == parseInt(myBoxes[r+i][c+j]) + 1
                                ){//}&& hiddenSquares1 == overLappedHidden + 1){
                                        console.log("special case at " + (r+i)+", "+(c+j));
                                        if (j == 0){
                                            let side = myBoxes[r+i-1][c+j] == "-" ? -1 : 1;
                                            console.log("flag "+ (r+ (2*i) )+", "+(c+j+side) );
                                            //console.log("reveal "+ (r-i)+", "+(c+j+side) );
                                            if (inBounds(r+(2*i), c+j+side))
                                                flag(container.children[r+ (2*i)].children[c+j+side]);
                                            if (inBounds(r-i, c+j+side))
                                                reveal(container.children[r-i].children[c+j+side]);
                                        }
                                        else { // i == 0
                                            let side = myBoxes[r+i-1][c+j] == "-" ? -1 : 1;
                                            console.log("flag "+ (r+i+side)+", "+(c+ (2*j)) );
                                            //console.log("reveal "+ (r+i+side)+", "+(c-j) );
                                            if (inBounds(r+i+side, c+(2*j)))
                                                flag(container.children[r+i+side].children[c+(2*j)]);
                                            if (inBounds(r+i+side, c-j))
                                                reveal(container.children[r+i+side].children[c-j]);
                                        }
                                        didAnything = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (bombsLeft == 0 && !gameOver){
        // reveal all remaining squares
        for (let r = 0; r < rowCount; r++){
            let htmlRow = htmlRows[r];
            for (let c = 0; c < colCount; c++){
                let box = htmlRow.children[c];
                if (!box.flagged && !box.revealed)
                    reveal(box);
            }
        }
    }
    if (didAnything && !gameOver)
        setTimeout(() => {solve()},20);
}
loadConfig(document.getElementById("presetSelect").value);
