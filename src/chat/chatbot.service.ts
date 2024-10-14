
import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { LocalizationService } from 'src/localization/localization.service';
import { localisedStrings } from 'src/i18n/en/localised-strings';
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service'; 


@Injectable()
export class ChatbotService {
  private readonly intentClassifier: IntentClassifier;
  private readonly message: MessageService;
  private readonly userService: UserService;
  private readonly swiftchatService: SwiftchatMessageService; 
  private selectedPose: string | null = null; 
  private selectedstyle: string | null = null;

  constructor(
    intentClassifier: IntentClassifier,
    message: MessageService,
    userService: UserService,
    swiftchatService: SwiftchatMessageService,
  ) {
    this.intentClassifier = intentClassifier;
    this.message = message;
    this.userService = userService;
    this.swiftchatService = swiftchatService;
  }
  
  public async processMessage(body: any): Promise<any> {
    const { from, type } = body;
    const botID = process.env.BOT_ID;
    const userData = await this.userService.findUserByMobileNumber(from, botID);
  if (!userData.language) {
      userData.language = 'english';
      await this.userService.saveUser(userData);
  }

  if (type === 'persistent_menu_response') {
    const menuBody = body.persistent_menu_response?.body; 
    if (!menuBody) {
        console.error('Menu body is missing');
        return;  }

    switch (menuBody.toLowerCase()) { 
      case 'change language':
            console.log('User selected "change language"');
            try {
                await this.message.sendLanguageSelectionMessage(from, userData.language);
            } catch (error) {
                console.error('Error in sendLanguageSelectionMessage:', error);
            }
            return;
            default:
            console.error('Unexpected menu option:', menuBody);
            return; 
    }
}
 
  else  if (type == 'button_response') {
      const buttonResponse = body.button_response?.body; 
        if (['english', 'hindi'].includes(buttonResponse.toLowerCase())) {
        userData.language = buttonResponse; 
        await this.userService.saveUser(userData); 
        console.log(buttonResponse);
        await this.message.sendLanguageChangedMessage(from, buttonResponse);
        await this.message.mainmenu(from, buttonResponse);
        
        return; 
      }

      
const PoseButtons = userData.language === 'hindi' ? ['हठ', 'विन्यास', 'अस्थांग', 'यिन', 'विश्राम'] : ['Hatha', 'Vinyasa', 'Ashtanga', 'Yin', 'Restorative'];
const mediButtons = userData.language === 'hindi' ? ["माइंडफुलनेस" , "निर्देशित दृश्यता","प्रेम-करुणा" ,"शरीर स्कैन"] : ["Mindfulness", "Guided Visualization","Loving-Kindness","Body Scan"];

if (buttonResponse == localisedStrings.guidebutton[0] || buttonResponse == 'योग अभ्यास') {
  await this.message.poseselection(from, userData.language);
  console.log(buttonResponse);
  return; 
} else if (PoseButtons.includes(buttonResponse)) {
  this.selectedPose = buttonResponse; 
  await this.message.sendYogaPoseDescription(from, this.selectedPose, userData.language);
  console.log(buttonResponse);
  return;
} else if (buttonResponse === 'योग करने के लिए अधिक विवरण' || buttonResponse === localisedStrings.moreDetails) {
  if (this.selectedPose) { 
      await this.message.sendMoreYogaDetails(from, this.selectedPose, userData.language);
  } 
  console.log(buttonResponse);
  return;
} else if (buttonResponse === localisedStrings.mainMenu || buttonResponse === 'मुख्य मेनू') {
  await this.message.mainmenu(from, userData.language);
} else if (buttonResponse === "योग अभ्यास पर वापस जाएं" || buttonResponse === localisedStrings.backToYogaPractices) {
  if (this.selectedPose) { 
      await this.message.poseselection(from, userData.language);
  } 
  console.log(buttonResponse);
  return;
} else if (buttonResponse === localisedStrings.backToMainMenu || buttonResponse === 'मुख्य मेनू पर वापस जाएं') {
  await this.message.mainmenu(from, userData.language);
}

// Meditation Techniques
else if (buttonResponse == localisedStrings.guidebutton[1] || buttonResponse == "ध्यान तकनीकें") {
  await this.message.meditationSelection(from, userData.language);
  return; 
} else if (mediButtons.includes(buttonResponse)) {
  this.selectedstyle = buttonResponse; 
  await this.message.sendMeditationDescription(from, this.selectedstyle, userData.language);
  return;
} else if (buttonResponse === "ध्यान के लिए अधिक विवरण" || buttonResponse === localisedStrings.moreDetailsmeditation) {
  if (this.selectedstyle) { 
      await this.message.sendMoreMeditationDetails(from, this.selectedstyle, userData.language);
  } 
  return;
} else if (buttonResponse === "ध्यान अभ्यासों पर वापस जाएं" || buttonResponse === localisedStrings.backToMeditationPractices) {
  if (this.selectedstyle) { 
      await this.message.meditationSelection(from, userData.language);
  } 
  return;
}

// Personalized Recommendations
else if (buttonResponse == localisedStrings.guidebutton[2] || buttonResponse == "व्यक्तिगत सिफारिशें") { 
  
  return; 
} else if (buttonResponse == localisedStrings.guidebutton[3] || buttonResponse == "युक्तियाँ और संसाधन") {
  await this.message.sendRandomYogaMeditationTip(from, userData.language);
  return; 
} 

}
      

    const { text } = body;
    if (!text || !text.body) {
      console.error('Text or body is missing:', body);
      return; 
    }

    const { intent } = this.intentClassifier.getIntent(text.body);

    await this.userService.saveUser(userData);

    if (intent === 'greeting') {
      const localizedStrings = LocalizationService.getLocalisedString(userData.language); // Localize based on user's language

      await this.message.sendWelcomeMessage(from, localizedStrings.welcomeMessage);
      await this.message.sendLanguageSelectionMessage(from, localizedStrings.languageSelection);
      return; 
    }
       
    return 'ok';
  }
}

export default ChatbotService;
