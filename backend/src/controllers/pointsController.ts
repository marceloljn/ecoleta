import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
  async index(req: Request, res: Response) {
    const { city, uf, items } = req.query;

    const parsedItems = items
      ? String(items)
          .split(',')
          .map((item) => Number(item.trim()))
      : [];

    const query = knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    if (parsedItems.length > 0) {
      query.whereIn('point_items.item_id', parsedItems);
    }

    const points = await query;

    const serializedPoints = points.map((point) => {
      return {
        ...point,
        image_url: `http://192.168.0.163:3333/uploads/${point.image}`,
      };
    });

    return res.json(serializedPoints);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return res.status(400).json({ message: 'Point not found' });
    }

    const serializedPoint = {
      ...point,
      image_url: `http://192.168.0.163:3333/uploads/${point.image}`,
    };

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', serializedPoint.id)
      .select('items.title');

    return res.json({ point: serializedPoint, items });
  }

  async create(req: Request, res: Response) {
    // console.log(req.body);

    const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body;

    const trx = await knex.transaction();
    let point = null;

    try {
      // console.log('salvando na base');
      // console.log(`dados: ${JSON.stringify({ name, email, whatsapp, latitude, longitude, city, uf, items }, null, 2)}`);

      point = {
        image: req.file.filename,
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf,
      };

      const insertedIds = await trx('points').insert(point);

      const point_id = insertedIds[0];
      const pointItems = items
        .split(',')
        .map((item: string) => Number(item.trim()))
        .map((item_id: number) => {
          return {
            item_id,
            point_id,
          };
        });

      await trx('point_items').insert(pointItems);

      console.log('concluída inserção');

      await trx.commit();

      point = { point_id, ...point };
    } catch (error) {
      console.log('error: ' + error);
      await trx.rollback();
      return res.status(500).send({ error });
    }

    return res.status(201).send(point);
  }
}

export default PointsController;
