import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, catchError, map, of, tap } from 'rxjs';

interface ChatGptAnswer {
    id: string;
    object: string;
    created: number;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    choices: {
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
        index: number;
    }[];
}

@Injectable()
export class ChatgptService {
    private readonly logger = new Logger(ChatgptService.name);
    private apiUrl: string;

    constructor(private configService: ConfigService, private httpService: HttpService) {
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    }

    generateResponse(question: string): Observable<string> {
        const apiKey = this.configService.get('CHATGPT_API_KEY');
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        };

        const prompt = `Ти мій помічник з вивчення англійської мови. Я тобі буду писати текст на англійській мові, а ти перевіряй граматику та якщо будуть помилки, то пиши виправлений текст англійською. Після кожного свого речення на англійській надавай транскрипцію цього речення. Після цього задавай мені питання для підтримки бесіди.  ${question}`;

        const data = {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
        };

        return this.httpService.post(this.apiUrl, data, { headers }).pipe(
            tap(() => this.logger.log('Request sent to OpenAI API')),
            map(response => {
                const choices = response.data.choices;
                const usage = response.data.usage;
                if (choices && choices.length > 0) {
                    this.logger.log(`Tokens used: ${usage.total_tokens}`);
                    return choices[0].message.content;
                } else {
                    throw new Error('No choices returned from OpenAI API');
                }
            }),
            catchError(error => {
                const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
                this.logger.error(`Error occurred while fetching response from OpenAI API: ${errorMessage}`);
                return of(`Error occurred while fetching response from OpenAI API: ${errorMessage}`);
            })
        );
    }
}