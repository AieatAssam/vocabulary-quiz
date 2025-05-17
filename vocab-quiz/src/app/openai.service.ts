import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { OpenAI } from 'openai';

@Injectable({ providedIn: 'root' })
export class OpenAiService {
  private get openai() {
    return new OpenAI({
      apiKey: this.config.getApiKey(),
      baseURL: this.config.getEndpoint() || undefined,
      dangerouslyAllowBrowser: true,
    });
  }

  constructor(private config: ConfigurationService) {}

  /**
   * Extract vocabulary from an image using OpenAI vision models.
   * @param file Image file (JPG/PNG)
   * @returns Promise<string> - extracted text
   */
  async extractVocabularyFromImage(file: File): Promise<string> {
    const base64 = await this.fileToBase64(file);
    const model = this.config.getModel();
    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an OCR assistant. Extract the vocabulary table (words and definitions) from the image. Format as two columns: word, definition.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract the vocabulary table from this image.' },
              { type: 'image_url', image_url: { url: base64 } }
            ]
          }
        ],
        max_tokens: 2048
      });
      return response.choices[0]?.message?.content || '';
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to extract vocabulary.');
    }
  }

  /**
   * Generate a quiz from a vocabulary list using OpenAI.
   * @param vocabText The extracted vocabulary as text
   * @param quizType 'word', 'definition', or 'mixed'
   * @returns Promise<string> - quiz in text or JSON format
   */
  async generateQuiz(vocabText: string, quizType: 'word' | 'definition' | 'mixed'): Promise<string> {
    const model = this.config.getModel();
    let prompt = 'Generate a quiz from the following vocabulary list.';
    if (quizType === 'word') {
      prompt += ' Only ask for the word given the definition.';
    } else if (quizType === 'definition') {
      prompt += ' Only ask for the definition given the word.';
    } else {
      prompt += ' Mix both word and definition questions.';
    }
    prompt += ' Format the quiz as a numbered list.';
    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You are a quiz generator.' },
          { role: 'user', content: `${prompt}\n\n${vocabText}` }
        ],
        max_tokens: 2048
      });
      return response.choices[0]?.message?.content || '';
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to generate quiz.');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // OpenAI expects base64 data URLs
        if (!result.startsWith('data:')) {
          reject('Invalid file encoding');
        } else {
          resolve(result);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
} 