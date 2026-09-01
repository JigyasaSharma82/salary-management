import { env } from './config/env.js';
import { createApp } from './app.js';
import { prisma } from './lib/prisma.js';

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    createApp().listen(env.PORT, () => {
      console.log(`Salary Management API listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

startServer();