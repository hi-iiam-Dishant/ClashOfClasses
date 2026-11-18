const pool = require('../db');
const { checkCollision } = require('../services/collision');

async function timetableRoutes(fastify, options) {

  
  fastify.get('/', async (request, reply) => {
    const { academicYear = '2025-2026', semesterTerm = 1 } = request.query;

    const [rows] = await pool.execute(
      `SELECT tb.*, c.course_code, c.course_name,
              t.first_name, t.last_name,
              r.room_number, r.building
       FROM timetable_blocks tb
       JOIN courses c ON tb.course_id = c.course_id
       JOIN teachers t ON tb.teacher_id = t.teacher_id
       JOIN rooms r ON tb.room_id = r.room_id
       WHERE tb.academic_year = ? AND tb.semester_term = ? AND tb.is_active = 1
       ORDER BY FIELD(tb.day_of_week, 'MON','TUE','WED','THU','FRI','SAT'), tb.start_time`,
      [academicYear, semesterTerm]
    );

    return rows;
  });

  // Create a new timetable block (with collision check)
  fastify.post('/', async (request, reply) => {
    const {
      courseId,
      teacherId,
      roomId,
      dayOfWeek,
      startTime,
      endTime,
      academicYear = '2025-2026',
      semesterTerm = 1,
      groupIds = []          // array of branch_year_ids
    } = request.body;

    // 1. Collision check
    const conflict = await checkCollision({
      teacherId,
      roomId,
      dayOfWeek,
      startTime,
      endTime,
      academicYear,
      semesterTerm
    });

    if (conflict.total_conflicts > 0) {
      return reply.status(409).send({
        error: 'Collision detected',
        details: conflict
      });
    }

    // 2. Insert the block
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `INSERT INTO timetable_blocks 
         (course_id, teacher_id, room_id, day_of_week, start_time, end_time, academic_year, semester_term)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [courseId, teacherId, roomId, dayOfWeek, startTime, endTime, academicYear, semesterTerm]
      );

      const blockId = result.insertId;

      // 3. Link groups (merged classes)
      for (const groupId of groupIds) {
        await connection.execute(
          `INSERT INTO timetable_block_groups (block_id, branch_year_id) VALUES (?, ?)`,
          [blockId, groupId]
        );
      }

      await connection.commit();
      return reply.status(201).send({ blockId, message: 'Block created successfully' });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  });
}

module.exports = timetableRoutes;