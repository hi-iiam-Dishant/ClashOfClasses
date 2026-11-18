const pool = require('../db');

async function checkCollision({
  teacherId,
  roomId,
  dayOfWeek,
  startTime,
  endTime,
  academicYear,
  semesterTerm,
  excludeBlockId = null
}) {
  const [rows] = await pool.execute(
    `CALL check_collision(?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      teacherId,
      roomId,
      dayOfWeek,
      startTime,
      endTime,
      academicYear,
      semesterTerm,
      excludeBlockId
    ]
  );

  // CALL returns multiple result sets; the useful one is the first
  const result = rows[0][0];
  return result;
}

module.exports = { checkCollision };