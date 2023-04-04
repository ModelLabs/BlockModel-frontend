const Sequelize = require('sequelize')
const db = require('../database/db.js')

module.exports = db.sequelize.define(
	'sessions',
	{
		_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		_user: {
			type: Sequelize.STRING
		},
        _apikey: {
			type: Sequelize.STRING
		},
        _createtime: {
            type: Sequelize.STRING
        },
		_calltimes: {
			type: Sequelize.INTEGER
		}
	},
	{
		timestamp: false
	}
)
