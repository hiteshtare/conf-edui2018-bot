import { SpeakerSession } from './types';
import { ConversationReference, BotAdapter, TurnContext } from 'botbuilder';
import { BlobStorage } from 'botbuilder-azure';
import { getExact } from './parser';
import * as moment from 'moment'

export async function saveRef(ref: Partial<ConversationReference>, storage: BlobStorage): Promise<string> {
  const changes = {};
  changes[`reference/${ref.activityId}`] = ref;
  await storage.write(changes);
  return await ref.activityId;
}

export async function getRef(userId: string, storage: BlobStorage, saveSessions?: string[]): Promise<any> {
  const key = `reference/${userId}`;
  var r = await storage.read([key]);
  if (r[key]['speakerSession'] !== undefined && saveSessions !== null && saveSessions.length === 0) {
    saveSessions = JSON.parse(r[key]['speakerSession']);
  }
  return await r[key];
}

export async function subscribe(userId: string, storage: BlobStorage, adapter: BotAdapter, saveSessions: string[]): Promise<any> {
  if (moment(moment.now()).isBetween(moment('2018-10-06').toDate(), moment('2018-10-12').toDate())) {
    setInterval(async () => {
      const ref = await getRef(userId, storage);
      if (ref) {
        await adapter.continueConversation(ref, async (context) => {
          saveSessions.forEach(async (element) => {
            if (element !== undefined) {
              const s: SpeakerSession = getExact(element);
              const d = moment(`${s.date} ${s.startTime}`);
              const d15 = moment(`${s.date} ${s.startTime}`).subtract(15, "minutes");
              if (moment(moment.now()).isBetween(d15.toDate(), d.toDate())) {
                await context.sendActivity(`Reminder: The session ${s.title} from ${s.speakers}
                 is about to start at ${s.startTime} in ${s.location}`);
                element == undefined;
              }
            }
          });
          saveSessions = saveSessions.filter(v => v);
        });
      }
    }, 300000);
  }
}