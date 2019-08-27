import { SpeakerSession } from './types';
import { TurnContext } from 'botbuilder';
import { QnAMaker, LuisRecognizer } from 'botbuilder-ai';
import { getData } from './parser';
import { createCarousal, createHeroCard } from './card';

export class ConfBot {
  private _qnaMaker: QnAMaker;
  private _luis: LuisRecognizer;

  constructor(qnaMaker: QnAMaker, luis: LuisRecognizer) {
    this._qnaMaker = qnaMaker;
    this._luis = luis;
  }

  async onTurn(context: TurnContext) {
    if (context.activity.type === 'message') {
      // await context.sendActivity(`You said ${context.activity.text}`);
      const qnaResults = await this._qnaMaker.generateAnswer(context.activity.text);

      if (qnaResults.length > 0) {
        await context.sendActivity(qnaResults[0].answer);
      }
      else {
        await this._luis.recognize(context).then(async (res) => {
          const top = LuisRecognizer.topIntent(res);
          const data: SpeakerSession[] = getData(res.entities);

          if (top === "Time") {
            //
          }
          else if (data.length > 1) {
            await context.sendActivity(createCarousal(data, top));
          }
          else if (data.length === 1) {
            await context.sendActivity({ attachments: [createHeroCard(data[0], top)] });
          }
        });// end of _luis.recognize
      }
    }
    else {
      await context.sendActivity(`${context.activity.type} event detected.`);
    }
  }
}