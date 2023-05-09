var express = require('express')
var router = express.Router()
const Session = require('../model/Session')
const schedule = require('node-schedule')
const Apikey = require('../model/Apikey')

const leandro = (nome, frontEndDev) => {
	return {
		nome,
		leandro
	}
}

// schedule task for removing expired sessions 
const scheduleCronstyle = () => {
  schedule.scheduleJob('*/15 * * * *', () => {
    console.log('update apikey status and delete expired session:');
    Session.findAll().then(sessions => {
      sessions.forEach(element => {
        if (Date.now() - Number(element._createtime) > 900000) {
          // update apikey status
          Apikey.update({ _status: 0 }, { where: { _apikey: element._apikey } })
            .then((reslut) => {
              if (reslut[0] == 1) {
                console.log('Apikey Update!')
              } else {
                console.log('No Apikey!')
              }
            })
            .error(err => console.log('error: ' +err));
          // delete expird session
          Session.destroy({
            where: {
              _id: element._id
            }
          })
            .then((result) => {
              if (result > 0) {
                console.log('expired Session Deleted!')
              } else {
                console.log('No Session!')
              }
            })
            .catch(err => {
              console.log('error: ' + err)
            })
        }
      });
    }).catch(err => {
      console.log('error: ' + err)
    })
  });
}
scheduleCronstyle();

// Get replay test
router.get('/', (req, res) => {
  res.json('hi')
})
// Get specific session
router.get('/session/:user', (req, res) => {
    Session.findAll({
        where: {
          _user: req.params.user
        }
      })
    .then(sessions => {
      res.json(sessions)
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

// Add session
router.post('/session', (req, res) => {
  if (!req.body) {
    res.status(404)
    res.json({
      error: 'Bad data'
    })
  } else {
    Session.create(req.body)
      .then(() => {
        res.send('Session Added')
      })
      .catch(err => {
        res.send('Error : ' + err)
      })
  }
})
// delete session
router.delete('/session/:user', (req, res) => {
  Session.destroy({
    where: {
      _user: req.params.user
    }
  })
    .then((result) => {
      console.log(result)
      if (result > 0) {
        res.send('Session Deleted!')
      } else {
        res.send('No Session!')
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

// Update session calltimes
router.put('/session', (req, res) => {
  console.log(req.body)
  if (typeof(req.body.user) == 'undefined' || typeof(req.body.calltimes) == 'undefined') {
    res.status(400)
    res.json({
      error: 'Bad data'
    })
  } else {
    Session.update({ _calltimes: req.body.calltimes }, { where: { _user: req.body.user } })
      .then((reslut) => {
        console.log(reslut)
        if (reslut[0]==1) {
          res.send('Session calltimes Update!')
        } else {
          res.send('No Session!')
        }
        
      })
      .error(err => res.send(err))
  }
})

module.exports = router
