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
      localisedStrings.languageChangedMessage, // Use localized string for language change confirmation
    );

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
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
            body: localisedStrings.poseButtons[1],
            reply: localisedStrings.poseButtons[1],
          },
          {
            type: 'solid',
            body: localisedStrings.poseButtons[2],
            reply: localisedStrings.poseButtons[2],
          },
          {
            type: 'solid',
            body: localisedStrings.poseButtons[3],
            reply: localisedStrings.poseButtons[3],
          },
          {
            type: 'solid',
            body: localisedStrings.poseButtons[4],
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
        const responseMessage = `**${selectedPose}🧘‍♂️**: \n\n📝${description}`;
  
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

    async sendYogaVideo(from: string, videoUrl: string, language: string) {
      const localisedStrings = LocalizationService.getLocalisedString(language);
  
      const videoMessageData = {
          to: from,
          type: 'text',
          text: {
              body: `${localisedStrings.watchTutorial} ${videoUrl}`,
          },
      };
  
      await this.sendMessage(this.baseUrl, videoMessageData, this.apiKey);
  }
  
  async sendMoreYogaDetails(from: string, selectedPose: string, language: string) {
      const localisedStrings = LocalizationService.getLocalisedString(language);
      const yogaData = language === 'hindi' ? yogaDatahi : yogaDataEn; 
      const normalizedPose = selectedPose.trim().toLowerCase();
  
      const yogaType = yogaData.yoga[normalizedPose];
      
      if (yogaType) {
          const steps = yogaType.steps; 
          const videoUrl = yogaType.videoUrl; 
  
          const responseMessage = `**${selectedPose}** 🧘‍♂️\n${localisedStrings.moreDetailsMessage}\n\n${localisedStrings.steps}\n\n${steps}`;
  
          const stepsMessageData = {
              to: from,
              type: 'text',
              text: {
                  body: responseMessage,
              },
          };
          
          await this.sendMessage(this.baseUrl, stepsMessageData, this.apiKey);
  
          await this.sendYogaVideo(from, videoUrl, language);
  
          const buttonMessageData = {
              to: from,
              type: 'button',
              button: {
                  body: {
                      type: 'text',
                      text: {
                          body: localisedStrings.selectOption,  // Adding a prompt for button selection
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
          await this.sendMessage(this.baseUrl, buttonMessageData, this.apiKey);
      } else {
          console.error(`Yoga type not found for the selected pose: ${selectedPose}`);
          throw new Error('Invalid yoga pose selected.');
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
        const responseMessage = `**🧘‍♂️${selectedStyle}**: \n\n📝${description}`; 

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
/* 
async sendMoreMeditationDetails(from: string, selectedMeditation: string, language: string) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  const meditationData = language === 'hindi' ? yogaDatahi : yogaDataEn;

  const normalizedMeditation = selectedMeditation.trim();

  const meditationType = meditationData.meditation[normalizedMeditation];

  if (meditationType) {
      const steps = meditationType.steps;
      const videoUrl = meditationType.videoUrl;

      const moreDetailsMessage = localisedStrings.moreDetailsMessage;

      const responseMessage = `**${selectedMeditation}**🧘‍♂️\n${moreDetailsMessage}\n\n**${localisedStrings.steps}**\n\n${steps}\n\n${localisedStrings.watchTutorial} ${videoUrl}`;

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
 
 */
async sendMeditationVideo(from: string, videoUrl: string, language: string) {
  const localisedStrings = LocalizationService.getLocalisedString(language);

  // Prepare the video message data
  const videoMessageData = {
      to: from,
      type: 'text',
      text: {
          body: `${localisedStrings.watchTutorial} ${videoUrl}`,
      },
  };

  // Send the video message
  await this.sendMessage(this.baseUrl, videoMessageData, this.apiKey);
}
async sendMoreMeditationDetails(from: string, selectedMeditation: string, language: string) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  const meditationData = language === 'hindi' ? yogaDatahi : yogaDataEn;

  // Normalize the selected meditation name (trim spaces)
  const normalizedMeditation = selectedMeditation.trim();

  // Get the corresponding meditation data
  const meditationType = meditationData.meditation[normalizedMeditation];

  if (meditationType) {
      const steps = meditationType.steps; // Get meditation steps
      const videoUrl = meditationType.videoUrl; // Get video URL for meditation

      const moreDetailsMessage = localisedStrings.moreDetailsMessage;

      // Prepare the response message with meditation details and steps
      const responseMessage = `**${selectedMeditation}** 🧘‍♂️\n${moreDetailsMessage}\n\n**${localisedStrings.steps}**\n\n${steps}`;

      // Prepare the message with meditation steps
      const stepsMessageData = {
          to: from,
          type: 'text',
          text: {
              body: responseMessage,
          },
      };

      // Send the meditation steps message
      await this.sendMessage(this.baseUrl, stepsMessageData, this.apiKey);

      // Now send the meditation video
      await this.sendMeditationVideo(from, videoUrl, language);

      // Prepare the button message
      const buttonMessageData = {
          to: from,
          type: 'button',
          button: {
              body: {
                  type: 'text',
                  text: {
                      body: localisedStrings.selectOption, // Prompt for button selection
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
              allow_custom_response: false, // Only allow predefined responses
          },
      };

      // Send the button message after the video
      await this.sendMessage(this.baseUrl, buttonMessageData, this.apiKey);
  } else {
      console.error(`Meditation type not found for the selected meditation: ${selectedMeditation}`);
      throw new Error('Invalid meditation type selected.');
  }
}


async sendRandomYogaMeditationTip(from: string, language: string) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  const yogaData = language === 'hindi' ? yogaDatahi : yogaDataEn;

  const tips = yogaData.yoga_meditation_tips;
  const randomIndex = Math.floor(Math.random() * tips.length);
  const selectedTip = tips[randomIndex];

  const responseMessage = `***💡${selectedTip.tip}✨***\n\n **📜${selectedTip.description}✨**`;

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
          body: localisedStrings.backToMainMenu,
          reply: localisedStrings.backToMainMenu,
        },
      ],
      allow_custom_response: false,
    },
  };
  return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
}

  async sendTextMessage(from: string, language: string) {
    const userLanguage = LocalizationService.getLocalisedString(language);
    const message = userLanguage.askingQusetion;
    const messageData = {
      to: from,
      type: 'text',
      text: {
        body: message,
      },
    };
    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }
  async sendResponseToTheUSer(from: string, res:string,language: string) {
    const userLanguage = LocalizationService.getLocalisedString(language);
    const message = userLanguage.askingQusetion;
    const messageData = {
      to: from,
      type: 'text',
      text: {
        body: res,
      },
    };
    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }
}
