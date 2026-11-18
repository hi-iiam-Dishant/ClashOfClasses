const pool = require('../db');

async function absencesRoutes(fastify) {

  // Get all absences (optionally filter by date or teacher)
  fastify.get('/', async (request) => {
    const { teacherId, date, status } = request.query;
    let sql = `
      SELECT a.*, 
             t1.first_name AS absent_first_name, t1.last_name AS absent_last_name,
             t2.first_name AS substitute_first_name, t2.last_name AS substitute_last_name
      FROM absences a
      JOIN teachers t1 ON a.absent_teacher_id = t1.teacher_id
      LEFT JOIN teachers t2 ON a.substitute_teacher_id = t2.teacher_id
      WHERE 1=1
    `;
    const params = [];

    if (teacherId) {
      sql += ` AND a.absent_teacher_id = ?`;
      params.push(teacherId);
    }
    if (date) {
      sql += ` AND a.absence_date = ?`;
      params.push(date);
    }
    if (status) {
      sql += ` AND a.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY a.absence_date DESC`;

    const [rows] = await pool.execute(sql, params);
    return rows;
  });

  // Create absence
  fastify.post('/', async (request, reply) => {
    const {
      absentTeacherId,
      substituteTeacherId = null,
      blockId = null,
      absenceDate,
      endDate = null,
      reason = null,
      notes = null,
      createdBy = null
    } = request.body;

    const [result] = await pool.execute(
      `INSERT INTO absences 
       (absent_teacher_id, substitute_teacher_id, block_id, absence_date, end_date, reason, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [absentTeacherId, substituteTeacherId, blockId, absenceDate, endDate, reason, notes, createdBy]
    );

    return reply.status(201).send({ absenceId: result.insertId });
  });

  // Update absence (mainly for assigning substitute + changing status)
  fastify.put('/:id', async (request, reply) => {
    const { substituteTeacherId, status, notes } = request.body;

    await pool.execute(
      `UPDATE absences SET
         substitute_teacher_id = COALESCE(?, substitute_teacher_id),
         status = COALESCE(?, status),
         notes = COALESCE(?, notes)
       WHERE absence_id = ?`,
      [substituteTeacherId, status, notes, request.params.id]
    );

    return { message: 'Absence updated' };
  });
}

module.exports = absencesRoutes;