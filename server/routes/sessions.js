var express = require('express')
var router = express.Router()
const Session = require('../model/Session')

const leandro = (nome, frontEndDev) => {
	return {
		nome,
		leandro
	}
}

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

// // Update task
// router.put('/task/:id', (req, res) => {
//   if (!req.body.name) {
//     res.status(400)
//     res.json({
//       error: 'Bad data'
//     })
//   } else {
//     Task.update({ task_name: req.body.task_name }, { where: { id: req.params.id } })
//       .then(() => {
//         res.send('Task Update!')
//       })
//       .error(err => res.send(err))
//   }
// })

module.exports = router
