import { env } from './config/env.js';
import { createApp } from './app.js';

createApp().listen(env.PORT, () => {
  console.log(`Salary Management API listening on port ${env.PORT}`);
});
