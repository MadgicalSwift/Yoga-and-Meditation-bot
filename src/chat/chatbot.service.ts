
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

    // Fetch user data based on mobile number and bot ID
    const userData = await this.userService.findUserByMobileNumber(from, botID);

    // Ensure the user has a default language set if it's not already there
    if (!userData.language) {
      userData.language = 'english';
      await this.userService.saveUser(userData);
    }

    if (type === 'persistent_menu_response') {
      const menuBody = body.persistent_menu_response?.body;
      console.log('Received persistent_menu_response with body:', menuBody);
    
      if (!menuBody) {
        console.error('Menu body is missing');
      }
    
      switch (menuBody) {
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
    
    
      
    if (type == 'button_response') {
      const buttonResponse = body.button_response?.body; // Get the button response body
      
        if (['english', 'hindi'].includes(buttonResponse.toLowerCase())) {
        userData.language = buttonResponse; // Update user language
        await this.userService.saveUser(userData); // Save updated language

        await this.message.sendLanguageChangedMessage(from, buttonResponse);
        await this.message.mainmenu(from, buttonResponse);
        
        return; 
      }
if (buttonResponse =='Yoga Practices' ||buttonResponse =='योग अभ्यास' ) {
  console.log('Selected menu', buttonResponse); 
  await this.message.poseselection(from, userData.language);
    return; 
} 
  
const PoseButtons = userData.language === 'hindi' ? ['हठ', 'विन्यास', 'अस्थांग', 'यिन', 'विश्राम'] : ['Hatha', 'Vinyasa', 'Ashtanga', 'Yin', 'Restorative'];
let selectedPose: string | undefined; 

if (PoseButtons.includes(buttonResponse)) {
   this.selectedPose = buttonResponse; 
  console.log(`User selected pose: ${selectedPose}`); 
  await this.message.sendYogaPoseDescription(from, this.selectedPose, userData.language);

  return;
} 
 
if (buttonResponse === 'योग करने के लिए अधिक विवरण' ||buttonResponse==='More Details on How to Perform Yoga') {
  console.log('Requesting more details for pose:', this.selectedPose);

        if (this.selectedPose) { 
          await this.message.sendMoreYogaDetails(from, this.selectedPose, userData.language);
        } else {
           console.log('No pose selected for more details.');
              }
  return;
}


if (buttonResponse === localisedStrings.mainMenu || buttonResponse=== 'मुख्य मेनू') {
  console.log('Navigating to main menu');
  await this.message.mainmenu(from, userData.language);
}


if (buttonResponse === "योग अभ्यास पर वापस जाएं" || buttonResponse ==="Back to Yoga Practices") {
  console.log('User clicked Back to Yoga Practices');
  if (this.selectedPose) { 
    await this.message.sendYogaPoseDescription(from, this.selectedPose, userData.language);
  } else {
     console.log('No pose selected for more details.');
        }
return;
}
if (buttonResponse === localisedStrings.backToMainMenu || buttonResponse === 'मुख्य मेनू पर वापस जाएं') {
  console.log('Navigating to main menu');
  await this.message.mainmenu(from, userData.language);
}
























if (buttonResponse =='Meditation Techniques' ||buttonResponse == "ध्यान तकनीकें" ) {
  console.log('Meditation Techniques' );
  return; 
} 




if (buttonResponse =='Personalized Recommendations' ||buttonResponse == "व्यक्तिगत सिफारिशें" ) { 
  console.log('Personalized Recommendations' ); 
  return; 
} 

if (buttonResponse =='Tips & Resources' ||buttonResponse == "युक्तियाँ और संसाधन" ) {
  console.log('युक्तियाँ और संसाधन' ); 
 
  return; 
} 



}
      

    // When the user sends a message like "hi"
    const { text } = body;
    if (!text || !text.body) {
      console.error('Text or body is missing:', body);
      return; // Exit if no text or body is provided
    }

    // Get intent and entities from the user's message
    const { intent } = this.intentClassifier.getIntent(text.body);

    // Save the user data before processing intents
    await this.userService.saveUser(userData);

    // Handle greeting intent (e.g., when the user says "hi" or "hello")
    if (intent === 'greeting') {
      const localizedStrings = LocalizationService.getLocalisedString(userData.language); // Localize based on user's language

      // Send a welcome message and language selection prompt
      await this.message.sendWelcomeMessage(from, localizedStrings.welcomeMessage);
      await this.message.sendLanguageSelectionMessage(from, localizedStrings.languageSelection);
      return; // Stop further processing after handling greeting
    }
        // Return a success message
    return 'ok';
  }
}

export default ChatbotService;
