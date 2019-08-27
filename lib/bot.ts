import { SpeakerSession } from './types';
import { TurnContext } from 'botbuilder';
import { QnAMaker, LuisRecognizer } from 'botbuilder-ai';
import { getData } from './parser';

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
          await context.sendActivity(`The top intent found was ${top}`);
          let data: SpeakerSession[];
          switch (top) {
            case "Location":
            case "Speaker":
            case "Time":
            case "Topic":
              data = getData(res.entities);
              if (data.length > 1) {
                console.log(data);
                break;
              } else if (data.length == 1) {
                console.log(data);
                break;
              }
              else {
                //
                break;
              }
            default:
              await context.sendActivity(`No way to handle ${top}`);
              break;
          }// end of switch
        });// end of _luis.recognize
      }
    }
    else {
      await context.sendActivity(`${context.activity.type} event detected.`);
    }
  }
}