const { ObjectId } = require('mongodb');
const { getDatabase } = require('../config/database');
const { validateRestaurant } = require('../utils/validation');

const collection = async () => {
  const db = await getDatabase();
  return db.collection('restaurants');
};

const escapeRegex = value =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const asIdFilter = id =>
  ObjectId.isValid(id)
    ? { _id: new ObjectId(id) }
    : { restaurant_id: id };

const normalize = doc => {
  if (!doc) return null;

  const grades = [...(doc.grades || [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return {
    ...doc,
    _id: doc._id.toString(),
    grades,
    currentGrade: grades[0]?.grade || '—',
    currentScore: grades[0]?.score ?? '—',
    latestInspection: grades[0]?.date || null
  };
};

function buildQuery(params) {
  const query = {};

  if (params.search?.trim()) {
    const pattern = new RegExp(
      escapeRegex(params.search.trim().slice(0, 100)),
      'i'
    );

    query.$or = [
      { name: pattern },
      { cuisine: pattern },
      { borough: pattern }
    ];
  }

  if (params.borough) query.borough = params.borough;
  if (params.cuisine) query.cuisine = params.cuisine;
  if (params.grade) query['grades.grade'] = params.grade;

  return query;
}

exports.listRestaurants = async (req, res, next) => {
  try {
    const c = await collection();

    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const query = buildQuery(req.query);

    const [docs, total] = await Promise.all([
      c.find(query)
        .sort({ 'grades.date': -1, name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),

      c.countDocuments(query)
    ]);

    res.json({
      data: docs.map(normalize),
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getRestaurant = async (req, res, next) => {
  try {
    const c = await collection();

    const doc = await c.findOne(
      asIdFilter(req.params.id)
    );

    if (!doc) {
      return res.status(404).json({
        error: 'Restaurant not found.'
      });
    }

    res.json({
      data: normalize(doc)
    });
  } catch (error) {
    next(error);
  }
};

exports.createRestaurant = async (req, res, next) => {
  try {
    const c = await collection();

    const result = validateRestaurant(req.body);

    if (!result.valid) {
      return res.status(400).json({
        error: 'Please correct the highlighted fields.',
        errors: result.errors
      });
    }

    const { grade, score, ...restaurant } = result.data;

    restaurant.restaurant_id = String(
      req.body.restaurant_id || `${Date.now()}`
    );

    restaurant.grades = [
      {
        date: new Date(),
        grade,
        score
      }
    ];

    const inserted = await c.insertOne(restaurant);

    res.status(201).json({
      data: normalize({
        ...restaurant,
        _id: inserted.insertedId
      }),
      message: 'Restaurant added successfully.'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Restaurant ID already exists.'
      });
    }

    next(error);
  }
};

exports.updateRestaurant = async (req, res, next) => {
  try {
    const c = await collection();

    const existing = await c.findOne(
      asIdFilter(req.params.id)
    );

    if (!existing) {
      return res.status(404).json({
        error: 'Restaurant not found.'
      });
    }

    const result = validateRestaurant(req.body);

    if (!result.valid) {
      return res.status(400).json({
        error: 'Please correct the highlighted fields.',
        errors: result.errors
      });
    }

    const { grade, score, ...restaurant } = result.data;

    const latest = normalize(existing);

    const changed =
      latest.currentGrade !== grade ||
      Number(latest.currentScore) !== score;

    const update = {
      $set: restaurant
    };

    if (changed) {
      update.$push = {
        grades: {
          date: new Date(),
          grade,
          score
        }
      };
    }

    await c.updateOne(
      { _id: existing._id },
      update
    );

    const doc = await c.findOne({
      _id: existing._id
    });

    res.json({
      data: normalize(doc),
      message: 'Restaurant updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteRestaurant = async (req, res, next) => {
  try {
    const c = await collection();

    const result = await c.deleteOne(
      asIdFilter(req.params.id)
    );

    if (!result.deletedCount) {
      return res.status(404).json({
        error: 'Restaurant not found.'
      });
    }

    res.json({
      message: 'Restaurant deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const c = await collection();

    const [restaurants, boroughs, cuisines, grades] =
      await Promise.all([
        c.countDocuments(),
        c.distinct('borough'),
        c.distinct('cuisine'),
        c.distinct('grades.grade')
      ]);

    res.json({
      data: {
        restaurants,
        boroughs: boroughs.filter(Boolean).length,
        cuisines: cuisines.filter(Boolean).length,
        grades: grades.filter(Boolean).length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMetadata = async (req, res, next) => {
  try {
    const c = await collection();

    const [boroughs, cuisines, grades] =
      await Promise.all([
        c.distinct('borough'),
        c.distinct('cuisine'),
        c.distinct('grades.grade')
      ]);

    res.json({
      data: {
        boroughs: boroughs.filter(Boolean).sort(),
        cuisines: cuisines.filter(Boolean).sort(),
        grades: grades.filter(Boolean).sort()
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getBestQuality = async (req, res, next) => {
  try {
    const c = await collection();

    const limit = Math.min(
      20,
      Math.max(1, Number(req.query.limit) || 6)
    );

    // Lower average inspection scores mean fewer violations.
    const docs = await c.aggregate([
      {
        $unwind: '$grades'
      },
      {
        $match: {
          'grades.score': {
            $type: 'number',
            $gte: 0
          }
        }
      },
      {
        $sort: {
          'grades.date': -1
        }
      },
      {
        $group: {
          _id: '$_id',
          restaurant: {
            $first: '$$ROOT'
          },
          gradeHistory: {
            $push: '$grades'
          },
          averageScore: {
            $avg: '$grades.score'
          },
          inspectionCount: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          averageScore: 1,
          inspectionCount: -1,
          'restaurant.name': 1
        }
      },
      {
        $limit: limit
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$restaurant',
              {
                grades: '$gradeHistory',
                averageScore: {
                  $round: ['$averageScore', 1]
                },
                inspectionCount: '$inspectionCount'
              }
            ]
          }
        }
      }
    ]).toArray();

    res.json({
      data: docs.map(normalize)
    });
  } catch (error) {
    next(error);
  }
};