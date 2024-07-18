import { Command, Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { Scenes, Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { ChatgptService } from '../chatgpt/chatgpt.service';

type Context = Scenes.SceneContext;
@Update()
export class TelegramService extends Telegraf<Context> {
    constructor(
        private readonly configService: ConfigService,
        private readonly gpt: ChatgptService,
    ) {
        super(configService.get('TELEGRAM_BOT_TOKEN'));
    }
    @Start()
    onStart(@Ctx() ctx: Context) {
        ctx.replyWithHTML(`<b>Hi, ${ctx.from.username}</b>
            Це чат бот з GPT!
            Він налаштований для спілкування та перевірки граматики англійської мови.
        `);
    }

    @Command('end')
    async onEnd(@Ctx() ctx: Context) {
        ctx.reply('Бесіда завершена. Якщо у вас ще будуть питання, просто напишіть знову!');
        await ctx.leaveChat();
    }

    @On('text')
    onMessage(@Message('text') message: string) {
        return this.gpt.generateResponse(message);
    }
}
