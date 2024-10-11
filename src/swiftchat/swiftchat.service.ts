 import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LocalizationService } from 'src/localization/localization.service';
import { MessageService } from 'src/message/message.service';
import { localisedStrings } from 'src/i18n/en/localised-strings';
import * as yogaDataEn from '../datasource/english.json'; // English dataset
import * as yogaDatahi from '../datasource/hindi.json'; // Hindi dataset


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
      const localisedStrings = LocalizationService.getLocalisedString(language);
      
      const yogaData = language === 'hindi' ? yogaDatahi : yogaDataEn;
      const normalizedPose = selectedPose.trim().toLowerCase();
         
      const yogaType = yogaData.yoga[normalizedPose];
    if (yogaType) {
          const description = yogaType.description;
          const responseMessage = `**${selectedPose}**: \n\n*${description}*`;
    
          const messageData = {
            to: from,
            type: 'button',
            button: {
              body: {
                type: 'text',
                text: {
                  body: responseMessage,
                },
              },
              buttons: [
                {
                  type: 'solid',
                  body: localisedStrings.moreDetails,
                  reply: localisedStrings.moreDetails,
                },
                {
                  type: 'solid',
                  body:   localisedStrings.mainMenu,
                  reply: localisedStrings.mainMenu,
                },
               
               
              ],
              allow_custom_response: false,
            },
          };
    
          
          return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
      }
  }
  
  async sendMoreYogaDetails(from: string, selectedPose: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const yogaData = language === 'hindi' ? yogaDatahi : yogaDataEn;
    const normalizedPose = selectedPose.trim().toLowerCase();
  
    const yogaType = yogaData.yoga[normalizedPose];
    if (yogaType) {
      const steps = yogaType.steps; 
      const videoUrl = yogaType.videoUrl; 
      const moreDetailsMessage = language === 'hindi' ? localisedStrings.moreDetailsMessage:localisedStrings.moreDetailsMessage;

      const responseMessage = `**${selectedPose}**\n${moreDetailsMessage}\n\n**Steps**:\n\n${steps}\n\nWatch tutorial: ${videoUrl}`;

      const messageData = {
        to: from,
        type: 'button',
        button: {
          body: {
            type: 'text',
            text: {
              body: responseMessage,
            },
          },
          buttons: [
            {
              type: 'solid',
              body: localisedStrings.backToYogaPractices,
              reply: localisedStrings.backToYogaPractices,
            },
            {
              type: 'solid',
              body: localisedStrings.backToMainMenu,
              reply: localisedStrings.backToMainMenu,
            },
          ],
          allow_custom_response: false,
        },
      };
  
      return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
    }
  }


  async meditationSelection(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
   
    const messageData = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: localisedStrings.meditationstyle,
          },
        },
        buttons: [
          {
            type: 'solid',
            body: localisedStrings.stylebutton[0],
            reply: localisedStrings.stylebutton[0],
          },
          {
            type: 'solid',
            body: localisedStrings.stylebutton[1],
            reply: localisedStrings.stylebutton[1],
          },
          {
            type: 'solid',
            body: localisedStrings.stylebutton[2],
            reply: localisedStrings.stylebutton[2],
          },
          {
            type: 'solid',
            body: localisedStrings.stylebutton[3],
            reply: localisedStrings.stylebutton[3],
          }
        ],
        allow_custom_response: false,
      },
    };
  
    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }

    async sendMeditationDescription(from: string, selectedStyle: string, language: string) {
      const localisedStrings = LocalizationService.getLocalisedString(language);
       const meditationData = language === 'hindi' ? yogaDatahi : yogaDataEn;
      const normalizedPose = selectedStyle.trim();
   const meditationType = meditationData.meditation[normalizedPose];
  
      if (meditationType) {
          const description = meditationType.description; 
          const responseMessage = `**${selectedStyle}**: \n\n*${description}*`; 
  
          const messageData = {
              to: from,
              type: 'button',
              button: {
                  body: {
                      type: 'text',
                      text: {
                          body: responseMessage,
                      },
                  },
                  buttons: [
                      {
                          type: 'solid',
                          body: localisedStrings.moreDetailsmeditation, 
                          reply: localisedStrings.moreDetailsmeditation,
                      },
                      {
                          type: 'solid',
                          body: localisedStrings.mainMenu, 
                          reply: localisedStrings.mainMenu,
                      },
                  ],
                  allow_custom_response: false, 
              },
          };
  
          return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
      } 
  }
  

  async sendMoreMeditationDetails(from: string, selectedMeditation: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const meditationData = language === 'hindi' ? yogaDatahi : yogaDataEn;

    const normalizedMeditation = selectedMeditation.trim();

    const meditationType = meditationData.meditation[normalizedMeditation];

    if (meditationType) {
        const steps = meditationType.steps;
        const videoUrl = meditationType.videoUrl;

        const moreDetailsMessage = localisedStrings.moreDetailsMessage;

        const responseMessage = `**${selectedMeditation}**\n${moreDetailsMessage}\n\n**Steps**:\n\n${steps}\n\nWatch tutorial: ${videoUrl}`;

        const messageData = {
            to: from,
            type: 'button',
            button: {
                body: {
                    type: 'text',
                    text: {
                        body: responseMessage,
                    },
                },
                buttons: [
                    {
                        type: 'solid',
                        body: localisedStrings.backToMeditationPractices,
                        reply: localisedStrings.backToMeditationPractices,
                    },
                    {
                        type: 'solid',
                        body: localisedStrings.backToMainMenu,
                        reply: localisedStrings.backToMainMenu,
                    },
                ],
                allow_custom_response: false,
            },
        };

        return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
    }
}

  

  
  
  
    
    
    
   
    
}
 

  

 
