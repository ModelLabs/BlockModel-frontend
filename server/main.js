var express = require('express')
var bodyParser = require('body-parser')

var apikeys = require('./routes/apikeys')
var sessions = require('./routes/sessions')
var mails = require('./routes/mails')
var models = require('./routes/models')
var cors = require('cors')

var port = 3030

var app = express()
app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/api', apikeys)
app.use('/api', sessions)
app.use('/api', mails)
app.use('/api', models)

app.listen(port, () => {
	console.log('Server started on port ' + port)
})
