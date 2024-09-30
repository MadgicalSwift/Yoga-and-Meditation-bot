import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { localisedStrings } from 'src/i18n/en/localised-strings';
import { User } from 'src/model/user.entity';

@Injectable()
export class ChatbotService {
  private readonly intentClassifier: IntentClassifier;
  private readonly message: MessageService;
  private readonly userService: UserService;

  constructor(
    intentClassifier: IntentClassifier,
    message: MessageService,
    userService: UserService,
  ) {
    this.intentClassifier = intentClassifier;
    this.message = message;
    this.userService = userService;
  }

  public async processMessage(body: any): Promise<any> {
    const { from, text } = body;
    let botID = process.env.BOT_ID;
    const userData = await this.userService.findUserByMobileNumber(from, botID);
    

    const { intent, entities } = this.intentClassifier.getIntent(text.body);
    if (userData.language === 'english' || userData.language === 'hindi') {
      await this.userService.saveUser(userData);
    }
    if (intent === 'greeting') {
      this.message.sendWelcomeMessage(from, userData.language);
    } else if (intent === 'select_language') {
      const selectedLanguage = entities[0];
      const userData = await this.userService.findUserByMobileNumber(from, botID);
      userData.language = selectedLanguage;
      await this.userService.saveUser(userData);
      this.message.sendLanguageChangedMessage(from, userData.language);
    }
    return 'ok';
  }
}
export default ChatbotService;
