import {Ctx, Message, On, Start, Update} from "nestjs-telegraf";
import {Scenes, Telegraf} from "telegraf";

type Context = Scenes.SceneContext;
@Update()
export class TelegramService extends Telegraf<Context> {
    @Start()
    onStart(@Ctx() ctx: Context) {
        ctx.replyWithHTML(`<b>Hi, ${ctx.from.username}</b>
Це чат бот з GPT!
Введіть ваше повідомлення та отримайте відповідь
        `);
    }
    @On('text')
    onMessage(@Message('text') message: string, @Ctx() ctx: Context) {
        ctx.replyWithHTML(`<i>${message}</i>`);
    }
}
