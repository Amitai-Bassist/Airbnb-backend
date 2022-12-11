const dbService = require('../../services/db.service');
const logger = require('../../services/logger.service');
const utilService = require('../../services/util.service');
const ObjectId = require('mongodb').ObjectId;

async function query(filterBy = { txt: '' }) {
  const criteria = _buildCriteria(filterBy);
  try {
    const collection = await dbService.getCollection('stay');
    let stays = await collection
      .find(criteria)
      .map((stay) => {
        return scoreReview(stay);
      })
      .sort({ scoreReview: -1 })
      .limit(20)
      .toArray();
    return stays;
  } catch (err) {
    logger.error('cannot find stays', err);
    throw err;
  }
}

function scoreReview(stay) {
  stay.scoreReview = stay.reviews.map((review) => {
    return averageScore(review);
  });
  stay.scoreReview =
    stay.scoreReview.reduce((total, num) => {
      return total + num;
    }, 0) / stay.reviews.length;
  return stay;
}

function _buildCriteria(filterBy) {
  const byTxt = { $regex: filterBy.txt, $options: 'i' };
  const byHostId = { $regex: filterBy.hostId, $options: 'i' };
  const byType = { $regex: filterBy.type, $options: 'i' };

  const criteria = {
    type: byType,
    $or: [
      {
        name: byTxt,
      },
      {
        'loc.country': byTxt,
      },
      {
        'loc.city': byTxt,
      },
      {
        'loc.address': byTxt,
      },
    ],
  };
  if (filterBy.hostId) {
    return { 'host._id': byHostId };
  }
  return criteria;
}

function averageScore(review) {
  let average =
    (review.rate.Cleanliness +
      review.rate.Communication +
      review.rate.Accuracy +
      review.rate.Location +
      review.rate.Value +
      review.rate.CheckIn) /
    6;
  return +average.toFixed(1);
}

async function getById(stayId) {
  try {
    const collection = await dbService.getCollection('stay');
    const stay = collection.findOne({ _id: ObjectId(stayId) });
    console.log('in stay service', stay);
    return stay;
  } catch (err) {
    logger.error(`while finding stay ${stayId}`, err);
    throw err;
  }
}

async function remove(stayId) {
  try {
    console.log('stayId stay.service back', stayId);
    const collection = await dbService.getCollection('stay');
    await collection.deleteOne({ _id: ObjectId(stayId) });
    return stayId;
  } catch (err) {
    logger.error(`cannot remove stay ${stayId}`, err);
    throw err;
  }
}

async function add(stay) {
  try {
    const collection = await dbService.getCollection('stay');
    await collection.insertOne(stay);
    return stay;
  } catch (err) {
    logger.error('cannot insert stay', err);
    throw err;
  }
}

async function update(stay) {
  try {
    const stayToSave = JSON.parse(JSON.stringify(stay));
    delete stayToSave._id;
    const collection = await dbService.getCollection('stay');
    await collection.updateOne(
      { _id: ObjectId(stay._id) },
      { $set: stayToSave }
    );
    return stay;
  } catch (err) {
    logger.error(`cannot update stay ${stay._id}`, err);
    throw err;
  }
}

async function addStayMsg(stayId, msg) {
  try {
    msg.id = utilService.makeId();
    const collection = await dbService.getCollection('stay');
    await collection.updateOne(
      { _id: ObjectId(stayId) },
      { $push: { msgs: msg } }
    );
    return msg;
  } catch (err) {
    logger.error(`cannot add stay msg ${stayId}`, err);
    throw err;
  }
}

async function removeStayMsg(stayId, msgId) {
  try {
    const collection = await dbService.getCollection('stay');
    await collection.updateOne(
      { _id: ObjectId(stayId) },
      { $pull: { msgs: { id: msgId } } }
    );
    return msgId;
  } catch (err) {
    logger.error(`cannot add stay msg ${stayId}`, err);
    throw err;
  }
}

module.exports = {
  remove,
  query,
  getById,
  add,
  update,
  addStayMsg,
  removeStayMsg,
};
