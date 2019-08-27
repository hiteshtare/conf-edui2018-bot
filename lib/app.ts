import { BotFrameworkAdapter } from 'botbuilder';
import { QnAMaker } from 'botbuilder-ai';
import { IQnAService, BotConfiguration } from 'botframework-config';
import * as restify from 'restify';
import { ConfBot } from './bot';
import { config } from 'dotenv';
import * as path from 'path';

config();

const botConfig = BotConfiguration.loadSync('./conf-edui2018.bot');

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3979, () => {
  console.log(`${server.name} listening on ${server.url}`);
});

const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const qnamaker = new QnAMaker({
  knowledgeBaseId: process.env.QNA_KNOWLEDGE_BASE_ID,
  endpointKey: process.env.QNA_ENDPOINT_KEY,
  host: process.env.QNA_HOST_NAME
});

const echo: ConfBot = new ConfBot(qnamaker);

server.post("/api/messages", (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    await echo.onTurn(context);
  });
});
