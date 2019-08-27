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
  const images = [];
  if (data.images !== null && data.images.length > 0) {
    data.images.forEach((element) => {
      images.push(element.link);
    });
  }
  let title: string;
  let subTitle: string;

  //To truncate 30 words
  const text: string = s(data.description).stripHtml().truncateWords(30).toString();

  switch (topIntent) {
    case "Location":
      title = data.location;
      subTitle = `${data.speakers}, ${data.title}`;
      break;
    case "Speaker":
      title = data.speakers;
      subTitle = data.location;
      break;
    case "Topic":
      title = data.title;
      subTitle = data.speakers;
      break;

    default:
      throw new Error(`No way to handle ${topIntent}`);
      break;
  }// end of switch

  return CardFactory.heroCard(
    title,
    CardFactory.images(images),
    CardFactory.actions([{
      type: "openUrl",
      title: "Read more..",
      value: data.link
    }]), { subtitle: subTitle, text: text }
  );
}