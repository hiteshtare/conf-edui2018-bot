"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const metronical_proto_1 = require("metronical.proto");
function createCarousal(data, topIntent) {
    const heroCards = [];
    data.forEach((element, index) => {
        heroCards.push(createHeroCard(element, topIntent));
    });
    return botbuilder_1.MessageFactory.carousel(heroCards);
}
exports.createCarousal = createCarousal;
function createHeroCard(data, topIntent) {
    const images = [];
    if (data.images !== null && data.images.length > 0) {
        data.images.forEach((element) => {
            images.push(element.link);
        });
    }
    let title;
    let subTitle;
    const text = metronical_proto_1.s(data.description).stripHtml().truncateWords(30).toString();
    switch (topIntent) {
        case "Location":
            title = data.location;
            subTitle = `${data.speakers}, ${data.title}`;
            break;
        case "Speaker":
            title = data.speakers;
            subTitle = data.location;
            break;
        case "Topic":
            title = data.title;
            subTitle = data.speakers;
            break;
        default:
            throw new Error(`No way to handle ${topIntent}`);
            break;
    }
    return botbuilder_1.CardFactory.heroCard(title, botbuilder_1.CardFactory.images(images), botbuilder_1.CardFactory.actions([{
            type: "openUrl",
            title: "Read more..",
            value: data.link
        }]), { subtitle: subTitle, text: text });
}
exports.createHeroCard = createHeroCard;
//# sourceMappingURL=card.js.map