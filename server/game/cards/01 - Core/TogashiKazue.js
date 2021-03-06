const _ = require('underscore');
const DrawCard = require('../../drawcard.js');
const PlayAttachmentAction = require('../../playattachmentaction.js');

class PlayTogashiKazueAsAttachment extends PlayAttachmentAction {
    constructor(originalCard, owner, cardData) {
        super();
        this.clone = new DrawCard(owner, cardData);
        this.clone.type = 'attachment';
        this.originalCard = originalCard;
        this.title = 'Play Togashi Kazue as an attachment';
    }

    meetsRequirements(context) {
        return (
            context.game.currentPhase !== 'dynasty' &&
            this.originalCard.location === 'hand' &&
            context.player.canPutIntoPlay(this.originalCard) &&
            this.originalCard.canPlay()
        );
    }
    
    canResolveTargets(context) {
        let clonedContext = _.clone(context);
        clonedContext.source = this.clone;
        return super.canResolveTargets(clonedContext);
    }
    
    resolveTargets(context, results = []) {
        context.source = this.clone;
        return super.resolveTargets(context, results);
    }
    
    executeHandler(context) {
        context.source = this.originalCard;
        context.source.type = 'attachment';
        super.executeHandler(context);
    }
}

class TogashiKazue extends DrawCard {
    setupCardAbilities() {
        this.abilities.playActions.push(new PlayTogashiKazueAsAttachment(this, this.owner, this.cardData));
        this.action({
            title: 'Steal a fate',
            condition: () => this.game.currentConflict && this.game.currentConflict.isParticipating(this.parent) && this.type === 'attachment',
            printedAbility: false,
            target: {
                activePromptTitle: 'Choose a character',
                cardType: 'character',
                cardCondition: card => this.game.currentConflict.isParticipating(card) && card.fate > 0 && card !== this.parent
            },
            handler: context => {
                context.target.modifyFate(-1);
                this.parent.modifyFate(1);
                this.game.addMessage('{0} uses {1} to steal a fate from {2} and place it on {3}', this.controller, this, context.target, this.parent);
            }
        });
    }

    leavesPlay() {
        this.type = 'character';
        super.leavesPlay();
    }
}

TogashiKazue.id = 'togashi-kazue';

module.exports = TogashiKazue;
