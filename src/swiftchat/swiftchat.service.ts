 import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LocalizationService } from 'src/localization/localization.service';
import { MessageService } from 'src/message/message.service';
import { localisedStrings } from 'src/i18n/en/localised-strings';
import * as yogaDataEn from '../datasource/hindi.json';
import * as yogaDatahi from '../datasource/english.json';

dotenv.config();

@Injectable()
export class SwiftchatMessageService extends MessageService {
  private botId = process.env.BOT_ID;
  private apiKey = process.env.API_KEY;
  private apiUrl = process.env.API_URL;
  private baseUrl = `${this.apiUrl}/${this.botId}/messages`;

 
 
  private prepareRequestData(from: string, requestBody: string): any {
    return {
      to: from,
      type: 'text',
      text: {
        body: requestBody,
      },
    };
  }
  async sendWelcomeMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.welcomeMessage,
    );

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }
   
      async sendLanguageSelectionMessage(from: string, language: string) {
        const localisedStrings = LocalizationService.getLocalisedString(language);
        const message = localisedStrings.languageSelection;
    
        const messageData = {
          to: from,
          type: 'button',
          button: {
            body: {
              type: 'text',
              text: {
                body: message,
              },
            },
            buttons: [
              {
                type: 'solid',
                body: localisedStrings.language_english,
                reply: 'English',
              },
              {
                type: 'solid',
                body: localisedStrings.language_hindi,
                reply: 'hindi',
              },
            ],
            allow_custom_response: false,
          },
        };
    
        return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
      }
    
  
      public async sendLanguageChangedMessage(from: string, language: string) {
        const localisedStrings = LocalizationService.getLocalisedString(language); // Fetch the correct localized strings
        const requestData = this.prepareRequestData(
            from,
            localisedStrings.languageChangedMessage // Use localized string for language change confirmation
        );
    
        const response = await this.sendMessage(this.baseUrl, requestData, this.apiKey);
        return response;
    }
    
    async mainmenu(from: string, language: string) {
      const localisedStrings = LocalizationService.getLocalisedString(language);
      const message = localisedStrings.guide;
  
      const messageData = {
        to: from,
        type: 'button',
        button: {
          body: {
            type: 'text',
            text: {
              body: message,
            },
          },
          buttons: [
            {
              type: 'solid',
              body: localisedStrings.guidebutton[0],
              reply: localisedStrings.guidebutton[0],
            },
            {
              type: 'solid',
              body:   localisedStrings.guidebutton[1],
              reply: localisedStrings.guidebutton[1],
            },
            {
              type: 'solid',
              body:  localisedStrings.guidebutton[2],
              reply: localisedStrings.guidebutton[2],
            },
            {
              type: 'solid',
              body:   localisedStrings.guidebutton[3],
              reply: localisedStrings.guidebutton[3],
            },
           
          ],
          allow_custom_response: false,
        },
      };
  
      return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
    }
    async poseselection(from: string, language: string) {
      const localisedStrings = LocalizationService.getLocalisedString(language);
      const message = localisedStrings.poseMessage;
  
      const messageData = {
        to: from,
        type: 'button',
        button: {
          body: {
            type: 'text',
            text: {
              body: message,
            },
          },
          buttons: [
            {
              type: 'solid',
              body: localisedStrings.poseButtons[0],
              reply: localisedStrings.poseButtons[0],
            },
            {
              type: 'solid',
              body:   localisedStrings.poseButtons[1],
              reply: localisedStrings.poseButtons[1],
            },
            {
              type: 'solid',
              body:  localisedStrings.poseButtons[2],
              reply: localisedStrings.poseButtons[2],
            },
            {
              type: 'solid',
              body:   localisedStrings.poseButtons[3],
              reply: localisedStrings.poseButtons[3],
            },
            {
              type: 'solid',
              body:   localisedStrings.poseButtons[4],
              reply: localisedStrings.poseButtons[4],
            },
           
          ],
          allow_custom_response: false,
        },
      };
  
      return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
    }
    
    async sendYogaPoseDescription(from: string, selectedPose: string, language: string) {
      // Access the selected yoga pose data
      const yogaType = yogaDatahi.yoga[selectedPose];
    
      if (yogaType) {
        const Description = yogaType.description; // Get the description of the selected pose
        const responseMessage = `${selectedPose}: \n\n${Description}`; // Format the response message
    
        // Prepare message data without buttons
        const messageData = {
          to: from,
          type: 'text',
          text: {
            body: responseMessage, // Sending the description of the selected yoga pose
          },
        };
    
        // Send the message
        return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
      } 
    }
    
    
    
    
    
   
    
}
 

  

 
