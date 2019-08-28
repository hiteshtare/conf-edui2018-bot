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
const botbuilder_1 = require("botbuilder");
const botbuilder_ai_1 = require("botbuilder-ai");
const botframework_config_1 = require("botframework-config");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_azure_1 = require("botbuilder-azure");
const restify = require("restify");
const bot_1 = require("./bot");
const dotenv_1 = require("dotenv");
dotenv_1.config();
const botConfig = botframework_config_1.BotConfiguration.loadSync('./conf-edui2018.bot');
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
const qnamaker = new botbuilder_ai_1.QnAMaker({
    knowledgeBaseId: process.env.QNA_KNOWLEDGE_BASE_ID,
    endpointKey: process.env.QNA_ENDPOINT_KEY,
    host: process.env.QNA_HOST_NAME
});
const luis = new botbuilder_ai_1.LuisRecognizer({
    applicationId: process.env.LUIS_APPLICATION_ID,
    endpointKey: process.env.LUIS_ENDPOINT_KEY,
    endpoint: process.env.LUIS_ENDPOINT
});
const blobStorage = new botbuilder_azure_1.BlobStorage({
    containerName: process.env.BLOB_CONTAINER,
    storageAccessKey: process.env.BLOB_STORAGE_KEY,
    storageAccountOrConnectionString: process.env.BLOB_STORAGE_ACCOUNT_NAME
});
const conservationState = new botbuilder_1.ConversationState(blobStorage);
const dialogs = new botbuilder_dialogs_1.DialogSet(conservationState.createProperty("dialogState"));
const echo = new bot_1.ConfBot(qnamaker, luis, dialogs, conservationState);
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3979, () => {
    console.log(`${server.name} listening on ${server.url}`);
});
server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, (context) => __awaiter(this, void 0, void 0, function* () {
        yield echo.onTurn(context);
    }));
});
//# sourceMappingURL=app.js.map