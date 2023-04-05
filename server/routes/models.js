var express = require('express')
var router = express.Router()
const Model = require('../model/Model')

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
// get all model
router.get('/model', (req, res) => {
    Model.findAll({})
    .then(models => {
      res.json(models)
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

// Get specific model
router.get('/model/:name', (req, res) => {
    Model.findAll({
        where: {
          _name: req.params.name
        }
      })
    .then(model => {
      res.json(model)
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

// Add model
router.post('/model', (req, res) => {
  if (!req.body) {
    res.status(404)
    res.json({
      error: 'Bad data'
    })
  } else {
    Model.create(req.body)
      .then(() => {
        res.send('Model Added')
      })
      .catch(err => {
        res.send('Error : ' + err)
      })
  }
})
// delete session
router.delete('/model/:name', (req, res) => {
  Model.destroy({
    where: {
      _name: req.params.name
    }
  })
    .then((result) => {
      console.log(result)
      if (result > 0) {
        res.send('Model Deleted!')
      } else {
        res.send('No Model!')
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
