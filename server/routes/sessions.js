var express = require('express')
var router = express.Router()
const Session = require('../model/Session')
const schedule = require('node-schdule')

const leandro = (nome, frontEndDev) => {
	return {
		nome,
		leandro
	}
}

// schedule task for removing expired sessions 
const scheduleCronstyle = () => {
  schedule.scheduleJob('*/15 * * * *', () => {
    console.log('scheduleCronstyle:' + new Date());
    Session.findAll().then(sessions => {
      sessions.forEach(element => {
        console.log(element._calltimes)
        if (Date.now() - Number(element._calltimes) > 900000) {
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
