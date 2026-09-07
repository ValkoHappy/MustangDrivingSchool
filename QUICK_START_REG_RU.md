# Быстрый запуск MustangSuit на REG.RU

1. В Shell-клиенте REG.RU однократно клонируйте проект, сохранив существующий `.env`:

```bash
set -e
SITE="$HOME/www/mustang-29.ru"
BACKUP="${SITE}.backup.$(date +%Y%m%d-%H%M%S)"
test -f "$SITE/.env"
mv "$SITE" "$BACKUP"
git clone https://github.com/ValkoHappy/MustangDrivingSchool.git "$SITE"
cp "$BACKUP/.env" "$SITE/.env"
chmod 600 "$SITE/.env"
```

2. Откройте `.env` в корне сайта и укажите:

```env
VK_ACCESS_TOKEN=токен_сообщества_ВК
VK_PEER_ID=2000000001
VK_API_VERSION=5.199
START_DATE=ОТКРЫТ
```

3. Включите PHP 7.4+ и cURL в панели REG.RU.
4. Включите SSL Let's Encrypt.
5. Добавьте сообщество в целевую беседу ВК и разрешите сообщения.
6. Проверьте `/api/get-start-date` и отправьте одну тестовую заявку.
7. Убедитесь, что `.env` и `.git` недоступны из браузера.

Дальше после каждого изменения достаточно выполнить:

```bash
cd "$HOME/www/mustang-29.ru" && git pull --ff-only
```

Подробности и диагностика находятся в `DEPLOY_REG_RU.md`.
