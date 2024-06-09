import staticPlugin from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify();

fastify.register(staticPlugin, {
    root: path.join(__dirname, "./src") // Adjust the path to your project's root if needed
});

const PORT = 1234;

const server = fastify;
await server.listen({
    port: PORT
});

console.log(`A development server is up at http://localhost:${PORT}`);