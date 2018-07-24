// import HumanPlayer from './HumanPlayer'
// import SmartComputer from './smartComputer'
// import statistics from './statistics'
// import {stack} from './stack'
// import {enumCard} from './enumCard'
// import {setCards, takiPermission, takeCards, getUniqueCss} from './operations'
const HumanPlayer = require('./HumanPlayer');
const SmartComputer = require('./smartComputer');
const statistics = require('./statistics');
const {stack} = require('./stack');
const {enumCard} = require('./enumCard');
const {setCards, takiPermission, takeCards, getUniqueCss} = require('./operations');



 class Game{

    constructor(users, computer){
        this.gameCards = [];
        this.turn = 0;
        this.setPlayers(users, computer);
        this.amountOfCardsToTakeFromStock = 1;
        this.endGame = false;
        this.computerOperation = this.computerOperation.bind(this);
        this.prev = this.prev.bind(this);
        this.next = this.next.bind(this);
    }

    setPlayers(users, computer){
        this.players = [];
        for(let i = 0; i < users.length; ++i){
            this.players.push(new HumanPlayer(users[i], i));
        }
        if (computer)
            this.players.push(new SmartComputer(users.length));
        this.computer = computer;
    }
    
    changeTurn(promote, dropAnm) {
        this.players[this.turn].increasePlayerTurns();
        this.players[this.turn].calculateAVG();
        this.players[this.turn].resetPlayerClock();
        this.updateManagement(dropAnm);
        this.turn = (this.turn + promote) % this.players.length;
        this.stateManagement.playerManagement[this.turn].direction = [];
        this.stateManagement.playerManagement[this.turn].error = [];
        this.gameStatistics.updateStatistics(this.turn);
    }

    calcAmountCardsToTake(card) {
        if (card.getSign() === enumCard.enumTypes.TWO_PLUS) {
            if (this.amountOfCardsToTakeFromStock % 2 === 0)
                this.amountOfCardsToTakeFromStock += 2;
            else
                this.amountOfCardsToTakeFromStock = 2;
        } else
            this.amountOfCardsToTakeFromStock = 1;
    }

    partition() {
        let gameStartCard = stack.getValidOpenCard();
        setCards(this.gameCards, gameStartCard);
        this.stateManagement.openCard = {image: gameStartCard[0].uniqueCardImage, id: gameStartCard[0].id};
        this.players.forEach(p => p.setCards(stack.getCards(8), this.players.length));
    }

    colorPicked(pickedColor, uniqueId) {
        this.stateManagement.playerManagement[uniqueId].direction = [];
        //this.stateManagement.playerManagement[uniqueId].openCardAnm = false; //TODO: check after all changes, if neccessery
        this.stateManagement.playerManagement[uniqueId].pickColorVidibility = "hidden";
        this.gameCards[this.gameCards.length - 1].setColor(pickedColor);
        this.gameCards[this.gameCards.length - 1].setImage(getUniqueCss(Object.keys(enumCard.enumColor)[pickedColor],
            Object.keys(enumCard.enumTypes)[enumCard.enumTypes.CHANGE_COLOR], '_'));
        this.stateManagement.openCard =
            {image: this.gameCards[this.gameCards.length - 1].uniqueCardImage, id: this.gameCards[this.gameCards.length - 1].id};
        this.changeTurn(enumCard.enumResult.NEXT_TURN, false);
        setTimeout(this.computerOperation, 2200);
    }

    setDrop(id, uniqueID){
/*        if(!this.stateManagement.playerManagement[uniqueID].openCardAnm &&
            ! this.stateManagement.playerManagement[uniqueID].stackCards.length > 0){
            let card = this.players[this.turn].getCard(id);
            if (card !== undefined) {
                this.dropValidation(card);
            }else
                this.renderError(enumCard.enumErrors.PULL_CARD_NOT_IN_TURN, uniqueID);
        }*/
        let card = this.players[this.turn].getCard(id);
        if (card !== undefined) {
            this.dropValidation(card);
        }else
            this.renderError(enumCard.enumErrors.PULL_CARD_NOT_IN_TURN, uniqueID);
    }

    dropValidation(card) {
        if (takiPermission(this.players[this.turn], card) && card.doValidation(this.gameCards[this.gameCards.length - 1])) {
            let promote = this.players[this.turn].doOperation(card, this.gameCards[this.gameCards.length - 1]);
            this.gameCards[this.gameCards.length - 1].setActive(false);
            this.gameCards.push(card);
            this.stateManagement.openCard = {image: card.uniqueCardImage, id: card.id};
            this.calcAmountCardsToTake(card);
            if (this.players[this.turn].getAmountOfCards() === 0 && card.getSign() !== enumCard.enumTypes.PLUS) {
                this.runOutOfCards(Object.keys(enumCard.enumPlayer)[this.turn]);
            }else {
                this.stateManagement.playerManagement.forEach(p => p.openCardAnm = true);
                if (promote !== enumCard.enumResult.CONTINUE_TURN)
                    this.changeTurn(promote, true);
                else{
                    this.updateManagement(true);
                }
            }
            setTimeout(this.computerOperation, 2200);
        }else{
           // this.stateManagement.openCardAnm = false;//TODO: check after all changes, if neccessery
            if(!takiPermission(this.players[this.turn], card))
                this.renderError(enumCard.enumErrors.CARD_NOT_IN_TAKI, this.turn);
            else
                this.renderError(enumCard.enumErrors.CARD_NOT_AUTHORIZED, this.turn);
        }
    }

    refreshStockAndOpenCards() {
        let lastCard = this.gameCards.pop();
        stack.initializeStock(this.gameCards);
        this.gameCards = undefined;
        this.gameCards = [];
        this.gameCards.push(lastCard);
        this.stateManagement.openCard = {image: lastCard.uniqueCardImage, id: lastCard.id};
        this.stateManagement.stackImage = stack.getStackImage();
    }

    pullCard(uniqueID){
/*        if(!this.stateManagement.playerManagement[uniqueID].openCardAnm &&
            ! this.stateManagement.playerManagement[uniqueID].stackCards.length > 0) {
            if (this.turn === uniqueID)
                this.pullCardValidation(this.players[this.turn]);
            else
                this.renderError(enumCard.enumErrors.PULL_CARD_NOT_IN_TURN, uniqueID);
        }*/
        if (this.players[this.turn].id === uniqueID)
            this.pullCardValidation(this.players[this.turn]);
        else
            this.renderError(enumCard.enumErrors.PULL_CARD_NOT_IN_TURN, uniqueID);
    }

    pullCardValidation(player) {
        this.stateManagement.playerManagement[this.turn].direction = [];
        //this.stateManagement.openCardAnm = false;//TODO: check after all changes, if neccessery
        if (player === this.players[this.turn] && player.pullApproval(this.gameCards[this.gameCards.length - 1])) {
            this.stateManagement.stackImage = stack.getStackImage();
            this.stateManagement.playerManagement.forEach(p => p.pullCardAnimation = true);
            this.gameCards[this.gameCards.length - 1].setActive(false);
            player.setTakiMode(undefined);
            let cardsFromStock = stack.getCards(this.amountOfCardsToTakeFromStock);
            if (stack.getLength() <= this.amountOfCardsToTakeFromStock) {
                this.refreshStockAndOpenCards();
            }
            this.amountOfCardsToTakeFromStock = 1;
           // this.stateManagement.playerManagement.foreach(p => p.pullCardAnimation = true);
            player.pullCardFromStock(cardsFromStock);
            if(this.computer)
                this.stateManagement.playerManagement[this.players.length - 1].stackCards.splice(0, 1);
            this.changeTurn(enumCard.enumResult.NEXT_TURN, false);
            setTimeout(this.computerOperation, 2200);
        }
        else{
            this.renderError(enumCard.enumErrors.PULL_CARD_WITH_AVAILABLE_CARD, this.turn);
        }
    }

    computerOperation() {
        if (!this.endGame && this.players[this.turn].isComputer()) {
            this.stateManagement.playerManagement.forEach(p => p.pullCardAnimation = true);
            if (this.players[this.turn].colorToPick()) {
                let color = this.players[this.turn].getColor();
                this.colorPicked(color,this.turn);
            } else {
                let card = this.players[this.turn].pickCard(this.gameCards[this.gameCards.length - 1]);
                if (card === undefined)
                    this.pullCardValidation(this.players[this.turn]);
                else {
                    this.dropValidation(card);
                }
            }
        }
    }

    getGameCards() {
        let allCards = [];
        for(let i=0; i< this.players.length; ++i){
            takeCards(allCards, this.players[i].getAllCards());
        }
        takeCards(allCards, this.gameCards);
        return allCards;
    }

    initialGameAndStatistics() {
        this.turn = 0; //TODO: change that
        this.partition();
        this.gameStatistics = new statistics(this.players);
        this.gameStatistics.setManager(this.stateManagement);
        this.gameStatistics.updateStatistics(this.turn);
        this.stateManagement.stackImage = stack.getStackImage();
        this.stateManagement.playerManagement.forEach(p => p.pickColorVidibility = "hidden");
    }

    startGame() {
        stack.setGame();
        this.initialGameAndStatistics();
        setTimeout(this.computerOperation, 2200);
    }

    startTournament(){
        this.tournament = true;
        this.gameNumber = 0;
        this.startGame();
    }

    restartTournamentGame(){
        //this.stateManagement.openCardAnm = false;//TODO: check after all changes, if neccessery
        this.players.forEach(player => {
            player.score = 0;
        });
        this.tournament = true;
        this.gameNumber = 0;
        this.renderError();
        this.restartGame();
    }

    restartGame() {
        //this.stateManagement.openCardAnm = false;//TODO: check after all changes, if neccessery
        this.endGame = false;
        let allCards;
        allCards = this.getGameCards();
        let playerAverageTurnTime = [];
        for(let i=0;i< this.players.length;++i)
            playerAverageTurnTime[i] = this.players[i].getAverageTimePlayed();
        let playerTurn = [];
        for(let i=0; i< this.players.length;++i)
            playerTurn[i] = this.players[i].getTurnsPlayed();

        this.players.forEach(p => p.clear());
        //this.gameCards = undefined;//TODO: check after all changes, if neccessery
        this.gameCards = [];
        stack.initializeStock(allCards);
        this.gameStatistics = undefined;
        for(let i=0; i< this.players.length;++i){
            this.players[i].setAverageTimePlayed(playerAverageTurnTime[i]);
            this.players[i].setTurnsPlayed(playerTurn[i]);
        }

        // this.renderError();//TODO:: need to fix for able to restart
        for(let i = 0; i < this.players.length; i++)
            this.renderError(undefined,i);
        this.initialGameAndStatistics();
        setTimeout(this.computerOperation, 2200);
    }


   /* tournamentGameEnd(message) {
        this.stateManagement.stateManagement.forEach(p => p.error = undefined);
        let score = this.players[(this.turn + 1) % this.players.length].calcScore();
        this.players[this.turn].updateTournamentScore(score);
        this.gameNumber++;
        if(this.gameNumber === 3){
            this.endTournament(message);
        }else
            this.stateManagement.endGameInTournament(message);
    }

    endTournament(message){
        let messages = [];
        messages.push(message);
        if(this.players[this.turn].getScore() > this.players[(this.turn + 1) % this.players.length].score) {
            messages.push("The winner is: " + this.players[this.turn].name);
            messages.push("Winner's score: " + this.players[this.turn].getScore());
            messages.push("Loser's score: " + this.players[(this.turn + 1) % this.players.length].getScore());
        }
        else{
            messages.push("The winner is: " + this.players[(this.turn + 1) % this.players.length].name);
            messages.push("Winner's score: " + this.players[(this.turn + 1) % this.players.length].getScore());
            messages.push("Loser's score: " + this.players[this.turn].getScore());
        }
        this.tournament = false;
        this.stateManagement.endTournament(messages);
    }
*/
    prev(uniqueId){
        let playerManagement = this.stateManagement.playerManagement[uniqueId];
        if(playerManagement.turnIndex -1 >= 0) {
            playerManagement.savesStates[playerManagement.turnIndex].playerManagement[uniqueId].error = [];
            playerManagement.turnIndex--;
        }else{
            playerManagement.message = [];
            playerManagement.savesStates[playerManagement.turnIndex].playerManagement[uniqueId].error = "start game window";
        }
    }

    next(uniqueId){
        let playerManagement = this.stateManagement.playerManagement[uniqueId];
        if(playerManagement.turnIndex + 1 <
            playerManagement.savesStates.length) {
            playerManagement.savesStates[playerManagement.turnIndex].playerManagement[uniqueId].error = [];
            playerManagement.turnIndex++;
        }else {
            playerManagement.message = [];
            playerManagement.savesStates[playerManagement.turnIndex].playerManagement[uniqueId].error = "end game window";
        }
    }

    runOutOfCards(message){
        let outs = 0;
        this.players.forEach(p => p.allCards.length === 0? outs++: outs);
        this.stateManagement.playerManagement[this.turn].gameState = "stopGaming";
        if( outs + 1 === this.players.length)
            this.endGameMode();
        else if (outs === 1)
            this.winMessage = message;
        this.players.splice(this.turn, 1);
    }

    endGameMode() {
        this.stateManagement.playerManagement.forEach(p => p.savesStates.push(this.stateManagement.clone()));//TODO:: bring it back
        let newMsg = [];
        newMsg[0] = this.winMessage + " win!";
/*
        if(this.tournament)
            this.tournamentGameEnd(newMsg);
        else {
            if(this.quitMode === undefined) {
                this.savesStates.push(this.stateManagement.clone());
            }
            this.turnIndex = this.savesStates.length - 1;
            this.endGame = true;
            this.stateManagement.endGame(newMsg);
        }
*/
        this.endGame = true;
        this.stateManagement.endGame(newMsg);
    }

/*    quitGame() {
        if(this.turn === this.players[0].turn) {
            this.quitMode = true;
/!*            if (this.tournament) {
                this.turn = (this.turn + 1) % this.players.length;
                this.tournamentGameEnd("Player quit! Computer Win!");
            }
            else {
                this.endGameMode("PLAYER quit! COMPUTER");
            }*!/
        this.endGameMode("PLAYER quit! COMPUTER");
        }
    }*/

    setManager(stateManagement) {
        this.stateManagement = stateManagement;
        this.players.forEach(p => p.setManager(stateManagement));
    }

    updateManagement(dropAnm) {
        this.stateManagement.playerManagement.forEach(p => p.openCardAnm = dropAnm);
        this.stateManagement.playerManagement[this.turn].error = [];
        if (this.stateManagement.playerManagement[this.turn].stackCards.length === 0) {
            let cloneState = this.stateManagement.clone();
            this.stateManagement.playerManagement.forEach(p => p.savesStates.push(cloneState));//TODO:: bring it back
        }else
            console.log("line 360 in game js");
    }

/*
    viewerAnimationCardEnd(uniqueID){
        this.stateManagement.viewerManagement[uniqueID - 4].stackCards.length = 0;
    }
*/

    animationCardEnd(uniqueID){
/*        this.stateManagement.playerManagement[uniqueID].stackCards.splice(0, 1);
        /!*if(this.stateManagement.playerManagement[uniqueID].stackCards.length === 0 &&
            !this.stateManagement.playerManagement[uniqueID].renderAnimationEnd)
            this.renderEndAnimation(uniqueID);*!/
      if(this.stateManagement.playerManagement[uniqueID].stackCards.length === 0)
          this.renderEndAnimation(uniqueID);*/
      this.stateManagement.playerManagement[uniqueID].stackCards.length = 0;
      this.renderEndAnimation(uniqueID);
    }

    renderEndAnimation(uniqueID){
        this.stateManagement.playerManagement[uniqueID].message = undefined;
        this.players[uniqueID].updateCardsToAdd();
        if(this.computer && uniqueID === 0) {
             this.stateManagement.playerManagement[this.players.length - 1].stackCards = [];
             this.players[this.players.length - 1].updateCardsToAdd();
        }
        /*if(!this.tournament)
            this.savesStates.push(this.stateManagement.clone());*/
        if(this.gameStatistics.turnsCounter ===0)
            this.stateManagement.playerManagement[uniqueID].savesStates.push(this.stateManagement.clone());//TODO:: bring it back
        else {
            let cloneState = this.stateManagement.clone();
            this.stateManagement.playerManagement.forEach(p => p.savesStates.push(cloneState));//TODO:: bring it back
        }// this.stateManagement.playerManagement[uniqueID].renderAnimationEnd = true;
    } // TODO:: understand for what this two use for

    renderError(error, playerID){
        //this.stateManagement.openCardAnm = false;//TODO: check after all changes, if neccessery
        //this.stateManagement.pullCardAnimation = false;//TODO: check after all changes, if neccessery
        this.stateManagement.playerManagement[playerID].error = error;
        this.stateManagement.playerManagement[playerID].direction = [];
    }

    /*
    dropRender(){
        this.stateManagement.openCardAnm = true;
        this.stateManagement.pullCardAnimation = false;
        this.stateManagement.error = undefined;
        this.stateManagement.direction = undefined;
    }

    pullCardRender(uniqueID){
        this.stateManagement.openCardAnm = false;
        this.stateManagement.pullCardAnimation = true;
        this.stateManagement.error = undefined;
        this.stateManagement.direction = uniqueID;
    }

    changeColorRender(uniqueID){
        this.stateManagement.openCardAnm = false;
        this.stateManagement.pullCardAnimation = false;
        this.stateManagement.error = undefined;
        this.stateManagement.direction = uniqueID;
//        this.stateManagement.pickColorVidibility = "Active";

    }
    */
}

module.exports = Game;