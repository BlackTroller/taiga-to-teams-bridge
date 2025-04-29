// middleware.js
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// URL do Incoming Webhook do Teams
typeof process.env.TEAMS_WEBHOOK_URL === 'undefined' && console.error('Falta a variável TEAMS_WEBHOOK_URL');
const TEAMS_WEBHOOK_URL = process.env.TEAMS_WEBHOOK_URL;

// Secret para autenticar o webhook (colocado no path da URL)
typeof process.env.WEBHOOK_SECRET === 'undefined' && console.error('Falta a variável WEBHOOK_SECRET');
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

app.post(`/taiga-webhook/${WEBHOOK_SECRET}`, async (req, res) => {
  const payload = req.body;
  const user = payload?.data?.assigned_to_extra_info?.full_name_display || 'alguém';
  const title = payload?.data?.subject || 'Atualização';
  const description = payload?.data?.description || '';

  const message = {
    text: `📌 *${title}* foi atualizado por **${user}**\n\n${description}`
  };

  try {
    await axios.post(TEAMS_WEBHOOK_URL, message);
    res.sendStatus(200);
  } catch (error) {
    console.error('Erro ao enviar para Teams:', error.message);
    res.status(500).send('Erro ao enviar para Teams');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Middleware Taiga→Teams ativo na porta ${PORT}`);
  console.log(`Endpoint para webhook: /taiga-webhook/${WEBHOOK_SECRET}`);
});
