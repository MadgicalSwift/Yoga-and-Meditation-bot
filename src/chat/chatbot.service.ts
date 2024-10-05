import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { LocalizationService } from 'src/localization/localization.service';

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

 /*  // ChatbotService
public async processMessage(body: any): Promise<any> {
  const { from, type } = body;

  const botID = process.env.BOT_ID;

  
  const userData = await this.userService.findUserByMobileNumber(from, botID);

  // Ensure user has a default language if none is set
  if (!userData.language) {
      userData.language = 'english'; 
      await this.userService.saveUser(userData);
  }

   if (type === 'persistent_menu_response' || (body.persistent_menu_response && body.persistent_menu_response.body === 'change language')) {
    const menuSelection = body.persistent_menu_response ? body.persistent_menu_response.body : null;

    if (menuSelection === 'change language') {
        
        await this.message.sendLanguageSelectionMessage(from, userData.language); // Pass both `from` and `language`
        return; // Return early after handling the persistent menu response
    }
}  

 if (type === 'button_response') {
  const selectedLanguage = body.button_response.body; // Extract the selected language from body

  if (selectedLanguage) {
      userData.language = selectedLanguage; // Update user language
      await this.userService.saveUser(userData); // Save updated user language
      console.log('Selected language:', selectedLanguage);

      
      // Get the correct localized strings based on selected language
      const localizedStrings = LocalizationService.getLocalisedString(selectedLanguage);
      
      // Send the correct language changed message
      await this.message.sendLanguageChangedMessage(from, selectedLanguage);
      return; // Return early after handling button response
  } else {
      console.error('No language selected or language is invalid');
      return; // Exit if the language is not valid
  }
}
 



  // Handle text input
  const { text } = body;
  if (!text || !text.body) {
      console.error('Text or body is missing:', body);
      return; // Exit if text or body is missing
  }

  
  const { intent, entities } = this.intentClassifier.getIntent(text.body);
  await this.userService.saveUser(userData); // Save the user data before processing intents

  if (intent === 'greeting') {
      const localizedStrings = LocalizationService.getLocalisedString(userData.language);
      await this.message.sendWelcomeMessage(from, localizedStrings.welcomeMessage);
      await this.message.sendLanguageSelectionMessage(from, localizedStrings.languageSelection);
  }

  return 'ok'; // Return a success message
} */

 
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
  
    // Handle persistent menu responses
    if (type === 'persistent_menu_response') {
        console.log('persistence');
        const menuBody = body.persistent_menu_response?.body;
    
        switch (menuBody) {
            case 'change language':
                console.log('User selected "change language" from the menu');
                
                // Send language selection options
                await this.message.sendLanguageSelectionMessage(from, userData.language);
                break;
    
            default:
                console.error('Unexpected menu option:', menuBody);
                break;
        }
    
        return; // End processing after handling persistent menu response
    }
    
    // Handle button responses (e.g., when the user selects a new language)
     else if (type === 'button_response') {
        const selectedLanguage = body.button_response?.body; // Extract the selected language
  
        // Check if the language is valid and proceed
        if (selectedLanguage) {
            userData.language = selectedLanguage; // Update user language
            await this.userService.saveUser(userData); // Save the updated language
            console.log('Selected language:', selectedLanguage);
  
            // Send a confirmation message for the language change
            await this.message.sendLanguageChangedMessage(from, selectedLanguage);
  
            // After language change, send the age selection message
            this.message.AgeselectionMessage(from, selectedLanguage);
            return; // Stop further processing after handling the button response
        } else {
            console.error('No language selected or language is invalid');
            return; 
        }
    }
  
    //  when the user sends a message like "hi"
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
