const Sequelize = require('sequelize')
const db = require('../database/db.js')

module.exports = db.sequelize.define(
	'apikeys',
	{
		_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		_apikey: {
			type: Sequelize.STRING
		},
		_status: {
			type: Sequelize.INTEGER
		}
	},
	{
		timestamp: false
	}
)
