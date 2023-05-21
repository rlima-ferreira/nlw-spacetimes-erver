import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';
import { createWriteStream } from 'fs';
import { extname, resolve } from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pump = promisify(pipeline);

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (req, reply) => {
    const data = await req.file({
      limits: {
        fileSize: 5_242_880, // 5mb
      },
    });
    if (!data) return reply.status(400).send();
    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/;
    const isValidFileFormat = mimeTypeRegex.test(data.mimetype);
    if (!isValidFileFormat) return reply.status(400).send();
    const fileId = randomUUID();
    const ext = extname(data.filename);
    const filename = fileId.concat(ext);
    const writeStream = createWriteStream(
      resolve(__dirname, '../../uploads', filename)
    );
    await pump(data.file, writeStream);
    const fullUrl = req.protocol.concat('://').concat(req.hostname);
    const fileUrl = new URL(`/uploads/${filename}`, fullUrl).toString();
    return { fileUrl };
  });
}
