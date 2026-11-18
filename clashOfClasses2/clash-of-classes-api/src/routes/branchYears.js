const pool = require('../db');

async function branchYearsRoutes(fastify) {

  fastify.get('/', async () => {
    const [rows] = await pool.execute(
      `SELECT * FROM branch_years WHERE is_active = 1 ORDER BY branch_name, semester, section`
    );
    return rows;
  });

  fastify.post('/', async (request, reply) => {
    const { branchName, semester, section = 'A' } = request.body;

    const [result] = await pool.execute(
      `INSERT INTO branch_years (branch_name, semester, section) VALUES (?, ?, ?)`,
      [branchName, semester, section]
    );

    return reply.status(201).send({ branchYearId: result.insertId });
  });

  fastify.put('/:id', async (request, reply) => {
    const { branchName, semester, section, isActive } = request.body;

    await pool.execute(
      `UPDATE branch_years SET
         branch_name = COALESCE(?, branch_name),
         semester = COALESCE(?, semester),
         section = COALESCE(?, section),
         is_active = COALESCE(?, is_active)
       WHERE branch_year_id = ?`,
      [branchName, semester, section, isActive, request.params.id]
    );

    return { message: 'Branch year updated' };
  });

  fastify.delete('/:id', async (request) => {
    await pool.execute(`UPDATE branch_years SET is_active = 0 WHERE branch_year_id = ?`, [request.params.id]);
    return { message: 'Branch year deactivated' };
  });
}

module.exports = branchYearsRoutes;