import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req) => {
    await req.jwtVerify();
  });

  app.get('/memories', async (req) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: req.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return memories.map((memory) => ({
      ...memory,
      excerpt: memory.content.substring(0, 115).concat('...'),
    }));
  });

  app.get('/memories/:id', async (req, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = paramsSchema.parse(req.params);
    const memory = await prisma.memory.findUniqueOrThrow({
      where: { id },
    });
    if (!memory.isPublic && memory.userId !== req.user.sub)
      return reply.status(401).send();
    return memory;
  });

  app.post('/memories', async (req) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    });
    const data = bodySchema.parse(req.body);
    const memory = await prisma.memory.create({
      data: { ...data, userId: req.user.sub },
    });
    return memory;
  });

  app.put('/memories/:id', async (req, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    });
    const { id } = paramsSchema.parse(req.params);
    const data = bodySchema.parse(req.body);
    let memory = await prisma.memory.findUniqueOrThrow({
      where: { id },
    });
    if (!memory.isPublic && memory.userId !== req.user.sub)
      return reply.status(401).send();
    memory = await prisma.memory.update({
      where: { id },
      data,
    });
    return memory;
  });

  app.delete('/memories/:id', async (req, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = paramsSchema.parse(req.params);
    const memory = await prisma.memory.findUniqueOrThrow({
      where: { id },
    });
    if (!memory.isPublic && memory.userId !== req.user.sub)
      return reply.status(401).send();
    await prisma.memory.delete({
      where: { id },
    });
  });
}
