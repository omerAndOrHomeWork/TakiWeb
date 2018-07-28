import css from '../../css/cards.css'
import React from 'react';
import ReactDOM from 'react-dom';
import Statistics from './statisticsReact.jsx'
import OpenCards from './openCardsReact.jsx'
import Stack from './stackReact.jsx'
import CardsHolder from './cardsHolderReact.jsx'
import PickColor from './pickColor.jsx'
import Clock from './clockReact.jsx'
import {enumCard} from "../../js/enumCard";

export default class BoardReact extends React.Component {
    constructor(args) {
        super(...args);
        this.pickColorHolder =  React.createRef();
        this.eachPlayer = this.eachPlayer.bind(this);
        this.eachPlayerInEndGame = this.eachPlayerInEndGame.bind(this);
        this.eachPlayerInViewer = this.eachPlayerInViewer.bind(this);
        this.gameRender = this.gameRender.bind(this);
        this.firstRender = this.firstRender.bind(this);
        this.getGameContent = this.getGameContent.bind(this);
        // this.getViewerDetails = this.getViewerDetails.bind(this);
        this.importAll = this.importAll.bind(this);
        this.next = this.next.bind(this);
        this.prev = this.prev.bind(this);
        this.viewerLogOut = this.viewerLogOut.bind(this);
        this.state = {
            manager: undefined,
        };
        this.images = {};
    }

    componentDidMount(){
/*        if(this.props.viewer)
            this.getViewerDetails();
        else
            this.getGameContent();*/
        this.getGameContent();
        this.images = Object.assign((this.importAll(require.context('./../../Images/blue', false, /\.(png|jpe?g|svg)$/))),
            (this.importAll(require.context('./../../Images/green', false, /\.(png|jpe?g|svg)$/))),
            (this.importAll(require.context('./../../Images/other', false, /\.(png|jpe?g|svg)$/))),
            (this.importAll(require.context('./../../Images/red', false, /\.(png|jpe?g|svg)$/))),
            (this.importAll(require.context('./../../Images/yellow', false, /\.(png|jpe?g|svg)$/))));
    }

    importAll(r) {
        let images = {};
        r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
        return images;
    }

