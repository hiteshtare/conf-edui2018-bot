import { BlobStorage } from 'botbuilder-azure';
import { TurnContext, ConversationState, BotAdapter } from 'botbuilder';
import { QnAMaker, LuisRecognizer } from 'botbuilder-ai';
import { DialogSet, WaterfallDialog, WaterfallStepContext, ChoicePrompt, PromptOptions } from 'botbuilder-dialogs';
import { createCarousal, createHeroCard } from './card';
import { getData } from './parser';
import { SpeakerSession } from './types';
import { getTime } from './dialogs';
import { saveRef, subscribe, getRef } from './proactive';

export class ConfBot {
  private _qnaMaker: QnAMaker;
  private _luis: LuisRecognizer;
  private _dialogs: DialogSet;
  private _conversationState: ConversationState;
  private _storage: BlobStorage;
  private _adapter: BotAdapter;
  private _saveSessions: string[] = [];

  constructor(qnaMaker: QnAMaker, luis: LuisRecognizer, dialogs: DialogSet, conversationState: ConversationState,
    storage: BlobStorage, adapter: BotAdapter) {
    this._qnaMaker = qnaMaker;
    this._luis = luis;
    this._dialogs = dialogs;
    this._conversationState = conversationState;
    this._storage = storage;
    this._adapter = adapter;
    this.addDialogs();
  }

  async onTurn(context: TurnContext) {
    const dc = await this._dialogs.createContext(context);
    await dc.continueDialog();

    //+++++++++++++++++++++++++++++++DIALOGS+++++++++++++++++++++++++++++++//
    if (context.activity.text !== null && context.activity.text === 'help') {
      await dc.beginDialog('help');
    }
    //+++++++++++++++++++++++++++++++DIALOGS+++++++++++++++++++++++++++++++//
    else if (context.activity.type === 'message') {
      const userId: string = await saveRef(TurnContext.getConversationReference(context.activity), this._storage);
      await subscribe(userId, this._storage, this._adapter, this._saveSessions);

      //+++++++++++++++++++++++++++++++PROACTIVE_MESSAGING+++++++++++++++++++++++++++++++//
      if (context.activity.text.indexOf('SAVE:') !== -1) {
        const title = context.activity.text.replace('SAVE:', "");
        if (this._saveSessions.indexOf(title) !== -1) {
          this._saveSessions.push(title);
        }
        const ref = await getRef(userId, this._storage, this._saveSessions);
        ref['speakerSession'] = JSON.stringify(this._saveSessions);
        await saveRef(ref, this._storage);
        await context.sendActivity(`You have saved ${title} to your speaker session list.`)
      }
      //+++++++++++++++++++++++++++++++PROACTIVE_MESSAGING+++++++++++++++++++++++++++++++//
      else if (!context.responded) {
        //+++++++++++++++++++++++++++++++QNA_MAKER+++++++++++++++++++++++++++++++//
        const qnaResults = await this._qnaMaker.generateAnswer(context.activity.text, 3, 0.65);

        if (qnaResults.length > 0) {
          await context.sendActivity(qnaResults[0].answer);
        }
        //+++++++++++++++++++++++++++++++QNA_MAKER+++++++++++++++++++++++++++++++//
        else {
          //+++++++++++++++++++++++++++++LUIS+++++++++++++++++++++++++++++//
          await this._luis.recognize(context).then(async (res) => {
            const top = LuisRecognizer.topIntent(res);
            const data: SpeakerSession[] = getData(res.entities);

            if (top === 'Time') {
              dc.beginDialog('time', data);
            }
            //+++++++++++++++++++++++++++++++RICH_CARDS+++++++++++++++++++++++++++++++//
            else if (data.length > 1) {
              await context.sendActivity(createCarousal(data, top));
            }
            else if (data.length === 1) {
              await context.sendActivity({ attachments: [createHeroCard(data[0], top)] });
            }
            //+++++++++++++++++++++++++++++++RICH_CARDS+++++++++++++++++++++++++++++++//
          });// end of _luis.recognize
          //+++++++++++++++++++++++++++++LUIS+++++++++++++++++++++++++++++//
        }
      }// end of context.activity.text.indexOf('SAVE:')
    }
    else {
      await context.sendActivity(`${context.activity.type} event detected.`);
    }// end of context.activity.type === 'message'

    await this._conversationState.saveChanges(context);
  }

  private addDialogs() {
    this._dialogs.add(new WaterfallDialog('help', [
      async (step: WaterfallStepContext) => {
        const choices = ['I want to know about a topic'
          , 'I want to know about a speaker'
          , 'I want to know about a venue'];
        const options: PromptOptions = {
          prompt: 'What would you like to know?'
          , choices: choices
        };
        return await step.prompt('choicePrompt', options);
      },
      async (step: WaterfallStepContext) => {
        switch (step.result.index) {
          case 0:
            await step.context.sendActivity(`You can ask:
                            * _Is there a chatbot presentation?_
                            * _What is Michael Szul speaking about?_
                            * _Are there any Xamarin talks?_`);
            break;
          case 1:
            await step.context.sendActivity(`You can ask:
                            * _Who is speaking about bots?_
                            * _Where is giving the Bot Framework talk?_
                            * _Who is speaking Rehearsal A?_`);
            break;
          case 2:
            await step.context.sendActivity(`You can ask:
                            * _Where is Michael Szul talking?_
                            * _Where is the Bot Framework talk?_
                            * _What time is the Bot Framework talk?_`);
            break;
          default:
            break;
        }
        return await step.endDialog();
      }
    ]));

    this._dialogs.add(new ChoicePrompt('choicePrompt'));

    this._dialogs.add(new WaterfallDialog('time', [
      async (step: WaterfallStepContext) => {
        await step.context.sendActivities(getTime(step.activeDialog.state.options));
        return await step.endDialog();
      }
    ]));

  }
}