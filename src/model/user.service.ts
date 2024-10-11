import { Injectable } from '@nestjs/common';
import { User } from './user.entity'; // Make sure User entity is defined correctly
import { dynamoDBClient } from 'src/config/database-config.service';
import { v4 as uuidv4 } from 'uuid';

const { USERS_TABLE } = process.env;

@Injectable()
export class UserService {
  async createUser(
    mobileNumber: string,
    language: string,
    botID: string,
  ): Promise<User | any> {
    try {
      const newUser = {
        id: uuidv4(),
        mobileNumber: mobileNumber,
        language: language,
        Botid: botID,
        chat_history: [],        // Initialize chat history as an empty array
        chat_summary: '',        // Initialize chat summary as an empty string
      };

      const params = {
        TableName: USERS_TABLE,
        Item: newUser,
      };
      await dynamoDBClient().put(params).promise();
      return newUser; // Return just the user object
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error; // Consider throwing the error for handling elsewhere
    }
  }

  async findUserByMobileNumber(
    mobileNumber: string,
    Botid: string,
  ): Promise<User | any> {
    try {
      const params = {
        TableName: USERS_TABLE,
        KeyConditionExpression:
          'mobileNumber = :mobileNumber and Botid = :Botid',
        ExpressionAttributeValues: {
          ':mobileNumber': mobileNumber,
          ':Botid': Botid,
        },
      };
      const result = await dynamoDBClient().query(params).promise();
      return result.Items?.[0] || null; // Return the first item or null if none found
    } catch (error) {
      console.error('Error querying user from DynamoDB:', error);
      return null;
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      const updateUser = {
        TableName: USERS_TABLE,
        Item: {
          mobileNumber: user.mobileNumber,
          language: user.language,
          Botid: user.Botid,
          chat_history: user.chat_history,   // Save chat history
          chat_summary: user.chat_summary,   // Save chat summary
        },
      };
      await dynamoDBClient().put(updateUser).promise(); // Save the user
    } catch (error) {
      console.error('Error saving user to DynamoDB:', error);
    }
  }

  // New method to update chat history and summary for a user
  async updateUserHistory(
    mobileNumber: string,
    Botid: string,
    chat_history: any[],
    chat_summary: string,
  ): Promise<void> {
    try {
      const params = {
        TableName: USERS_TABLE,
        Key: {
          mobileNumber: mobileNumber,
          Botid: Botid,
        },
        UpdateExpression: 'set chat_history = :chat_history, chat_summary = :chat_summary',
        ExpressionAttributeValues: {
          ':chat_history': chat_history,
          ':chat_summary': chat_summary,
        },
      };
      await dynamoDBClient().update(params).promise();
    
    } catch (error) {
      console.error('Error updating user history in DynamoDB:', error);
    }
  }

  async deleteUser(mobileNumber: string, Botid: string): Promise<void> {
    try {
      const params = {
        TableName: USERS_TABLE,
        Key: {
          mobileNumber: mobileNumber,
          Botid: Botid,
        },
      };
      await dynamoDBClient().delete(params).promise();
      console.log(
        `User with mobileNumber ${mobileNumber} and Botid ${Botid} deleted successfully.`,
      );
    } catch (error) {
      console.error('Error deleting user from DynamoDB:', error);
    }
  }
}
