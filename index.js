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

app.use((req, res, next) => {
  console.log("method: ", req.method, " params: ", req.params);
  next();
});

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const logSchema = new mongoose.Schema({
  userId: {type: String, required: true},
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date:{type: Date, default: Date.now}
});

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
});

const User = mongoose.model('User', userSchema);
const Log = mongoose.model('Log', logSchema);

app.post("/api/users", async (req, res) => {
  console.log("Posting user ", req.body.username);
  let userName = req.body.username;
  let newUser = new User({
    username: userName,
  });
  try {
    await newUser.save();
    res.json({
      username: newUser.username,
      _id: newUser._id
    });
  } catch (error){
    res.json({error: error.message});
  }
});

app.get("/api/users", async(req, res) => {
  console.log("Listing users");
  try {
    let userList = await User.find({});
    outList = userList.map(d => {return {"_id": d._id, "username": d.username}});
    res.json(outList);
  }
  catch (error) {
    res.json({error: error.message});
  }
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