    render(){
        if (this.state.manager === undefined)
            return this.firstRender();
        else if(this.state.manager.player.gameState ===  "endGame") {
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
            }
            if(this.props.viewer)
                return this.endGameViewerRender();
            return this.endGameRender();
        }else if(this.props.viewer)
            return this.renderViewer();
        else if(this.state.manager.player.gameState ===  "stopGaming")
            return this.playerEndRender();
        return this.gameRender();
    }

    firstRender(){
        return(
            <div className="container-fluid">
            </div>
        );
    }

    endGameRender(){
        return(
            <div>
                <div id = {"endGameMode"}>
                    <div id ="message">{this.state.manager.player.message.map(this.eachMassage)}</div>
                    <button id={"endGame"} onClick={this.props.exitGame}>Back To Lobby</button>
                </div>
                <div className="container-fluid">
                    <Statistics msg= {this.state.manager.player.statisticsMassages}/>
                    <OpenCards card =  {this.state.manager.player.openCard} images = {this.images} open = {true}/>
                    {this.state.manager.playersCards.map(this.eachPlayerInEndGame)}
                    <PickColor interactive = {false} visible = {this.state.manager.player.pickColorVidibility} ref= {this.pickColorHolder}/>
                    <Stack cards = {[]} images = {this.images} interactive = {false} img = {this.state.manager.stackImage} pickColorRef = {this.pickColorHolder} />
                </div>
                <div>
                    <p id ="errors">{this.state.manager.player.error}</p>
                    <button id={"next"} onClick={this.next}>Next</button>
                    <button id={"prev"} onClick={this.prev}>Prev</button>
                </div>
            </div>
        );
    }

    gameRender(){
        return(
            <div className="container-fluid">
                <p id ="errors">{this.state.manager.player.error}</p>
                <p id ="directions">{this.state.manager.player.direction}</p>
                {<Clock/>}
                <Statistics msg= {this.state.manager.player.statisticsMassages}/>
                <OpenCards setPull = {this.getGameContent} pullCardAnm ={this.state.manager.player.stackCards.length !== 0} uniqueID={this.props.uniqueID} gameName={this.props.gameName} images = {this.images} card = {this.state.manager.player.openCard} open = {true}/>
                {this.state.manager.playersCards.map(this.eachPlayer)}
                <PickColor uniqueID={this.props.uniqueID} gameName={this.props.gameName} interactive = {true} visible = {this.state.manager.player.pickColorVidibility} ref= {this.pickColorHolder}/>
                <Stack setPull = {this.getGameContent} openCardAnm = {this.state.manager.player.dropCard !== undefined} enumReactPosition={this.props.enumReactPosition} uniqueID={this.props.uniqueID} gameName={this.props.gameName} images = {this.images} cards ={this.state.manager.player.stackCards} interactive = {true} img = {this.state.manager.stackImage} pickColorRef = {this.pickColorHolder}/>
            </div>
        );
    }

    playerEndRender() {
        return(
            <div className="container-fluid">
                {<Clock/>}
                <Statistics msg= {this.state.manager.player.statisticsMassages}/>
                <OpenCards setPull = {this.getGameContent} uniqueID={this.props.uniqueID} gameName={this.props.gameName} pullCardAnm ={this.state.manager.player.stackCards.length !== 0} images = {this.images} card = {this.state.manager.player.openCard} open = {true}/>
                {this.state.manager.playersCards.map(this.eachPlayer)}
                <PickColor  interactive = {false} visible = {this.state.manager.player.pickColorVidibility} ref= {this.pickColorHolder}/>
                <Stack setPull = {this.getGameContent} openCardAnm = {this.state.manager.player.dropCard !== undefined} enumReactPosition={this.props.enumReactPosition} uniqueID={this.props.uniqueID} gameName={this.props.gameName} images = {this.images} cards ={this.state.manager.player.stackCards} interactive = {false} img = {this.state.manager.stackImage} pickColorRef = {this.pickColorHolder}/>
            </div>
        );
    }

    renderViewer() {
        return(
            <div className="container-fluid">
                {<Clock/>}
                <Statistics msg= {this.state.manager.player.statisticsMassages}/>
                <OpenCards setPull = {this.getGameContent} uniqueID={this.props.uniqueID} gameName={this.props.gameName} pullCardAnm ={this.state.manager.player.stackCards.length !== 0} images = {this.images} card = {this.state.manager.player.openCard} open = {true}/>
                {this.state.manager.playersCards.map(this.eachPlayerInViewer)}
                <PickColor  interactive = {false} visible = {this.state.manager.player.pickColorVidibility} ref= {this.pickColorHolder}/>
                <Stack setPull = {this.getGameContent} uniqueID={this.props.uniqueID} openCardAnm = {this.state.manager.player.dropCard !== undefined} enumReactPosition={this.props.enumReactPosition} gameName={this.props.gameName} images = {this.images} cards ={this.state.manager.player.stackCards} interactive = {false} img = {this.state.manager.stackImage} pickColorRef = {this.pickColorHolder}/>
                <button id="Quit_Game" type="button" style={{visibility : "visible"}} onClick={this.viewerLogOut}>Logout</button>
            </div>
        );
    }

    eachMassage(msg, i) {
        return(
            <p key={i + 200}>{msg}</p>
        );
    }

    endGameViewerRender(){
        return(
            <div>
                <div id = {"endGameMode"}>
                    <div id ="message">{this.state.manager.player.message.map(this.eachMassage)}</div>
                    <button id={"endGame"} onClick={this.props.exitGame}>Back To Lobby</button>
                </div>
                <div className="container-fluid">
                    <Statistics msg= {this.state.manager.player.statisticsMassages}/>
                    <OpenCards card =  {this.state.manager.player.openCard} images = {this.images} open = {true}/>
                    {this.state.manager.playersCards.map(this.eachPlayerInEndGame)}
                    <PickColor interactive = {false} visible = {this.state.manager.player.pickColorVidibility} ref= {this.pickColorHolder}/>
                    <Stack cards = {[]} images = {this.images} interactive = {false} img = {this.state.manager.stackImage} pickColorRef = {this.pickColorHolder} />
                </div>
            </div>
        );
    }

    eachPlayerInViewer(cards, i){
        if(i === 0) {
            return (
                <CardsHolder key={555 + i} cards={cards} pickColorRef={this.pickColorHolder}
                             isDraggable={false}
                             images={this.images}
                             open={true}
                             cssId={Object.keys(this.props.enumReactPosition)[i]}
                             uniqueID={this.props.uniqueID}
                             gameName={this.props.gameName}
                             dropCard={this.state.manager.player.dropCard}
                             enumReactPosition={this.props.enumReactPosition}
                             setPull={this.getGameContent}
                />
            );
        }else{
            return (
                <CardsHolder key={555 + i} cards={cards} pickColorRef={this.pickColorHolder}
                             isDraggable={false}
                             images={this.images}
                             open={true}
                             cssId={Object.keys(this.props.enumReactPosition)[i]}
                             uniqueID={this.props.uniqueID}
                             gameName={this.props.gameName}
                />
            );

        }
    }

