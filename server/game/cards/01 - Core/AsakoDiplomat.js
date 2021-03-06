const DrawCard = require('../../drawcard.js');

class AsakoDiplomat extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Honor or dishonor a character',
            when: {
                afterConflict: event => event.conflict.winner === this.controller && event.conflict.isParticipating(this)
            },
            target: {
                activePromptTitle: 'Choose a character to honor or dishonor',
                cardType: 'character',
                cardCondition: card => card.location === 'play area'
            },
            handler: context => {
                if(!context.target.allowGameAction('dishonor')) {
                    this.game.addMessage('{0} uses {1} to honor {2}', this.controller, this, context.target);
                    this.controller.honorCard(context.target);
                } else if(context.target.isHonored) {
                    this.game.addMessage('{0} uses {1} to dishonor {2}', this.controller, this, context.target);
                    this.controller.dishonorCard(context.target);                    
                } else {
                    let choices = [];
                    choices.push('Honor ' + context.target.name);
                    choices.push('Dishonor ' + context.target.name);
                    this.game.promptWithHandlerMenu(this.controller, {
                        choices: choices,
                        handlers: [
                            () => {
                                this.game.addMessage('{0} uses {1} to honor {2}', this.controller, this, context.target);
                                this.controller.honorCard(context.target);
                            },
                            () => {
                                this.game.addMessage('{0} uses {1} to dishonor {2}', this.controller, this, context.target);
                                this.controller.dishonorCard(context.target);                                
                            }
                        ]
                    });
                }
            }
        });
    }
}

AsakoDiplomat.id = 'asako-diplomat';

module.exports = AsakoDiplomat;
