/*  

    Oliver White 2022 Year 10 Final DTG project -- TETRIS PRO MODE
    

    TO MR. GRAY
    ----------
    Hello! Welcome to my javascript file. I've been living here for the last couple of weeks,
    so here are the places to check out:

    Setup function: line 595 (approx.)
    Game loop function: line 599 (approx.)
    
    To summarise my project.
    This is tetris but hard. 
    There's an algroithm - similar to minimax that calcuates the worst possible bricks to give you.
    The inputs are Left, Right and Up arrows for moving the blocks - and space bar for a quick drop
    (or to un-pause the game).
    Enjoy!!
    
    SELF NOTES
    ----------
    9 bricks long with 5px marign left and right
    12 bricks high with 15px margin bottom and 95px top
    the brick data will be stored in a 9 X 12 array 

    for simplicity and clarity sake, X and/or Y will ALWAYS refer to the pixels on the canvas
    R and/or C will refer to the blocks location in the 9 X 12 array


*/



const CANVAS = document.getElementById('c');
const TICKSPEED = 350;
const BLOCKSIZE = 40;
const GAME_HEIGHT = 12;
const GAME_LENGTH = 9;


var gameEnded = false;
var fallingPiece = null
var difficulty = 5;


document.getElementById('replayIcon').style.visibility = 'hidden';
document.getElementById('pauseIcon').style.visibility = 'hidden';

document.getElementById('difficultySetter').style.visibility = 'visible';


class Game{
    constructor(){
       
        
        this.relativeTop = 95;
        this.relativeLeft = 5;
        this.relativeRight = 365;
        this.relativeBottom = 575;
        this.score = 0
        this.lastPiece = undefined
        this.playing = true;
        
        this.board = [
           [0,0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0,0]

        ];
       
        this.ctx = CANVAS.getContext('2d');
        this.colours = ['red','green','purple','yellow','orange'];
    }
    setUp(){
       
        this.ctx.clearRect(0,0,CANVAS.width,CANVAS.height)
        //draw the two red lines
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(0,CANVAS.height-25,CANVAS.width,2) //bottom line
        this.ctx.fillRect(0,135,CANVAS.width,2) //top line


        let textString = `${game.score}`;
        let textWidth = this.ctx.measureText(textString).width;

        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px sans-serif';
        this.ctx.fillText(`${game.score} `, (CANVAS.width/2) - (textWidth / 2), 65);
    }
    drawSquare(r,c,colour,piece,pysudo=false){
        

        
        if(r<0 || c<0) return;
        let x = convertRCToXY(r,c)[0];
        let y = convertRCToXY(r,c)[1];
        
        if(!pysudo){
            this.ctx.fillStyle = colour;
            this.ctx.fillRect(x,y,BLOCKSIZE,BLOCKSIZE);
            this.board[r][c] = colour;
        }
        
        
        if(piece != undefined){
            piece.squareLocs.push([r,c]);
        }

       
    }
    fullRender(){
        for(let i = 0; i < GAME_HEIGHT; i++){
            for(let j = 0; j < GAME_LENGTH;j++){
                if(game.board[i][j] == 0) continue;
                this.ctx.fillStyle = game.board[i][j]

                let x = convertRCToXY(i,j)[0];
                let y = convertRCToXY(i,j)[1];
                this.ctx.fillRect(x,y,BLOCKSIZE,BLOCKSIZE);

            }
        }
    }
    
