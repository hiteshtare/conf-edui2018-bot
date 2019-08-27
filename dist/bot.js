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
class ConfBot {
    constructor(qnaMaker, luis) {
        this._qnaMaker = qnaMaker;
        this._luis = luis;
    }
    onTurn(context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.activity.type === 'message') {
                const qnaResults = yield this._qnaMaker.generateAnswer(context.activity.text);
                if (qnaResults.length > 0) {
                    yield context.sendActivity(qnaResults[0].answer);
                }
                else {
                    yield this._luis.recognize(context).then((res) => __awaiter(this, void 0, void 0, function* () {
                        const top = botbuilder_ai_1.LuisRecognizer.topIntent(res);
                        const data = parser_1.getData(res.entities);
                        if (top === "Time") {
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
        });
    }
}
exports.ConfBot = ConfBot;
//# sourceMappingURL=bot.js.map