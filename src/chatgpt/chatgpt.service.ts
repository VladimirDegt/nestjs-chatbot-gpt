import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable()
export class ChatgptService {
    private readonly logger = new Logger(ChatgptService.name);
    private apiUrl: string;

    constructor(
        private configService: ConfigService,
        private httpService: HttpService,
    ) {
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    }

    generateResponse(question: string): Observable<string> {
        const apiKey = this.configService.get('CHATGPT_API_KEY');
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        };

        const prompt = `I learn English. I want to have a conversation with you. You should check my sentences and give me correct variant. After that you should to continue the conversation with me  ${question}`;

        const data = {
            model: 'gpt-4o-mini',
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