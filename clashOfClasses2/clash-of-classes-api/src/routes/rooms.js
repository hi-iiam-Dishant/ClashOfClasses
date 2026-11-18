const pool = require('../db');

async function roomsRoutes(fastify) {

  fastify.get('/', async () => {
    const [rows] = await pool.execute(
      `SELECT * FROM rooms WHERE is_active = 1 ORDER BY building, room_number`
    );
    return rows;
  });

  fastify.get('/:id', async (request, reply) => {
    const [rows] = await pool.execute(`SELECT * FROM rooms WHERE room_id = ?`, [request.params.id]);
    if (rows.length === 0) return reply.status(404).send({ error: 'Room not found' });
    return rows[0];
  });

  fastify.post('/', async (request, reply) => {
    const { roomNumber, building, floor, mapXCoord = 0, mapYCoord = 0, roomType = 'CLASSROOM', capacity = 60 } = request.body;

    const [result] = await pool.execute(
      `INSERT INTO rooms (room_number, building, floor, map_x_coord, map_y_coord, room_type, capacity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [roomNumber, building || null, floor || null, mapXCoord, mapYCoord, roomType, capacity]
    );

    return reply.status(201).send({ roomId: result.insertId });
  });

  fastify.put('/:id', async (request, reply) => {
    const { roomNumber, building, floor, mapXCoord, mapYCoord, roomType, capacity, isActive } = request.body;

    await pool.execute(
      `UPDATE rooms SET
         room_number = COALESCE(?, room_number),
         building = COALESCE(?, building),
         floor = COALESCE(?, floor),
         map_x_coord = COALESCE(?, map_x_coord),
         map_y_coord = COALESCE(?, map_y_coord),
         room_type = COALESCE(?, room_type),
         capacity = COALESCE(?, capacity),
         is_active = COALESCE(?, is_active)
       WHERE room_id = ?`,
      [roomNumber, building, floor, mapXCoord, mapYCoord, roomType, capacity, isActive, request.params.id]
    );

    return { message: 'Room updated' };
  });

  fastify.delete('/:id', async (request) => {
    await pool.execute(`UPDATE rooms SET is_active = 0 WHERE room_id = ?`, [request.params.id]);
    return { message: 'Room deactivated' };
  });
}

module.exports = roomsRoutes;