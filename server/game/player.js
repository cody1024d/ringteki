const _ = require('underscore');

class Player {
    constructor(player) {
        this.drawCards = [];
        this.plotCards = [];
        this.drawDeck = [];

        this.id = player.id.slice(2);
        this.deck = player.deck;

        _.each(player.deck.drawCards, card => {
            for(var i = 0; i < card.count; i++) {
                this.drawCards.push(card.card);
            }
        });

        _.each(player.deck.plotCards, card => {
            for(var i = 0; i < card.count; i++) {
                this.plotCards.push(card.card);
            }
        });

        this.takenMulligan = false;
    }

    initDrawDeck() {
        this.drawDeck = _.shuffle(this.drawCards);
        this.hand = _.first(this.drawDeck, 7);
        this.drawDeck = _.rest(this.drawDeck, 7);
    }

    initialise() {
        this.initDrawDeck();

        this.gold = 0;
        this.claim = 0;
        this.power = 0;
        this.totalPower = 0;
        this.reserve = 0;
        this.readyToStart = false;
        this.cardsInPlay = [];
        this.limitedPlayed = false;

        this.menuTitle = 'Keep Starting Hand?';

        this.buttons = [
            { command: 'keep', text: 'Keep Hand' },
            { command: 'mulligan', text: 'Mulligan' }
        ];
    }

    startGame() {
        if(!this.readyToStart) {
            return;
        }

        this.gold = 8;
        this.phase = 'setup';

        this.buttons = [
            { command: 'setup', text: 'Done' }
        ];

        this.menuTitle = 'Select setup cards';
    }

    mulligan() {
        if(this.takenMulligan) {
            return;
        }

        this.initDrawDeck();
        this.takenMulligan = true;

        this.buttons = [];
        this.menuTitle = 'Waiting for opponent to keep hand or mulligan';

        this.readyToStart = true;
    }

    keep() {
        this.readyToStart = true;

        this.buttons = [];
        this.menuTitle = 'Waiting for opponent to keep hand or mulligan';
    }

    canPlayCard(card) {
        if(this.phase !== 'setup') {
            return false;
        }

        if(!_.any(this.hand, handCard => {
            return handCard.code === card.code;
        })) {
            return false;
        }

        if(card.cost > this.gold && !this.isDuplicateInPlay(card)) {
            return false;
        }

        if(this.limitedPlayed && this.isLimited(card)) {
            return false;
        }

        if(this.phase === 'setup') {
            if(card.type_code === 'event') {
                return false;
            }

            if(card.type_code === 'attachment') {
                var attachments = _.filter(this.cardsInPlay, playCard => {
                    return playCard.card.type_code === 'attachment';
                }).length;

                var characters = _.filter(this.cardsInPlay, playCard => {
                    return playCard.card.type_code === 'character';
                }).length;

                if((attachments === 0 && characters === 0) || attachments >= characters) {
                    return false;
                }
            }
        }

        return true;
    }

    isDuplicateInPlay(card) {
        if(!card.is_unique) {
            return false;
        }

        return _.any(this.cardsInPlay, playCard => {
            return playCard.card.code === card.code;
        });
    }

    isLimited(card) {
        return card.text.indexOf('Limited.') !== -1;
    }

    playCard(card) {
        if(!this.canPlayCard(card)) {
            return;
        }

        if(!this.isDuplicateInPlay(card)) {
            this.gold -= card.cost;
        }

        this.cardsInPlay.push({ facedown: true, card: card });

        if(this.isLimited(card)) {
            this.limitedPlayed = true;
        }

        var removed = false;

        this.hand = _.reject(this.hand, handCard => {
            if(handCard.code === card.code && !removed) {
                removed = true;

                return true;
            }
 
            return false;
        });
    }

    getState(isActivePlayer) {
        return {
            id: this.id,
            faction: this.deck.faction,
            agenda: this.deck.agenda,
            numDrawCards: this.drawDeck.length,
            hand: isActivePlayer ? this.hand : _.map(this.hand, () => {
                return {};
            }),
            buttons: isActivePlayer ? this.buttons : undefined,
            menuTitle: isActivePlayer ? this.menuTitle : undefined,
            gold: !isActivePlayer && this.phase === 'setup' ? 0 : this.gold,
            totalPower: this.totalPower,
            reserve: this.reserve,
            claim: this.claim,
            phase: this.phase,
            cardsInPlay: this.cardsInPlay
        };
    }
}

module.exports = Player;
