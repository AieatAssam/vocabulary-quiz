export interface VocabularyOpenAIResponse {
  vocabulary: Array<{
    word: string;
    definitions: string[];
  }>;
}