import { BotFrameworkAdapter, ConversationState, MemoryStorage } from 'botbuilder';
import { QnAMaker, LuisRecognizer } from 'botbuilder-ai';
import { IQnAService, BotConfiguration } from 'botframework-config';
import { DialogSet } from 'botbuilder-dialogs'
import { BlobStorage } from 'botbuilder-azure';

import * as restify from 'restify';
import { ConfBot } from './bot';
import { config } from 'dotenv';
import * as path from 'path';

config();

const botConfig = BotConfiguration.loadSync('./conf-edui2018.bot');

const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const qnamaker = new QnAMaker({
  knowledgeBaseId: process.env.QNA_KNOWLEDGE_BASE_ID,
  endpointKey: process.env.QNA_ENDPOINT_KEY,
  host: process.env.QNA_HOST_NAME
});

const luis = new LuisRecognizer({
  applicationId: process.env.LUIS_APPLICATION_ID,
  endpointKey: process.env.LUIS_ENDPOINT_KEY,
  endpoint: process.env.LUIS_ENDPOINT
});

const blobStorage = new BlobStorage({
  containerName: process.env.BLOB_CONTAINER,
  storageAccessKey: process.env.BLOB_STORAGE_KEY,
  storageAccountOrConnectionString: process.env.BLOB_STORAGE_ACCOUNT_NAME
});

const conservationState = new ConversationState(blobStorage);
const dialogs = new DialogSet(conservationState.createProperty("dialogState"));

const echo: ConfBot = new ConfBot(qnamaker, luis, dialogs, conservationState, blobStorage, adapter);

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3979, () => {
  console.log(`${server.name} listening on ${server.url}`);
});

server.post("/api/messages", (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    await echo.onTurn(context);
  });
});