module.exports = {
  apps: [
    {
      name        : 'notification-api',
      script      : 'index.js',
      instances   : 1,
      autorestart : true,
      watch       : false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV           : 'production',
        DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/1513152171745738944/XJM1E0JlkDZvHkVo36Q__tCIHL8WyU5vE_B_GnjS5YlFcGipDb5M0e3xp7l35DoZ0C5N',
      },
    },
  ],
};

