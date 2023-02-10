const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const { now } = require('mongoose');
mongoose = require("mongoose");
mongoose.connect("mongodb+srv://UserPetterAdmin:XuvS6WbjyvwM6FD@mycluster.i2mjl7k.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const logSchema = new mongoose.Schema({
  userid: String,
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: String
});

const User = mongoose.model('User', userSchema);
const Log = mongoose.model('Log', logSchema);

app.post("/api/users", async (req, res) => {
  let newUser = new User({
    username: req.body.username,
  });
  try {
    await newUser.save();
    res.json({ username: newUser.username, _id: newUser._id });
  } catch (error) {
    res.json({
      error: error.message,
    });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    let allUsers = await User.find({});
    res.json(allUsers);
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.post("/api/users/:id/exercises", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.end("not found");
    }

    const log = new Log({
      userid: req.params.id,
      description: req.body.description,
      duration: Number(req.body.duration),
      date: req.body.date
        ? new Date(req.body.date).toDateString()
        : new Date().toDateString(),
    });

    await log.save();

    res.json({
      username: user.username,
      description: log.description,
      duration: log.duration,
      date: new Date(log.date).toDateString(),
      _id: req.params.id,
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get("/api/users/:id/logs", async (req, res) => {
  try {
    let associatedName = await User.findById(req.params.id);
    let personalLogs = await Log.find({userid: req.params.id});
    let count = personalLogs.length;

    if (req.query.from) {
      day = new Date(req.query.from);
      personalLogs = personalLogs.filter(d => day < d.date);
    };
    if (req.query.to) {
      day = new Date(req.query.to);
      personalLogs = personalLogs.filter(d => {
        return (day > d.date)});
    };
    if (req.query.limit && req.query.limit <= personalLogs.length) {
      personalLogs = personalLogs.slice(personalLogs.length-req.query.limit);
    }
    personalLogs = personalLogs.map(d => {return {description: d.description, duration: d.duration, date: d.date.toDateString()}});
    res.json({username: associatedName.username, count: count, _id: req.params.id, log: personalLogs});}
  catch (error) {
    res.json({error: error.message});
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
