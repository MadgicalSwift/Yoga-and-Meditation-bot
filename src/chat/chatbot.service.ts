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

    // Fetch user data based on mobile number and bot ID
    const userData = await this.userService.findUserByMobileNumber(from, botID);
    if (!userData) {
      await this.userService.createUser(from, 'english', botID);
    }
    // Ensure the user has a default language set if it's not already there

    if (type === 'persistent_menu_response') {
      const menuBody = body.persistent_menu_response?.body;
      switch (menuBody) {
        case 'change language':
          await this.message.sendLanguageSelectionMessage(
            from,
            userData.language,
          );
          return; // End processing after handling the persistent menu response

        default:
          console.error('Unexpected menu option:', menuBody);
          return; // Handle unexpected options
      }
    }
    // Handle user button responses
    else if (type == 'button_response') {
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

      const Options = [
        'Yoga Practices',
        'Meditation Techniques',
        'Personalized Recommendations',
        'Tips & Resources',
        'योग अभ्यास',
        'ध्यान तकनीकें',
        'व्यक्तिगत सिफारिशें',
        'युक्तियाँ और संसाधन',
      ];
      if (
        buttonResponse == 'Yoga Practices' ||
        buttonResponse == 'योग अभ्यास'
      ) {
        console.log('Selected menu', buttonResponse);
        await this.message.poseselection(from, userData.language);
        return;
      }

      if (
        buttonResponse == 'Meditation Techniques' ||
        buttonResponse == 'ध्यान तकनीकें'
      ) {
        console.log('Meditation Techniques');
        return;
      }

      if (
        buttonResponse == 'Personalized Recommendations' ||
        buttonResponse == 'व्यक्तिगत सिफारिशें'
      ) {
        await this.message.sendTextMessage(from, userData.language);
        console.log('Personalized Recommendations', userData);
        return;
      }
      if (
        buttonResponse == 'Tips & Resources' ||
        buttonResponse == 'युक्तियाँ और संसाधन'
      ) {
        console.log('युक्तियाँ और संसाधन');

        return;
      }
      console.log('buttonResponse', buttonResponse);
    } else if (type == 'text' && !body.text.body.includes("Hi")) {
      console.log('please ask you query');
      await this.handelPersonalrecomadationResponse(body.text.body,userData.mobileNumber,userData.language);
    }

    if (body.text.body === 'Hi') {
      const localizedStrings = LocalizationService.getLocalisedString(
        userData.language,
      ); // Localize based on user's language
     
      // Send a welcome message and language selection prompt
      await this.message.sendWelcomeMessage(
        from,
        localizedStrings.welcomeMessage,
      );
      userData.chat_history=null
      userData.chat_summary=null
    console.log('userData', userData)
    this.userService.saveUser(userData);
      await this.message.sendLanguageSelectionMessage(
        from,
        localizedStrings.languageSelection,
      );
      return; // Stop further processing after handling greeting
    }
    // Return a success message
    return 'ok';
  }

  async handelPersonalrecomadationResponse(question: string, from: string, language: string) {

    // Fetch user data based on mobile number
    const userData = await this.userService.findUserByMobileNumber(from, process.env.BOT_ID);
  
    // Check if the user exists
    if (!userData) {
      console.error('User not found for mobileNumber:', from);
      return;
    }
  
    // Ensure chat_history and summary_history are initialized
    if (!userData.chat_history) {
      userData.chat_history = [];
    }
    if (!userData.chat_summary) {
      userData.chat_summary = '';
    }
  
    // Call the knowledge base API to get the recommendation
    const response = await this.knodwldgebase.getYogaRecommendation(
      question, 
      userData.chat_history, 
      userData.chat_summary
    );
  
    // Add some debug logging for the response
    
  console.log("Response from knowledge base:", response);
    // Append new entries to chat history and update summary history
    if (response) {
      if (response.full_history) {
        // Append new chat history to the existing one
        userData.chat_history = [...userData.chat_history, ...response.full_history];
      }
      if (response.summary_history !== undefined) { // Allow empty summary
        userData.chat_summary = response.summary_history;
      }
    } else {
      console.warn('Response does not contain full_history or summary_history');
    }
  
    // Log the updated user data
    console.log("Updated user data:", userData);
  
    // Send response back to the user
    await this.message.sendResponseToTheUSer(from, response.response, language);
  
    // Save updated user data (if you're storing in DB)
    await this.userService.updateUserHistory(
      from, 
      process.env.BOT_ID, 
      userData.chat_history, 
      userData.chat_summary
    );
  }
  
  
  
  
}

export default ChatbotService;