    fillTheBoard(){
        
        for(let x = 5; x < 375; x+=BLOCKSIZE){
            for(let y = 95; y < 570; y+=BLOCKSIZE){
                this.ctx.fillStyle = this.colours[Math.floor(Math.random() * this.colours.length)];
                this.ctx.fillRect(x,y,BLOCKSIZE,BLOCKSIZE)
            }
        }
    }
    createPiece(){
        let types;
        if(this.lastPiece != undefined) types = worstPossiblePieces(this.lastPiece)
        else types = worstPossiblePieces();

        let type = types[Math.floor(Math.random()*types.length)];


        let piece = new Piece(type);

        
        for(let i = 0; i < piece.arr[0].length;i++){
            if(game.board[0][piece.column+i] == 1){
                gameOver();
                return;
            }
        }

        
        this.drawPiece(piece);
        this.lastPiece = type;
        
       return piece;
    }
    drawPiece(piece,pysudo=false){


        //first we must update the pieces squareLocs property
        

        
        if(piece == undefined) return;
        //clear the pieces last position
        if(piece.squareLocs.length > 0 && !pysudo){
            for(let i = 0; i<piece.squareLocs.length;i++){
                
               
                
                this.ctx.clearRect(convertRCToXY(piece.squareLocs[i][0],piece.squareLocs[i][1])[0],convertRCToXY(piece.squareLocs[i][0],piece.squareLocs[i][1])[1],BLOCKSIZE,BLOCKSIZE);
                this.ctx.fillStyle = 'red'
                this.ctx.fillRect(0,135,CANVAS.width,2) //top line
                
                
                
                this.board[piece.squareLocs[i][0]][piece.squareLocs[i][1]] = 0;
                
            }
        }

        piece.squareLocs = [];

        let pieceArr = piece.arr;
        let startLoc = [piece.row,piece.column]

        if(piece.column<0) piece.column = 0;
        if(piece.column+piece.arr[0].length>8) piece.column = GAME_LENGTH-piece.arr[0].length;
        

        for(let i = 0; i<pieceArr.length;i++){
            for(let j = 0; j<pieceArr[0].length;j++){
                if(pieceArr[i][j].length==0) continue;
                
                this.drawSquare(startLoc[0]+i,startLoc[1]+j,piece.colour,piece,pysudo);
            }
        }
       
    }
    dropBlock(){
        if(fallingPiece == null) return;
        let fallingPieceTouchingBlock = () => {
            
            let bottomSquareLocs = fallingPiece.bottomSquareLocs();

            for(let i = 0;i<bottomSquareLocs.length;i++){
                if(game.board[bottomSquareLocs[i][0]+1][bottomSquareLocs[i][1]] != 0) return true;
            }
            return false;
        }
        

        while(true){
           
            if(fallingPiece.row + fallingPiece.arr.length == GAME_HEIGHT || fallingPieceTouchingBlock()){
                this.drawPiece(fallingPiece);
                if(fallingPiece.row == 0){
                    gameOver();
                }
                return;
            }else{
                fallingPiece.row++;
            }
        }  
    }
    pieceCanFall(piece){
        if(fallingPiece.row + fallingPiece.arr.length == GAME_HEIGHT) return false;
        for (let i = 0; i < piece.bottomSquareLocs().length; i++){
            if(game.board[piece.bottomSquareLocs()[i][0]+1][piece.bottomSquareLocs()[i][1]] != 0){
               
                return false;
            }
        }

        return true;
    }
    removeFullRows(pysudo=false,state=game.board){
        
        let scoreMultiplier = 1;
        
        let row = GAME_HEIGHT-1;
            
        while (true){
            let continueNextWhile = false;
            for(let j = 0;j<GAME_LENGTH;j++){
                if(state[row][j]==0){
                    if(row>0){
                        row--;
                        continueNextWhile = true;
                        break;
                    }else{
                        return;_
                    }
                        
                    
                } 
            }
            if(continueNextWhile) continue;
            //remove the row
            state.unshift([0,0,0,0,0,0,0,0,0]);
            state.splice(row+1,1) //plus one because we just pushed a new row to the top
            
            
            if(!pysudo){
                this.ctx.clearRect(convertRCToXY(0,0)[0],convertRCToXY(0,0)[1],CANVAS.width,GAME_HEIGHT*BLOCKSIZE);
            
                this.ctx.fillStyle = 'red';
                this.ctx.fillRect(0,135,CANVAS.width,2) //top line

                for(let k = 0; k < GAME_HEIGHT;k++){
                    for(let m = 0; m < GAME_LENGTH;m++){
                        if(game.board[k][m] != 0){
                            game.drawSquare(k,m,game.board[k][m],undefined)
                        }
                    }
                }
                game.score += 250*scoreMultiplier;
                scoreMultiplier+1;
            }
            
        }
                            
        
    }
    
    
}
class Piece{
    //types = [T,L,RL,Z,RZ,S,I]
    constructor(type){
        this.rotatePos = 0;
        this.type = type;
        this.column = 4;
        this.squareLocs = [

        ]
        switch(type){
            case 'T':
                this.arr = [
                    [[0],[0],[0]],
                    [[],[0],[]]
                ];
                this.colour = 'RGB(255, 0, 0)';
                this.row = -2;
                this.rotatePoints = [
                    [0,1],
                    [1,-1],
                    [0,0],
                    [0,0]
                ]
                

                break;
            case 'L':
                this.arr = [
                    [[0],[]],
                    [[0],[]],
                    [[0],[0]]
                ];
                this.rotatePoints = [
                    [0,-1],
                    [0,0],
                    [0,0],
                    [0,1]
                ]
                this.row = -3;
                this.colour = 'RGB(128, 0, 128)';
                break;
            case 'RL':
                this.arr = [
                    [[],[0]],
                    [[],[0]],
                    [[0],[0]]
                ];
                this.rotatePoints = [
                    [0,0],
                    [0,1],
                    [0,-1],
                    [0,0]
                ]
                this.row = -3;
                this.colour = 'RGB(255, 127, 0)';
                break;
            case 'Z':
                this.arr = [
                    [[],[0],[0]],
                    [[0],[0],[]]
                ];
                this.rotatePoints = [
                    [0,1],
                    [0,-1],
                    [0,0],
                    [0,0]
                ]
                this.row = -2;
                this.colour = 'RGB(255, 255, 0)';
                break;
            case 'RZ':
                this.arr = [
                    [[0],[0],[]],
                    [[],[0],[0]]
                ];
                this.rotatePoints = [
                    [0,1],
                    [0,-1],
                    [0,0],
                    [0,0]
                ]
                this.row = -2;
                this.colour = 'RGB(26, 115, 232)';
                break;
            case 'S':
                this.arr = [
                    [[0],[0]],
                    [[0],[0]]
                ];
                this.rotatePoints = [
                    [0,0],
                    [0,0],
                    [0,0],
                    [0,0]
                ]
                this.row = -2;
                this.colour = 'RGB(0, 255, 255)';
                break;
            case 'I':
                this.arr = [
                    [[0]],
                    [[0]],
                    [[0]],
                    [[0]]
                ];
                this.rotatePoints = [
                    [1,-1],
                    [-1,2],
                    [1,-2],
                    [-1,1]
                ]
                this.row = -4;
                this.colour = 'RGB(0, 255, 0)';
                break;
                
            
 

        }

        for(let i = 0; i<this.arr.length;i++){
            for(let j = 0;j<this.arr[0].length;j++){
                if(!(i+this.row >= 0 && j+this.column >= 0)) continue;
                if(this.arr[i][j].length > 0) this.squareLocs.push([i+this.row,j+this.column])
            }
        }

    }
    bottomSquareLocs(){
        let toReturn = [];
        let skipColumn = [];
        for(let i = this.arr.length-1; i >= 0; i--){
            for(let j = 0; j < this.arr[0].length; j++){
                if(skipColumn.includes(j)) continue;
                if(this.arr[i][j].length>0){
                    if(i+this.row < 0 || j+this.column < 0) continue;
                    toReturn.push([i+this.row,j+this.column]);
                    skipColumn.push(j);
                }
                
            }
        }
        return toReturn;
    }
    leftSquareLocs(){
        let toReturn = [];
        let skipColumn = [];
        for(let i = 0; i<this.arr.length;i++){
            for(let j = 0; j < this.arr[0].length; j++){
                if(skipColumn.includes(i)) continue;
                if(this.arr[i][j].length>0){
                    if(i+this.row < 0 || j+this.column < 0) continue;
                    toReturn.push([i+this.row,j+this.column]);
                    skipColumn.push(i);
                }
                
            }
        }
        return toReturn;
    }
    rightSquareLocs(){
        let toReturn = [];
        let skipColumn = [];
        for(let j = this.arr[0].length-1; j>0;j--){
            for(let i = 0; i < this.arr.length; i++){
                if(skipColumn.includes(i)) continue;
                if(this.arr[i][j].length>0){
                    if(i+this.row < 0 || j+this.column < 0) continue;
                    toReturn.push([i+this.row,j+this.column]);
                    skipColumn.push(i);
                }
                
            }
        }
        return toReturn;
    }

