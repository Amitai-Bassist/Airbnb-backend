const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy={txt:''}) {
    console.log(filterBy);
    const criteria = _buildCriteria(filterBy)
    try {
        
        // &&
        // { loc: { 
        //     $elemMatch: { 
        //         country: byTxt, 
        //         {address: byTxt,
        //         city: byTxt 
        //         } 
        //     } 
        // }
        const collection = await dbService.getCollection('stay')
        var stays = await collection.find(criteria).toArray()
        return stays.slice(0,32)
    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    if (filterBy.hostId) {
        return {'host._id':{$regex: filterBy.hostId, $options: 'i'}}
    }
    const byTxt = {$regex: filterBy.txt, $options: 'i'}
    var criteria = {
        type: { $regex: filterBy.type, $options: 'i' },
        }
        criteria.$or = [
            {
                name: byTxt
            },
            {
                'loc.country': byTxt
            },
            {
                'loc.city': byTxt
            },
            {
                'loc.address': byTxt
            }
        ]
            
     
    return criteria
}
    // if (filterBy.minBalance) {
    //     criteria.score = { $gte: filterBy.minBalance }
// }






async function getById(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        const stay = collection.findOne({ _id: ObjectId(stayId) })
        console.log('in stay service',stay);
        return stay
    } catch (err) {
        logger.error(`while finding stay ${stayId}`, err)
        throw err
    }
}

async function remove(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.deleteOne({ _id: ObjectId(stayId) })
        return stayId
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}

async function add(stay) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.insertOne(stay)
        return stay
    } catch (err) {
        logger.error('cannot insert stay', err)
        throw err
    }
}

async function update(stay) {
    try {
        const stayToSave = JSON.parse(JSON.stringify(stay))
        delete stayToSave._id
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: ObjectId(stay._id) }, { $set: stayToSave })
        return stay
    } catch (err) {
        logger.error(`cannot update stay ${stay._id}`, err)
        throw err
    }
}

async function addStayMsg(stayId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: ObjectId(stayId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add stay msg ${stayId}`, err)
        throw err
    }
}

async function removeStayMsg(stayId, msgId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: ObjectId(stayId) }, { $pull: { msgs: {id: msgId} } })
        return msgId
    } catch (err) {
        logger.error(`cannot add stay msg ${stayId}`, err)
        throw err
    }
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    addStayMsg,
    removeStayMsg
}
