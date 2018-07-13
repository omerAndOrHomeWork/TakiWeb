import React from 'react';
import ReactDOM from 'react-dom';
import {enumCard} from './../../js/enumCard'
import CardReact from './cardReact.jsx';

export default class StackReact extends React.Component {
    constructor(args) {
        super(...args);
        this.handleClick = this.handleClick.bind(this);
        this.dragStart = this.dragStart.bind(this);
        this.eachCard = this.eachCard.bind(this);
    }

    eachCard(card, i) {
        return(
            <CardReact humanAnimation = {card.humanAnimation} pullCardAnimation ={true} key = {i + 400}/>
        );
    }

    render() {
        return(
            <div onClick={this.handleClick} id = {"stockCards"}>
                <img draggable={false} src={this.props.img}/>
                {this.props.cards.map(this.eachCard)}
            </div>
        );
    }

    handleClick(ev) {
        if(this.props.interactive === false)
            return false;
        let changeColorReact = this.props.pickColorRef.current;
        if (changeColorReact.props.visible === "visible")
            return false;
/*        if (!this.props.game.players[this.props.game.turn].isComputer())
            this.props.game.pullCardValidation(this.props.game.players[this.props.game.turn]);
        else{
            this.props.game.renderError(enumCard.enumErrors.PULL_CARD_NOT_IN_TURN);
        }*/
        let massage = {uniqueId: this.props.uniqueId,
            gameName: this.props.gameName};
        return fetch('/game/pullCard', {
            method: 'POST',
            body: JSON.stringify(massage),
            credentials: 'include'
        })

    }

    dragStart() {
         return false;
    }
}