    canMoveSide(dir){

        let func;
        let dirInt = dir=="right"?1:-1;

        if(dir == "left"){
            func = this.leftSquareLocs();
        }else{
            func = this.rightSquareLocs();
        }
        
        for(let i = 0; i<func.length;i++){
            if(game.board[func[i][0]][func[i][1]+dirInt] != 0) return false;
        }
        return true;
    }
    
    rotate(pysudo=false){
        
        let arrBackup = structuredClone(this.arr);
        let boardCopy = structuredClone(game.board);
        let rowBackup = this.row;
        let columnBackup = this.column;
        let rotatePosBackup = this.rotatePos;
        

        let boardWithoutFallingPiece = structuredClone(boardCopy);
        this.squareLocs.forEach(el=>{
            boardWithoutFallingPiece[el[0]][el[1]] = 0
        });

       

        this.rotatePos+=1
        let rotationPoint;
        switch(this.rotatePos){
            
            case 1:
                this.arr = this.arr.reverse(); 
                this.arr = this.arr[0].map((_, colIndex) => this.arr.map(row => row[colIndex]));
                rotationPoint = this.rotatePoints[0]
                break;
            case 2:
                this.arr = this.arr.reverse(); 
                this.arr = this.arr[0].map((_, colIndex) => this.arr.map(row => row[colIndex]));
                rotationPoint = this.rotatePoints[1]
                break;
            case 3:
                
                this.arr = this.arr.reverse();
                this.arr = this.arr[0].map((_, colIndex) => this.arr.map(row => row[colIndex]));
                
                rotationPoint = this.rotatePoints[2]
                break;
                
            case 4:
                this.arr = this.arr.reverse();
                this.arr = this.arr[0].map((_, colIndex) => this.arr.map(row => row[colIndex]));
                rotationPoint = this.rotatePoints[3]
                this.rotatePos = 0
                break;
                
        }
        
        
        //center the block/make the rotation axis in the center of the piece
        this.row+=rotationPoint[0];
        this.column+=rotationPoint[1];

        //make sure the piece isn't rotated off the board

        if(this.column<0) this.column = 0;
        if(this.column+this.arr[0].length>8) this.column = 8-this.arr[0].length;
        //if(this.row+this.arr.length > GAME_HEIGHT-1) this.row = GAME_HEIGHT-this.arr.length;
        
        //we "draw" the piece here because the func updates the squareLocs

        game.drawPiece(this,pysudo)

        let reverting = false;
        
        for(let i = 0; i<this.squareLocs.length;i++){

            
            if(boardWithoutFallingPiece[this.squareLocs[i][0]][this.squareLocs[i][1]] != 0){
                
                reverting = true;
           
                //revert because ya can't go there
                game.board = structuredClone(boardCopy);
                this.arr = structuredClone(arrBackup);
                this.row = rowBackup;
                this.column = columnBackup;
                this.rotatePos = rotatePosBackup;

                //We don't need to store the squareLocs because the drawPiece function uses them to erase the old loc
                //this.squareLocs = savedSquareLocs

                
                break;
            }
        }
        
        game.drawPiece(this,pysudo)

        if(reverting){
            //we have to re set the board here because the drawPiece function erases all the old piece locations... including the place that it was sharing with another piece  
            game.board = boardCopy;
            game.fullRender()
        }
        
    }


}

