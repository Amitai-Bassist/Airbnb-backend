async function query(filterBy={txt:''}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('stay')
        let stays = await collection.find(criteria).map((stay)=> {return scoreReview(stay)})
        .sort({scoreReview:-1}).limit(20).toArray()
        return stays
    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }
}

function scoreReview(stay){
    stay.scoreReview = stay.reviews.map((review)=> {
        return averageScore(review)
    })
    stay.scoreReview = stay.scoreReview.reduce((total,num)=> {return total + num},0)/stay.reviews.length 
    return stay
}

function _buildCriteria(filterBy) {
    const byTxt = {$regex: filterBy.txt, $options: 'i'}
    const byHostId = {$regex: filterBy.hostId, $options: 'i'}
    const byType = {$regex: filterBy.type, $options: 'i'}
    
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
    if (filterBy.hostId) {
        return {'host._id':byHostId}
    }
    return criteria
}

function averageScore(review){
    let average = (review.rate.Cleanliness + review.rate.Communication + 
    review.rate.Accuracy +review.rate.Location + review.rate.Value + review.rate.CheckIn)/6 
    return  +average.toFixed(1)
}