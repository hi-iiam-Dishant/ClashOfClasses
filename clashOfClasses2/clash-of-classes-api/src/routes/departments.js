const pool = require('../db');

async function departmentsRoutes(fastify) {

  // Get all departments
  fastify.get('/', async () => {
    const [rows] = await pool.execute(
      `SELECT d.*, 
              t.first_name AS hod_first_name, 
              t.last_name AS hod_last_name
       FROM departments d
       LEFT JOIN teachers t ON d.hod_teacher_id = t.teacher_id
       WHERE d.is_active = 1
       ORDER BY d.department_name`
    );
    return rows;
  });

  // Get single department
  fastify.get('/:id', async (request, reply) => {
    const [rows] = await pool.execute(
      `SELECT d.*, 
              t.first_name AS hod_first_name, 
              t.last_name AS hod_last_name
       FROM departments d
       LEFT JOIN teachers t ON d.hod_teacher_id = t.teacher_id
       WHERE d.department_id = ?`,
      [request.params.id]
    );
    if (rows.length === 0) return reply.status(404).send({ error: 'Department not found' });
    return rows[0];
  });

  // Create department
  fastify.post('/', async (request, reply) => {
    const { departmentName, hodTeacherId = null } = request.body;

    const [result] = await pool.execute(
      `INSERT INTO departments (department_name, hod_teacher_id) VALUES (?, ?)`,
      [departmentName, hodTeacherId]
    );

    return reply.status(201).send({ departmentId: result.insertId });
  });

  // Update department
  fastify.put('/:id', async (request, reply) => {
    const { departmentName, hodTeacherId, isActive } = request.body;

    await pool.execute(
      `UPDATE departments SET
         department_name = COALESCE(?, department_name),
         hod_teacher_id = COALESCE(?, hod_teacher_id),
         is_active = COALESCE(?, is_active)
       WHERE department_id = ?`,
      [departmentName, hodTeacherId, isActive, request.params.id]
    );

    return { message: 'Department updated' };
  });

  // Soft delete
  fastify.delete('/:id', async (request) => {
    await pool.execute(
      `UPDATE departments SET is_active = 0 WHERE department_id = ?`,
      [request.params.id]
    );
    return { message: 'Department deactivated' };
  });
}

module.exports = departmentsRoutes;