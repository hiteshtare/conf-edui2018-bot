"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_ai_1 = require("botbuilder-ai");
const parser_1 = require("./parser");
const card_1 = require("./card");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
class ConfBot {
    constructor(qnaMaker, luis, dialogs, conversationState) {
        this._qnaMaker = qnaMaker;
        this._luis = luis;
        this._dialogs = dialogs;
        this._conversationState = conversationState;
        this.addDialogs();
    }
    onTurn(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const dc = yield this._dialogs.createContext(context);
            yield dc.continueDialog();
            if (context.activity.text !== null && context.activity.text === 'help') {
                yield dc.beginDialog('help');
            }
            else if (context.activity.type === 'message') {
                const qnaResults = yield this._qnaMaker.generateAnswer(context.activity.text);
                if (qnaResults.length > 0) {
                    yield context.sendActivity(qnaResults[0].answer);
                }
                else {
                    yield this._luis.recognize(context).then((res) => __awaiter(this, void 0, void 0, function* () {
                        const top = botbuilder_ai_1.LuisRecognizer.topIntent(res);
                        const data = parser_1.getData(res.entities);
                        if (top === 'Time') {
                        }
                        else if (data.length > 1) {
                            yield context.sendActivity(card_1.createCarousal(data, top));
                        }
                        else if (data.length === 1) {
                            yield context.sendActivity({ attachments: [card_1.createHeroCard(data[0], top)] });
                        }
                    }));
                }
            }
            else {
                yield context.sendActivity(`${context.activity.type} event detected.`);
            }
            yield this._conversationState.saveChanges(context);
        });
    }
    addDialogs() {
        this._dialogs.add(new botbuilder_dialogs_1.WaterfallDialog("help", [
            (step) => __awaiter(this, void 0, void 0, function* () {
                const choices = ["I want to know about a topic",
                    "I want to know about a speaker",
                    "I want to know about a venue"];
                const options = {
                    prompt: "What would you like to know?",
                    choices: choices
                };
                return yield step.prompt("choicePrompt", options);
            }),
            (step) => __awaiter(this, void 0, void 0, function* () {
                switch (step.result.index) {
                    case 0:
                        yield step.context.sendActivity(`You can ask:
                            * _Is there a chatbot presentation?_
                            * _What is Michael Szul speaking about?_
                            * _Are there any Xamarin talks?_`);
                        break;
                    case 1:
                        yield step.context.sendActivity(`You can ask:
                            * _Who is speaking about bots?_
                            * _Where is giving the Bot Framework talk?_
                            * _Who is speaking Rehearsal A?_`);
                        break;
                    case 2:
                        yield step.context.sendActivity(`You can ask:
                            * _Where is Michael Szul talking?_
                            * _Where is the Bot Framework talk?_
                            * _What time is the Bot Framework talk?_`);
                        break;
                    default:
                        break;
                }
                return yield step.endDialog();
            })
        ]));
        this._dialogs.add(new botbuilder_dialogs_1.ChoicePrompt("choicePrompt"));
    }
}
exports.ConfBot = ConfBot;
//# sourceMappingURL=bot.js.map