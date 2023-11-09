var express = require('express');
var pool = require('../db/db');
var router = express.Router();

// route to add a new user to database
router.post('/', (req,res,next) => {
  const values = [req.session.display_name, req.session.email, req.session.access_token, req.session.refresh_token]
  console.log(values);
  pool.query(`INSERT INTO users(username, email, spotify_token, refresh_token) VALUES($1,$2,$3,$4)`, values,(q_err,q_res) => {
    if(q_err) return next(q_err);
    res.json(q_res.rows);
  })
  
})
// route to get a users information
router.get('/', (req, res, next) => {
  pool.query("SELECT * FROM users", (q_err, q_res) => {
    res.json(q_res.rows)
  })
})
// route to update access and refresh tokens
router.put('/', (req,res,next) => {
  const values = [req.session.access_token,req.session.refresh_token, req.body.uid]
  console.log(`backend ${req.body.uid}`);
  pool.query(`UPDATE users SET spotify_token= $1, refresh_token = $2
  WHERE uid = $3`, values,
  (q_err, q_res) => {
    res.json(q_res.rows)
  })
})

module.exports = router;



