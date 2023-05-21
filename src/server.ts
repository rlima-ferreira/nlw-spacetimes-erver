import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fstatic from '@fastify/static';
import 'dotenv/config';
import fastify from 'fastify';
import { resolve } from 'path';
import { authRoutes } from './routes/auth';
import { memoriesRoutes } from './routes/memories';
import { uploadRoutes } from './routes/upload';

const app = fastify();

// Settings
app.register(cors, { origin: true });
app.register(jwt, { secret: 'spacetime' });
app.register(multipart);
app.register(fstatic, {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
});

// Routes
app.register(memoriesRoutes);
app.register(authRoutes);
app.register(uploadRoutes);

app
  .listen({ port: 3333, host: '0.0.0.0' })
  .then(() => console.log('Server listening'));
