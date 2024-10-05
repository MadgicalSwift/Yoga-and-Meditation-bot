import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LocalizationService } from 'src/localization/localization.service';
import { MessageService } from 'src/message/message.service';
import { localisedStrings } from 'src/i18n/en/localised-strings';

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
    
    async AgeselectionMessage(from: string, language: string) {
      const localisedStrings = LocalizationService.getLocalisedString(language);
      const message = localisedStrings.askage;
  
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
              body: '10-18',
              reply: '10-18',
            },
            {
              type: 'solid',
              body:   '18- 24',
              reply: '18-24',
            },
            {
              type: 'solid',
              body:   '24- 30',
              reply: '24-30',
            },
            {
              type: 'solid',
              body:   '30-45',
              reply: '30-45',
            },
            {
              type: 'solid',
              body:   '45+',
              reply: '45+',
            },
            
          ],
          allow_custom_response: false,
        },
      };
  
      return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
    }
  
      

   }
  

