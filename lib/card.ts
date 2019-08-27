import { SpeakerSession } from './types';
import { MessageFactory, Activity, CardFactory, Attachment } from 'botbuilder';
import { s } from 'metronical.proto';

//Creates a carousal
export function createCarousal(data: SpeakerSession[], topIntent: string): Partial<Activity> {
  const heroCards = [];
  data.forEach((element, index) => {
    heroCards.push(createHeroCard(element, topIntent));
  });
  return MessageFactory.carousel(heroCards);
}

//Create a single hero card
export function createHeroCard(data: SpeakerSession, topIntent: string): Attachment {
  return CardFactory.heroCard(
    "",
    CardFactory.images([""]),
    CardFactory.actions([{
      type: "openUrl",
      title: "Read more..",
      value: ""
    }])
  );
}