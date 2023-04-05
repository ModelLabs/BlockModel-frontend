const Sequelize = require('sequelize')
const db = require('../database/db.js')

module.exports = db.sequelize.define(
	'models',
	{
		_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		_name: {
			type: Sequelize.STRING
		},
		_modeldata: {
			type: Sequelize.TEXT('long')
		},
        _params: {
			type: Sequelize.TEXT('long')
		},
        _result: {
			type: Sequelize.TEXT('long')
		},
        _status: {
			type: Sequelize.INTEGER
		}
	},
	{
		timestamp: false
	}
)
