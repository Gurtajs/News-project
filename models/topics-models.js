const db = require('../db/connection')

function getTopicsData() {
    return db.query('SELECT * FROM topics').then((topics) => {
        return topics.rows
    })
}

module.exports = {getTopicsData}