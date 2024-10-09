
import { ConsoleLogger, Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { LocalizationService } from 'src/localization/localization.service';
import { localisedStrings } from 'src/i18n/en/localised-strings';
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service'; // Adjust the path as necessary

@Injectable()
export class ChatbotService {
  private readonly intentClassifier: IntentClassifier;
  private readonly message: MessageService;
  private readonly userService: UserService;
  private readonly swiftchatService: SwiftchatMessageService; // Add this line


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
  
      switch (menuBody) {
        case 'change language':
          console.log('User selected "change language" from the menu');
          await this.message.sendLanguageSelectionMessage(from, userData.language);
          return; // End processing after handling the persistent menu response
  
        default:
          console.error('Unexpected menu option:', menuBody);
          return; // Handle unexpected options
      }
    }
    // Handle user button responses
    if (type == 'button_response') {
      const buttonResponse = body.button_response?.body; // Get the button response body
      
      // Check if the response is for language selection
      if (['english', 'hindi'].includes(buttonResponse.toLowerCase())) {
        userData.language = buttonResponse; // Update user language
        await this.userService.saveUser(userData); // Save updated language

        // Send confirmation message for the language change
        await this.message.sendLanguageChangedMessage(from, buttonResponse);
        await this.message.mainmenu(from, buttonResponse);
        return; 
      }
     
const Options = ['Yoga Practices','Meditation Techniques','Personalized Recommendations','Tips & Resources',"योग अभ्यास","ध्यान तकनीकें","व्यक्तिगत सिफारिशें","युक्तियाँ और संसाधन"]; 

if (buttonResponse =='Yoga Practices' ||buttonResponse =='योग अभ्यास' ) {
  console.log('Selected menu', buttonResponse); 
  await this.message.poseselection(from,  userData.language);
  
  /* const selectedPose = buttonResponse.button_response.body;
  console.log('Selected pose', selectedPose);
  
  await this.swiftchatService.sendYogaPoseDescription(from, selectedPose, userData.language);
  */ 
  return; 
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