var game = new Game();
var looper;

function setUp(){
    game.setUp();        
    looper = setInterval(gameLoop,TICKSPEED);
}
function startup(){
    //ask the user to set the difficulty



    //then setup and start game
    return;
    setUp();
}


function gameLoop(){

    //re draw the top red line
    game.ctx.fillStyle = 'red';
    game.ctx.fillRect(0,135,CANVAS.width,2)


    if(fallingPiece == null){
        //generate a new piece
        fallingPiece = game.createPiece()

        game.score += Math.floor(Math.random()*(55-45)*10)
        
    }
    else if(game.pieceCanFall(fallingPiece)){
        fallingPiece.row++;
        game.drawPiece(fallingPiece)
    }else{
        if(fallingPiece.row<=0) gameOver();  
        game.removeFullRows();
        fallingPiece = null;  
    }
    
    //render the new score to the canvas

    //clear the old score
    game.ctx.clearRect(0,0,CANVAS.width,90)
    let textString = `${game.score}`;
    let textWidth = game.ctx.measureText(textString).width;

    //draw the new score
    game.ctx.fillStyle = 'white';
    game.ctx.font = '48px sans-serif';
    game.ctx.fillText(`${game.score} `, (CANVAS.width/2) - (textWidth / 2), 65);
    
    
}

function gameOver(){
    CANVAS.style.filter = "brightness(5%);"
    gameEnded = true;
    clearInterval(looper);
  
}

function convertXYToRC(x,y){
    let c = x-5;
    let r = y-95;
    r /= BLOCKSIZE;
    c /= BLOCKSIZE;
    r -= 1;
    c -= 1;
    if(r <= 0) r = 0;
    if(c <= 0) c = 0;
    
    return [r,c];
}
function convertRCToXY(r,c){
    let x = c;
    let y = r;
    x += 1;
    y += 1;
    x *= BLOCKSIZE;
    y *= BLOCKSIZE;
    y+=95;
    x+=5;
    y-=BLOCKSIZE;
    x-=BLOCKSIZE;
    if(r<=0)y=95
    if(c<=0)x=5;
    

    return [x,y];
}


