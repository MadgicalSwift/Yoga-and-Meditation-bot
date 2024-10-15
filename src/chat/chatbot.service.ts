import { ConsoleLogger, Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { LocalizationService } from 'src/localization/localization.service';
import { localisedStrings } from 'src/i18n/en/localised-strings';
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service'; // Adjust the path as necessary
import { AiBotService } from 'src/common/utils/aibot.service';

@Injectable()
export class ChatbotService {
  private readonly intentClassifier: IntentClassifier;
  private readonly message: MessageService;
  private readonly userService: UserService;
  private readonly swiftchatService: SwiftchatMessageService; // Add this line
  private readonly knodwldgebase: AiBotService;
  private selectedPose: string | null = null; 
  private selectedstyle: string | null = null;

  constructor(
    intentClassifier: IntentClassifier,
    message: MessageService,
    userService: UserService,
    swiftchatService: SwiftchatMessageService,
    AiBotService: AiBotService,
  ) {
    this.intentClassifier = intentClassifier;
    this.message = message;
    this.userService = userService;
    this.swiftchatService = swiftchatService;
    this.knodwldgebase =  AiBotService
  }

  public async processMessage(body: any): Promise<any> {
    const { from, type } = body;
    const botID = process.env.BOT_ID;

    const userData = await this.userService.findUserByMobileNumber(from, botID);
    if (!userData) {
      await this.userService.createUser(from, 'english', botID);
    }
    if (type === 'persistent_menu_response') {
      
      const menuBody = body.persistent_menu_response?.body;
    
      if (!menuBody) {
        console.error('Menu body is undefined or missing');
        return; 
      }
    
      try {
        
        if (menuBody === 'change language') {
          if (!userData.language) { 
            return;  
          }
          await this.message.sendLanguageSelectionMessage(from, userData.language);
          return;
        } 
      } catch (error) {
        console.error('Error processing persistent menu response:', error);
      }
    }
     
    

    else  if (type == 'button_response') {
      const buttonResponse = body.button_response?.body; 
        if (['english', 'hindi'].includes(buttonResponse.toLowerCase())) {
        userData.language = buttonResponse; 
        await this.userService.saveUser(userData); 
        await this.message.sendLanguageChangedMessage(from, buttonResponse);
        await this.message.mainmenu(from, buttonResponse);
        
        return; 
      }

          
const PoseButtons = userData.language === 'hindi' ? ['हठ', 'विन्यास', 'अस्थांग', 'यिन', 'विश्राम'] : ['Hatha', 'Vinyasa', 'Ashtanga', 'Yin', 'Restorative'];
const mediButtons = userData.language === 'hindi' ? ["माइंडफुलनेस" , "निर्देशित दृश्यता","प्रेम-करुणा" ,"शरीर स्कैन"] : ["Mindfulness", "Guided Visualization","Loving-Kindness","Body Scan"];
//yoga practices
if (buttonResponse == localisedStrings.guidebutton[0] || buttonResponse == 'योग अभ्यास') {
  await this.message.poseselection(from, userData.language);
  return; 
}else if (PoseButtons.includes(buttonResponse)) {
  this.selectedPose = buttonResponse; 
  await this.message.sendYogaPoseDescription(from, this.selectedPose, userData.language);
  return;
} else if (buttonResponse === 'योग करने के लिए अधिक विवरण' || buttonResponse === localisedStrings.moreDetails) {
  if (this.selectedPose) { 
      await this.message.sendMoreYogaDetails(from, this.selectedPose, userData.language);  
  } 
  return;
} else if (buttonResponse === localisedStrings.mainMenu || buttonResponse === 'मुख्य मेनू') {
  await this.message.mainmenu(from, userData.language);
} else if (buttonResponse === "योग अभ्यास पर वापस जाएं" || buttonResponse === localisedStrings.backToYogaPractices) {
  if (this.selectedPose) { 
      await this.message.poseselection(from, userData.language);
  }   
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
//personalized recom.
else if (buttonResponse == localisedStrings.guidebutton[2] || buttonResponse == "व्यक्तिगत सिफारिशें") {
        await this.message.sendTextMessage(from, userData.language);
        return;
      }
// tips
else if (buttonResponse == localisedStrings.guidebutton[3] || buttonResponse == "युक्तियाँ और संसाधन") {
        await this.message.sendRandomYogaMeditationTip(from, userData.language);
        return; 
      } 
    }  
    

  if (type === 'text') {
   
    const messageBody = body.text?.body;
  
    if (!messageBody) {
      console.log('Received an empty message body.');
      return; 
    }
  
    if (!messageBody.toLowerCase().includes("hi")) {
      await this.handelPersonalrecomadationResponse(messageBody, userData.mobileNumber, userData.language);
      return; 
    }
  
    if (messageBody.toLowerCase() === 'hi') {
      const localizedStrings = LocalizationService.getLocalisedString(userData.language); 
  
      await this.message.sendWelcomeMessage(from, localizedStrings.welcomeMessage);
      
      userData.chat_history = null;
      userData.chat_summary = null;
  
      console.log('userData', userData);
      await this.userService.saveUser(userData);
  
      await this.message.sendLanguageSelectionMessage(from, localizedStrings.languageSelection);
      return; 
    }
  }
  
  return 'ok';
} 
  async handelPersonalrecomadationResponse(question: string, from: string, language: string) {
    const userData = await this.userService.findUserByMobileNumber(from, process.env.BOT_ID);
    if (!userData) {
      console.error('User not found for mobileNumber:', from);
      return;
    }
    if (!userData.chat_history) {
      userData.chat_history = [];
    }
    if (!userData.chat_summary) {
      userData.chat_summary = '';
    }
    const response = await this.knodwldgebase.getYogaRecommendation(
      question, 
      userData.chat_history, 
      userData.chat_summary
    );
    
  console.log("Response from knowledge base:", response);
   
    if (response) {
      if (response.full_history) {
       
        userData.chat_history = [...userData.chat_history, ...response.full_history];
      }
      if (response.summary_history !== undefined) { 
        userData.chat_summary = response.summary_history;
      }
    } else {
      console.warn('Response does not contain full_history or summary_history');
    }
    await this.message.sendResponseToTheUSer(from, response.response, language);
  
    
    await this.userService.updateUserHistory(
      from, 
      process.env.BOT_ID, 
      userData.chat_history, 
      userData.chat_summary
    );
  }
   
}

export default ChatbotService;
