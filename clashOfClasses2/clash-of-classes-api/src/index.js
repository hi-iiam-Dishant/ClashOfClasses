const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
require('dotenv').config();

fastify.register(cors, { origin: true });
fastify.register(require('fastify-metrics'), {endpoint: '/metrics'});
// Routes
fastify.register(require('./routes/timetable'),   { prefix: '/api/timetable' });
fastify.register(require('./routes/teachers'),    { prefix: '/api/teachers' });
fastify.register(require('./routes/rooms'),       { prefix: '/api/rooms' });
fastify.register(require('./routes/courses'),     { prefix: '/api/courses' });
fastify.register(require('./routes/branchYears'), { prefix: '/api/branch-years' });
fastify.register(require('./routes/absences'),    { prefix: '/api/absences' });
fastify.register(require('./routes/departments'), { prefix: '/api/departments' });

fastify.get('/health', async () => ({ status: 'ok' }));

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    console.log('Server running');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
