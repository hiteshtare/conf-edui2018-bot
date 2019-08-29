import { ConversationReference, BotAdapter, TurnContext } from 'botbuilder';
import { BlobStorage } from 'botbuilder-azure';

export async function saveRef(ref: Partial<ConversationReference>, storage: BlobStorage): Promise<string> {
  const changes = {};
  changes[`reference/${ref.activityId}`] = ref;
  await storage.write(changes);
  return await ref.activityId;
}

async function getRef(userId: string, storage: BlobStorage): Promise<any> {
  const key = `reference/${userId}`;
  var r = await storage.read([key]);
  return await r[key];
}

export async function subscribe(userId: string, storage: BlobStorage, adapter: BotAdapter): Promise<any> {
  setTimeout(async () => {
    const ref = await getRef(userId, storage);
    if (ref) {
      await adapter.continueConversation(ref, async (context) => {
        await context.sendActivity("Proactive message is sent");
      })
    }
  }, 3000);
}