let keyPressing = false;

document.addEventListener('keyup', e => {
    
    if(gameEnded) return;
    keyPressing = false;
    if (e.code === 'Space') {
        
        if(pausing){
            pause();
            return;
        }
        game.dropBlock();

        for(let i = 0; i < GAME_LENGTH;i++){
        if(game.board[0][i] == 1){ 
            gameOver();
            return;
        }
    }
      game.removeFullRows();
      fallingPiece = null;
    }
})
document.addEventListener('keydown', e => {

    if(gameEnded || keyPressing || fallingPiece==null || pausing) return;
    
    
    if (e.key == 'ArrowLeft') {
        
        if(fallingPiece != null && fallingPiece.column != 0 && fallingPiece.canMoveSide('left')){

            fallingPiece.column--;
            game.drawPiece(fallingPiece)
        
        }
    }
    else if (e.key == 'ArrowRight') {
       // right arrow
       if(fallingPiece != null && fallingPiece.column != GAME_LENGTH-fallingPiece.arr[0].length && fallingPiece.canMoveSide('right')){
            fallingPiece.column++;
            game.drawPiece(fallingPiece)
        
    
        }
    }
    else if(e.key == 'ArrowUp'){
        fallingPiece.rotate()
    }
    keyPressing = true;
})
document.getElementById('difficultySelector').addEventListener('mouseup', e =>{
    document.getElementById('replayIcon').style.visibility = 'visible';
    document.getElementById('pauseIcon').style.visibility = 'visible';
    difficulty = parseInt(document.getElementById('difficultySelector').value);
    document.getElementById('difficultySetter').style.visibility = 'hidden';
    

    setUp();
})

let lastBadnessScore = 0
function worstPossiblePieces(notPiece=undefined){
    
    let pieces = ['T','L','RL','Z','RZ','S','I'];
    let board = structuredClone(game.board)
    let worstBadnessScore = -Infinity;
    let evaluatedPieces = {}

    

    for(let i = 0; i < pieces.length;i++){
        if(pieces[i]==notPiece)continue
        let piece = new Piece(pieces[i]);

        let bestScore = Infinity;
        for(let j = 0; j<4;j++){

            piece.row = 0;

            switch(j){
                case 0:
                    break;
                case 1:
                    piece.rotate(true)
                    break;
                case 2:
                    piece.rotate(true);
                    break;
                case 3:
                    piece.rotate(true);
                    break;    
            }
           
            for(let k = 0; k <= 9-piece.arr[0].length;k++){
                
                
                piece.row = 0;
                piece.column = k;

                

                for(let i = 0; i<piece.arr.length;i++){
                    for(let j = 0;j<piece.arr[0].length;j++){
                        if(piece.arr[i][j].length > 0) piece.squareLocs.push([i,j])
                    }
                }
                let fallingPieceTouchingBlock = () => {
            
                    let bottomSquareLocs = piece.bottomSquareLocs();
        
                    for(let i = 0;i<bottomSquareLocs.length;i++){
                        if(bottomSquareLocs[i][0]+1 > 11) return true;
                        if(board[bottomSquareLocs[i][0]+1][bottomSquareLocs[i][1]] != 0) return true;
                    }
                    return false;
                }
                
                let looping = true;
                while(looping){
                   
                    if(piece.row + piece.arr.length == GAME_HEIGHT || fallingPieceTouchingBlock()){
                        if(piece.squareLocs.length > 0){
                            //clear the board
                            for(let p = 0; p<piece.squareLocs.length;p++){
                                board[piece.squareLocs[p][0]][piece.squareLocs[p][1]] = 0;
                            }

                            //update the board
                            for(let m = 0; m<piece.arr.length;m++){
                                for(let n = 0; n<piece.arr[0].length;n++){
                                    
                                    if(piece.arr[m][n].length==0) continue;
                                    if(piece.row+m < 0 || piece.column+n < 0) continue;
                                    board[piece.row+m][piece.column+n] = piece.colour;
                                }
                            }
                            

                            
                            

                        }
                        looping = false;
                        break;
                    }else{
                        piece.row++;
                    }
                }  
                let badness = evalState(board,lastBadnessScore);
                if(badness < bestScore){
                    bestScore = badness;
                } 
                board = structuredClone(game.board)
            }
            
        }

        let piecesBestScore = bestScore
        
        
        evaluatedPieces[pieces[i]] = piecesBestScore
        worstBadnessScore = piecesBestScore;
        
        
        updateBadnessScore(pieces[i],bestScore);
        


    }
    lastBadnessScore = worstBadnessScore
    grayOut(notPiece);

    //return only the highest returnLength number of pieces

    //order the dict
    var items = Object.keys(evaluatedPieces).map((key) => { return [key, evaluatedPieces[key]] });

    items.sort(() => (Math.random() > .5) ? 1 : -1);

    items.sort(
    (first, second) => { return first[1] - second[1] }
    );

    let orderedPieces = items.map((e) => { return e[0] });
    let slicedPieces = orderedPieces.slice(-7+difficulty);

    


    return slicedPieces;
}
function highestRow(state){
    for(let i = 0; i < GAME_HEIGHT; i++){
        for(let j = 0; j < GAME_LENGTH; j++){
            if(state[i][j] != 0) return i;
        }
    }
}



