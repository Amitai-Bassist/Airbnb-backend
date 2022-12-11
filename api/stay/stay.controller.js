const stayService = require('./stay.service.js');

const logger = require('../../services/logger.service');

async function getStays(req, res) {
  try {
    logger.debug('Getting Stays');
    const filterBy = {
      txt: req.query.txt || '',
      hostId: req.query.hostId || '',
      type: req.query.type || '',
    };
    var stays = await stayService.query(filterBy);
    stays = stays.sort((stay1, stay2) => {
      if (stay1.scoreReview > stay2.scoreReview) return -1;
      else if (stay1.scoreReview < stay2.scoreReview) return 1;
      else if (stay1.reviews.length > stay2.reviews.length) return -1;
      else return 1;
    });
    res.json(stays);
  } catch (err) {
    logger.error('Failed to get stays', err);
    res.status(500).send({ err: 'Failed to get stays' });
  }
}

async function getStayById(req, res) {
  try {
    const stayId = req.params.id;
    const stay = await stayService.getById(stayId);
    console.log('in stay controller', stay);
    res.json(stay);
  } catch (err) {
    logger.error('Failed to get stay', err);
    res.status(500).send({ err: 'Failed to get stay' });
  }
}

async function addStay(req, res) {
  const { loggedinUser } = req;

  try {
    const stay = req.body;
    stay.owner = loggedinUser;
    const addedStay = await stayService.add(stay);
    res.json(addedStay);
  } catch (err) {
    logger.error('Failed to add stay', err);
    res.status(500).send({ err: 'Failed to add stay' });
  }
}

async function updateStay(req, res) {
  try {
    const stay = req.body;
    console.log(stay);
    const updatedStay = await stayService.update(stay);
    res.json(updatedStay);
  } catch (err) {
    logger.error('Failed to update stay', err);
    res.status(500).send({ err: 'Failed to update stay' });
  }
}

async function removeStay(req, res) {
  try {
    const stayId = req.params.id;
    const removedId = await stayService.remove(stayId);
    res.send(removedId);
  } catch (err) {
    logger.error('Failed to remove stay', err);
    res.status(500).send({ err: 'Failed to remove stay' });
  }
}

async function addStayMsg(req, res) {
  const { loggedinUser } = req;
  try {
    const stayId = req.params.id;
    const msg = {
      txt: req.body.txt,
      by: loggedinUser,
    };
    const savedMsg = await stayService.addStayMsg(stayId, msg);
    res.json(savedMsg);
  } catch (err) {
    logger.error('Failed to update stay', err);
    res.status(500).send({ err: 'Failed to update stay' });
  }
}

async function removeStayMsg(req, res) {
  const { loggedinUser } = req;
  try {
    const stayId = req.params.id;
    const { msgId } = req.params;

    const removedId = await stayService.removeStayMsg(stayId, msgId);
    res.send(removedId);
  } catch (err) {
    logger.error('Failed to remove stay msg', err);
    res.status(500).send({ err: 'Failed to remove stay msg' });
  }
}

module.exports = {
  getStays,
  getStayById,
  addStay,
  updateStay,
  removeStay,
  addStayMsg,
  removeStayMsg,
};
