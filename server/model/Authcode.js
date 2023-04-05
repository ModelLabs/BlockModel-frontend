const Sequelize = require('sequelize')
const db = require('../database/db.js')

module.exports = db.sequelize.define(
	'authcodes',
	{
		_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		_user: {
			type: Sequelize.STRING
		},
		_code: {
			type: Sequelize.STRING
		},
        _createtime: {
			type: Sequelize.STRING
		}
	},
	{
		timestamp: false
	}
)
