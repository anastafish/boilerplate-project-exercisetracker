const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

mongoose.connect(process.env.MONG_URL, { useNewUrlParser: true, useUnifiedTopology: true })

const exerciseSchema = mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
  user_id:String
})
const Exercise = mongoose.model('Exercise', exerciseSchema)


const userSchema = mongoose.Schema({
  username: String
})
const Users = mongoose.model('Users', userSchema)

app.use(bodyParser.urlencoded({extended:false}))
app.use(cors())
app.use(express.static('public'))

app.post('/api/users', (req, res) => {
  const newUser = new Users({
    username: req.body.username
  }) 
  newUser.save().then(data => {
    res.json({
      username:data.username,
      _id:data.id
    })
  }).catch(err => console.log(err))
})

app.get('/api/users', (req, res) => {
  Users.find().then(data => {
    res.json(data)
  }).catch(err => console.log(err))
})

app.post('/api/users/:_id/exercises', (req, res) => {
  Users.findById(req.body[':_id']).then(user => {
    const newExercise = new Exercise({
      username: user.username,
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date,
      user_id:user.id
    })
    newExercise.save().then(exercise => {
      res.json({
        ...user._doc,
        description:exercise.description,
        duration:exercise.duration,
        date:exercise.date,
      })
    }).catch(err => console.log(err))
  })  
})

app.get('/api/users/:_id/logs', (req, res) => {
  if (req.query.from && req.query.to && req.query.limit) {
    Exercise.find({
      user_id:req.params['_id'],
      date:{
        $gte:(req.query.from),
        $lte:(req.query.to)
      }
    })
    .limit(req.query.limit)
    .exec()
    .then(data => {
      if (data[0]){
        res.json({
          username:data[0].username,
          count:data.length,
          _id:data[0]['_id'],
          log:data
        })
      }
      else {
        res.json({message:'No data'})
      }
    }).catch(err => console.log(err))
  }
  else if (req.query.from){
    Exercise.find({
      user_id:req.params['_id'],
      date:{
        $gte:(req.query.from),
      }
    })
    .exec()
    .then(data => {
      if (data[0]){
        res.json({
          username:data[0].username,
          count:data.length,
          _id:data[0]['_id'],
          log:data
        })
      }
      else {
        res.json({message:'No data'})
      }
    }).catch(err => console.log(err))
  }

  else if (req.query.to){
    Exercise.find({
      user_id:req.params['_id'],
      date:{
        $lte:(req.query.to)
      }
    })
    .exec()
    .then(data => {
      if (data[0]){
        res.json({
          username:data[0].username,
          count:data.length,
          _id:data[0]['_id'],
          log:data
        })
      }
      else {
        res.json({message:'No data'})
      }
    }).catch(err => console.log(err))
  }

  else if (req.query.limit){
    Exercise.find({
      user_id:req.params['_id']
    })
    .limit(req.query.limit)
    .exec()
    .then(data => {
      if (data[0]){
        res.json({
          username:data[0].username,
          count:data.length,
          _id:data[0]['_id'],
          log:data
        })
      }
      else {
        res.json({message:'No data'})
      }
    }).catch(err => console.log(err))
  }

  else {
    Exercise.find({
      user_id:req.params['_id'],
    })    
    .then(data => {
      res.json({
        username:data[0].username,
        count:data.length,
        _id:data[0]['_id'],
        log:data
      })
    }).catch(err => console.log(err))
  }
})


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
