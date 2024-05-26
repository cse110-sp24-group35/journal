import staticPlugin from '@fastify/static';
import path from 'path';
import Fastify from 'fastify';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let server;

const fastify = new Fastify();

fastify.register(staticPlugin, {
    root: path.join(__dirname, "./src")
});

server = fastify;
await server.listen({
    port: 4321
});