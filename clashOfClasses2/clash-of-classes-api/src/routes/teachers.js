const pool = require('../db');

async function teachersRoutes(fastify) {

  // Get all teachers
  fastify.get('/', async () => {
    const [rows] = await pool.execute(
      `SELECT t.*, d.department_name 
       FROM teachers t
       LEFT JOIN departments d ON t.department_id = d.department_id
       WHERE t.is_active = 1
       ORDER BY t.first_name, t.last_name`
    );
    return rows;
  });

  // Get single teacher
  fastify.get('/:id', async (request, reply) => {
    const [rows] = await pool.execute(
      `SELECT t.*, d.department_name 
       FROM teachers t
       LEFT JOIN departments d ON t.department_id = d.department_id
       WHERE t.teacher_id = ?`,
      [request.params.id]
    );
    if (rows.length === 0) return reply.status(404).send({ error: 'Teacher not found' });
    return rows[0];
  });

  // Create teacher
  fastify.post('/', async (request, reply) => {
    const { firstName, lastName, email, phone, departmentId, maxWeeklyHours = 20 } = request.body;

    const [result] = await pool.execute(
      `INSERT INTO teachers (first_name, last_name, email, phone, department_id, max_weekly_hours)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, phone || null, departmentId || null, maxWeeklyHours]
    );

    return reply.status(201).send({ teacherId: result.insertId });
  });

  // Update teacher
  fastify.put('/:id', async (request, reply) => {
    const { firstName, lastName, email, phone, departmentId, maxWeeklyHours, isActive } = request.body;

    await pool.execute(
      `UPDATE teachers SET 
         first_name = COALESCE(?, first_name),
         last_name = COALESCE(?, last_name),
         email = COALESCE(?, email),
         phone = COALESCE(?, phone),
         department_id = COALESCE(?, department_id),
         max_weekly_hours = COALESCE(?, max_weekly_hours),
         is_active = COALESCE(?, is_active)
       WHERE teacher_id = ?`,
      [firstName, lastName, email, phone, departmentId, maxWeeklyHours, isActive, request.params.id]
    );

    return { message: 'Teacher updated' };
  });

  // Soft delete
  fastify.delete('/:id', async (request) => {
    await pool.execute(`UPDATE teachers SET is_active = 0 WHERE teacher_id = ?`, [request.params.id]);
    return { message: 'Teacher deactivated' };
  });
}

module.exports = teachersRoutes;