import app from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`🚀 Serveur démarré sur le port ${config.port}`);
  console.log(`📍 Environnement: ${config.nodeEnv}`);
});
