async function query(filterBy={txt:''}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('stay')
        let stays = await collection.find(criteria)
        .map(stay=> _calcScoreReview(stay))
        .sort({scoreReview:-1})
        .limit(20)
        .toArray()
        return stays
    } catch (err) {
        logger.error(`Cannot find stays`, err)
        throw err
    }
}

function _calcScoreReview(stay){
    const {reviews} = stay

    stay.scoreReview = reviews.map(review=> _averageScore(review))
    stay.scoreReview = stay.scoreReview.reduce((total,num)=> {
        return total + num
    },0) / reviews.length 
    return stay
}

function _buildCriteria(filterBy) {
    
    const {txt,hostId,type} = filterBy

    const byTxt = {$regex: txt, $options: 'i'}
    const byHostId = {$regex: hostId, $options: 'i'}
    const byType = {$regex: type, $options: 'i'}
    
    const criteria = {
        type: byType,
        $or: [
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
    }

    if (hostId) {
        return {'host._id':byHostId}
    }

    return criteria
}

function _averageScore(review){
    let average = (review.rate.Cleanliness + review.rate.Communication + 
    review.rate.Accuracy +review.rate.Location + review.rate.Value + review.rate.CheckIn)/6 
    return  +average.toFixed(1)
}