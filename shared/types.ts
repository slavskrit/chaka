export interface AudioToProcess {
  path: string;
  chatId: number;
  messageId: number;
  duration: number;
  text?: string;
}

export interface TextToImageProcess {
  chatId: number;
  messageId: number;
  queryText: string;
  imagePath?: string;
}

export interface TextToProcess {
  chatId: number;
  messageId: number;
  originalText?: string;
  markdownText?: string;
  emojis?: string[];
  title?: string[];
}
