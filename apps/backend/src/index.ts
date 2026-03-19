import { createApp } from './app.js';
import { config } from '@infrastructure/config/index.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[ERP-RH] Serveur démarré sur le port ${config.port}`);
  console.log(`[ERP-RH] API disponible sur http://localhost:${config.port}/api/v1`);
  console.log(`[ERP-RH] Environnement: ${process.env.NODE_ENV || 'development'}`);
});
