const pool = require('../db');

async function coursesRoutes(fastify) {

  fastify.get('/', async () => {
    const [rows] = await pool.execute(
      `SELECT c.*, d.department_name 
       FROM courses c
       JOIN departments d ON c.department_id = d.department_id
       WHERE c.is_active = 1
       ORDER BY c.course_code`
    );
    return rows;
  });

  fastify.post('/', async (request, reply) => {
    const { courseCode, courseName, departmentId, weeklyLectures = 3 } = request.body;

    const [result] = await pool.execute(
      `INSERT INTO courses (course_code, course_name, department_id, weekly_lectures)
       VALUES (?, ?, ?, ?)`,
      [courseCode, courseName, departmentId, weeklyLectures]
    );

    return reply.status(201).send({ courseId: result.insertId });
  });

  fastify.put('/:id', async (request, reply) => {
    const { courseCode, courseName, departmentId, weeklyLectures, isActive } = request.body;

    await pool.execute(
      `UPDATE courses SET
         course_code = COALESCE(?, course_code),
         course_name = COALESCE(?, course_name),
         department_id = COALESCE(?, department_id),
         weekly_lectures = COALESCE(?, weekly_lectures),
         is_active = COALESCE(?, is_active)
       WHERE course_id = ?`,
      [courseCode, courseName, departmentId, weeklyLectures, isActive, request.params.id]
    );

    return { message: 'Course updated' };
  });

  fastify.delete('/:id', async (request) => {
    await pool.execute(`UPDATE courses SET is_active = 0 WHERE course_id = ?`, [request.params.id]);
    return { message: 'Course deactivated' };
  });
}

module.exports = coursesRoutes;