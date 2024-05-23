import {Ctx, Message, On, Start, Update} from "nestjs-telegraf";
import {Scenes, Telegraf} from "telegraf";
import {ConfigService} from "@nestjs/config";
import {ChatgptService} from "../chatgpt/chatgpt.service";

type Context = Scenes.SceneContext;
@Update()
export class TelegramService extends Telegraf<Context> {
    constructor( private readonly configService: ConfigService, private readonly gpt: ChatgptService) {
        super(configService.get('TELEGRAM_BOT_TOKEN'));
    }
    @Start()
    onStart(@Ctx() ctx: Context) {
        ctx.replyWithHTML(`<b>Hi, ${ctx.from.username}</b>
Це чат бот з GPT!
Введіть ваше повідомлення та отримайте відповідь
        `);
    }
    @On('text')
    onMessage(@Message('text') message: string) {
        return this.gpt.generateResponse(message)
    }
}
