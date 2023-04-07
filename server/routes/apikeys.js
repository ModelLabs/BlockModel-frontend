var express = require('express')
var router = express.Router()
const Apikey = require('../model/Apikey')

const leandro = (nome, frontEndDev) => {
	return {
		nome,
		leandro
	}
}

// Get  All Apikeys
router.get('/', (req, res) => {
  res.json('hi')
})

router.get('/apikey', (req, res) => {
  Apikey.findAll({where: {
    _status: 0
  }})
    .then(apikeys => {
        res.json(apikeys)
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

// Add apikey
// router.post('/apikey', (req, res) => {
//   if (!req.body) {
//     res.status(404)
//     res.json({
//       error: 'Bad data'
//     })
//   } else {
//     Apikey.create(req.body)
//       .then(() => {
//         res.send('Apikey Added')
//       })
//       .catch(err => {
//         res.send('Error : ' + err)
//       })
//   }
// })
// delete apikey
router.delete('/apikey/:id', (req, res) => {
  Apikey.destroy({
    where: {
      _id: req.params.id
    }
  })
    .then((result) => {
      console.log(result)
      if (result == 1) {
        res.send('Apikey Deleted!')
      } else {
        res.send('No Apikey!')
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

// Update apikey
router.put('/apikey', (req, res) => {
  console.log(req.body)
  if (typeof(req.body.apikey) == 'undefined' || typeof(req.body.status) == 'undefined') {
    res.status(400)
    res.json({
      error: 'Bad data'
    })
  } else {
    Apikey.update({ _status: req.body.status }, { where: { _apikey: req.body.apikey } })
      .then((reslut) => {
        console.log(reslut)
        if (reslut[0]==1) {
          res.send('Apikey Update!')
        } else {
          res.send('No Apikey!')
        }
        
      })
      .error(err => res.send(err))
  }
})

module.exports = router