function evalState(state,lastBadness=0){
    let badness = 0;
    let stateClone = structuredClone(state);
    let biggestHiToLowGap = 0;

    for(let i = GAME_HEIGHT-1;i>0;i--){
        for(let j = 0; j<GAME_LENGTH;j++){
            if(state[i][j] != 0) {
                if(i-highestRow(state) > biggestHiToLowGap) biggestHiToLowGap = i-highestRow(state)
                continue;
            }
            else{
                if(i==0) continue;
                if(state[i-1][j] != 0) badness++;
                

                
            }
        }
    }

    game.removeFullRows(true,stateClone);
    if(JSON.stringify(stateClone) != JSON.stringify(state)) badness -= 7;
    //add some badness per height
    badness += Math.floor((12-highestRow(state))/2)
    badness += Math.floor(biggestHiToLowGap/4);
    
    

    

    return  badness - lastBadness;
}



let pausing = false;
function pause(){
    pausing = !pausing
    if(pausing){
        document.getElementById('pauseIcon').src='assets/playIcon.png'
        clearInterval(looper);
    }else{
        document.getElementById('pauseIcon').src='assets/pauseIcon.png'
        looper = setInterval(gameLoop,TICKSPEED);
    }
    
}
function replay(){
    lastBadnessScore = 0
    clearInterval(looper);
    fallingPiece =  null
    gameEnded = false;
    game = new Game()
    setUp();
    document.getElementById('pauseIcon').src='assets/pauseIcon.png'
}


var badnessDict = {}
function updateBadnessScore(type,badness){
    let id = `badnessScore${type}`
    document.getElementById(id).innerText = badness
    badnessDict[type]=badness;

    updateBadnessScoreOrder()
}
function updateBadnessScoreOrder() {

    

    var items = Object.keys(badnessDict).map((key) => { return [key, badnessDict[key]] });

    items.sort(
    (first, second) => { return first[1] - second[1] }
    );

    var orderedTypes = items.map((e) => { return e[0] });
                
    

    for(let i = 0; i < orderedTypes.length;i++){
        let id = `badnessScore${orderedTypes[i]}`

        let element_to_move = document.getElementById(id).parentElement;
        parent = element_to_move.parentNode;

        switch(i){
            case 0:
                parent.insertBefore(element_to_move, parent.firstElementChild);
                break;
            case 1:
                parent.insertBefore(element_to_move, parent.firstElementChild.nextElementSibling);
                break;
            case 2:
                parent.insertBefore(element_to_move, parent.firstElementChild.nextElementSibling.nextElementSibling);
                break;
            case 3:
                parent.insertBefore(element_to_move, parent.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling);
                break;
            case 4:
                parent.insertBefore(element_to_move, parent.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling);
                break;
            case 5:
                parent.insertBefore(element_to_move, parent.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling);
                break;
            case 6:
                parent.insertBefore(element_to_move, parent.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling);
                break;
        }

    }

    
}

let grayedOutEl = null
function grayOut(type){
    
    if(grayedOutEl != null){
        grayedOutEl.style.filter = "blur(0px)"
        grayedOutEl.style.filter = "brightness(1)"
    }
    if(type == undefined) return false;


    let id = `badnessScore${type}`
    let el = document.getElementById(id).parentElement;
    el.style.filter = "blur(2px)"
    el.style.filter = "brightness(0.5)"
    grayedOutEl = el

}

