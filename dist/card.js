"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
function createCarousal(data, topIntent) {
    const heroCards = [];
    data.forEach((element, index) => {
        heroCards.push(createHeroCard(element, topIntent));
    });
    return botbuilder_1.MessageFactory.carousel(heroCards);
}
exports.createCarousal = createCarousal;
function createHeroCard(data, topIntent) {
    return botbuilder_1.CardFactory.heroCard("", botbuilder_1.CardFactory.images([""]), botbuilder_1.CardFactory.actions([{
            type: "openUrl",
            title: "Read more..",
            value: ""
        }]));
}
exports.createHeroCard = createHeroCard;
//# sourceMappingURL=card.js.map