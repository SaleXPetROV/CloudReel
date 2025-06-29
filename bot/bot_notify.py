import os
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters

TOKEN = '8026956834:AAFe7fCon-0zJNzhkRxIxd3xlHn_lkIrhkM'
SITE_URL = 'https://cloudreel.netlify.app'
USERS_FILE = 'bot/users.txt'

def save_user(user_id):
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    users = set()
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            users = set(line.strip() for line in f)
    users.add(str(user_id))
    with open(USERS_FILE, 'w') as f:
        for uid in users:
            f.write(f"{uid}\n")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    save_user(user_id)
    await update.message.reply_text(f"Бот запущен! Вот ссылка на сайт: {SITE_URL}")

async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    save_user(user_id)

async def notify_all(application: Application):
    if not os.path.exists(USERS_FILE):
        print("Нет пользователей для рассылки.")
        return
    with open(USERS_FILE, 'r') as f:
        users = set(line.strip() for line in f)
    for uid in users:
        try:
            await application.bot.send_message(chat_id=uid, text=f"Бот запущен! Вот ссылка на сайт: {SITE_URL}")
        except Exception as e:
            print(f"Не удалось отправить {uid}: {e}")

async def on_startup(application: Application):
    await notify_all(application)

def main():
    application = Application.builder().token(TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))
    application.post_init = on_startup
    application.run_polling()

if __name__ == '__main__':
    main() 