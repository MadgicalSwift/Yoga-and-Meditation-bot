// src/ai-bot/ai-bot.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiBotService {
  async getYogaRecommendation(question,chat_history,summary_old): Promise<any> {
    console.log(question)
    const url = 'http://bots-genai-1457228795.ap-south-1.elb.amazonaws.com/genai_bot/v1/get-yoga';
    const payload = {
      chat_history:chat_history,
      question: question,
      summary_old: summary_old,
      bot_name: "YogaGuru"
    };
console.log("paylod",payload)
    try {
      const data = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return data.data;  // Return the response data
    } catch (error) {
      console.error('Error calling Yoga API:', error);
    }
  }
}
