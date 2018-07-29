const auth = require('./authUsers');
const enumCard = require('./../js/enumCard');
const boards = {};
const boardList = [];


function boardAuthentication(req, res, next) {
    const body = JSON.parse(req.body);
    if(boards[body.gameName] !== undefined) {
        res.status(403).send('game name already exist');
    } else {
        next();
    }
}

function checkIfPresent(req, res, next) {
    const userName = auth.getUserInfo(req.session.id).name;
    for( let i = 0; i < boardList.length; ++i){
        let boardDetail = {registerPlayers: boardList[i].registerPlayers,
            numOfPlayers: boardList[i].numOfPlayers,  gameName: boardList[i].gameName,
            users: boardList[i].users, computer: boardList[i].computer, viewers: boardList[i].viewers};

        for(let j = 0; j < boardList[i].users.length; ++j){
            if(boardList[i].users[j] === userName){
                if(boardList[i].registerPlayers === boardList[i].numOfPlayers) {
                    res.json({
                        room4: true,
                        room3: false,
                        myIndex: j,
                        enumCard: getEnumCard(j),
                        enumColor: enumCard.enumCard.enumColor,
                        boardDetail: boardDetail
                    });
                    return;
                }else {
                    res.status(200).json({viewer: false, room3: true, boardDetail: boardDetail});
                    return;
                }
            }
        }

        for(let j = 0; j < boardList[i].viewers.length; ++j){
            if(boardList[i].viewers[j] === userName){
                if(boardList[i].registerPlayers === boardList[i].numOfPlayers) {
                    res.status(200).json({
                        room4: true,
                        room3: false,
                        myIndex: j + 4,
                        enumCard: getEnumCard(j + 4),
                        enumColor: enumCard.enumCard.enumColor,
                        viewer: true,
                        boardDetail: boardDetail
                    });
                    return;
                }else {
                    res.status(200).json({viewer: true, room3: true, boardDetail: boardDetail});
                    return;
                }
            }
        }

    }

    next();
}

function getEnumCard(uniqueId) {
    if(uniqueId === 0  || uniqueId >= 4)
        return enumCard.enumCard.enumReactPosition_0;
    else if(uniqueId === 1 )
        return enumCard.enumCard.enumReactPosition_1;
    else if(uniqueId === 2 )
        return enumCard.enumCard.enumReactPosition_2;
    return enumCard.enumCard.enumReactPosition_3;
}

function addBoardToBoardList(boardDetails) {
    boards[boardDetails.gameName] = boardDetails;
    boardList.push(boardDetails);
}

function DeleteBoardFromBoardList(boardDetails) {
    delete boards[boardDetails.gameName];
    for(let i = 0; i < boardList.length; ++i){
        if(boardDetails.gameName === boardList[i].gameName){
            boardList.splice(i, 1);
            break;
        }
    }
}


function getAllBoards() {
    return boardList;
}

function checkAvailability(req, res, next) {
    const body = JSON.parse(req.body);
    let available = false;
    let finished = false;
    if(boards[body.gameName].registerPlayers < boards[body.gameName].numOfPlayers) {
        boards[body.gameName].registerPlayers++;
        available = true;
    }
    else if(boards[body.gameName].color === "c10000") {
        finished = true;
    }
    /*for (let board in boardList) {
        const name = boardList[board].gameName;
        if (name === body.gameName) {
            if(boardList[board].registerPlayers < boardList[board].numOfPlayers) {
                boardList[board].registerPlayers++;
                available = true;
                break;
            }else
                break;
        }
    }
    */
    if(finished)
        res.status(401).send();
    if(available)
        next();
    else
        res.status(403).send();
}

function getBoardDetail(gameName) {
    /*
    for (let board in boardList) {
        const name = boardList[board].gameName;
        if (name === gameName) {
            return boardList[board];
        }
    }
    return undefined;
    */
    return boards[gameName];
}


module.exports = {checkIfPresent, DeleteBoardFromBoardList, addBoardToBoardList, boardAuthentication, getAllBoards, checkAvailability, getBoardDetail};