/*    myCards(cards, i){

    }

    rivalCards(cards, i){

    }*/

    eachPlayer(cards, i) {
        if(i === this.props.uniqueID) {
            return (
                <CardsHolder key={555 + i} cards={cards} pickColorRef={this.pickColorHolder}
                             isDraggable={i === this.props.uniqueID}
                             images={this.images}
                             open={i === this.props.uniqueID}
                             cssId={Object.keys(this.props.enumReactPosition)[i]}
                             uniqueID={this.props.uniqueID}
                             gameName={this.props.gameName}
                             dropCard={this.state.manager.player.dropCard}
                             enumReactPosition={this.props.enumReactPosition}
                             setPull={this.getGameContent}
                />
            );
        }else{
            return (
                <CardsHolder key={555 + i} cards={cards} pickColorRef={this.pickColorHolder}
                             isDraggable={i === this.props.uniqueID}
                             images={this.images}
                             open={i === this.props.uniqueID}
                             cssId={Object.keys(this.props.enumReactPosition)[i]}
                             uniqueID={this.props.uniqueID}
                             gameName={this.props.gameName}
                />
            );
        }
    }

    eachPlayerInEndGame(cards, i) {
        return (
            <CardsHolder key = {555 + i} cards={cards} pickColorRef={this.pickColorHolder}
                         isDraggable={false}
                         images = {this.images}
                         open={true}
                         cssId={Object.keys(this.props.enumReactPosition)[i]}
                         uniqueID = {this.props.uniqueID}
                         gameName={this.props.gameName}
            />
        );
    }

    getGameContent() {
        let massage = {uniqueID: this.props.uniqueID, gameName: this.props.gameName};
        return fetch('/game/pull', {
            method: 'POST',
            body: JSON.stringify(massage),
            credentials: 'include'
        })
        .then((response) => {
            if (!response.ok){
                this.setState(()=> ({errMessage: response.statusText}));
            }
            // this.timeoutId = setTimeout(this.getGameContent, 200);
            return response.json();
        })
        .then(content => {
            if (content.manager.player.dropCard === undefined &&
                content.manager.player.stackCards.length === 0)
                this.timeoutId = setTimeout(this.getGameContent, 200);
            else
                console.log("rf");
            this.setState(()=> ({manager: content.manager}));
        })
    }

/*    getViewerDetails() {
        let massage = {gameName: this.props.gameName};
        return fetch('/game/pullViewerDetails', {
            method: 'POST',
            body: JSON.stringify(massage),
            credentials: 'include'
        })
            .then((response) => {
                if (!response.ok){
                    this.setState(()=> ({errMessage: response.statusText}));
                }
                this.timeoutId = setTimeout(this.getViewerDetails, 200);
                return response.json();
            })
            .then(content => {
                this.setState(()=> ({manager: content.manager}));
            })
    }*/

    next(){
        let massage = {uniqueID: this.props.uniqueID, gameName: this.props.gameName};
        return fetch('/game/next', {
            method: 'POST',
            body: JSON.stringify(massage),
            credentials: 'include'
        })
        .then((response) => {
            if (!response.ok){
                this.setState(()=> ({errMessage: response.statusText}));
            }
            return response.json();
        })
        .then(content => {
            this.setState(()=> ({manager: content.manager}));
        })
    }
    prev(){
        let massage = {uniqueID: this.props.uniqueID, gameName: this.props.gameName};
        return fetch('/game/prev', {
            method: 'POST',
            body: JSON.stringify(massage),
            credentials: 'include'
        })
        .then((response) => {
            if (!response.ok){
                this.setState(()=> ({errMessage: response.statusText}));
            }
            return response.json();
        })
        .then(content => {
            this.setState(()=> ({manager: content.manager}));
        })
    }
//  const uniqueId = req.body
//{error: board.stateManagment.errors[uniqueId], }
    viewerLogOut() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.props.exitGame();
    }
}