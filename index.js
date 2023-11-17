/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
const session = require('express-session');
require('dotenv').config()
var cors = require('cors');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')

var client_id = process.env.CLIENT_ID; // Your client id 
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var users = require('./routes/users'); //route for users
var mood = require('./routes/mood'); // route for mood
var tracks = require('./routes/tracks'); //route for tracks
const SpotifyWebApi = require('spotify-web-api-node');


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();
app.use(cors()
)
  .use(cookieParser());
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false
}));
app.use(bodyParser.json());
app.use('/users', users);
// app.use('/mood', mood);
// app.use('/tracks',tracks);

var scopes = ['streaming', 'user-read-email', 'user-read-private', 'user-read-playback-state', 'user-modify-playback-state']
var state = generateRandomString(16);

var spotifyApi = new SpotifyWebApi({
  redirectUri: redirect_uri,
  clientId: client_id,
  clientSecret: client_secret
});
// var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state)

// console.log(authorizeURL);

app.get('/login', function (req, res) {
  res.redirect(spotifyApi.createAuthorizeURL(scopes,state));
  console.log(req.body);
})

app.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.log('callback error: ', error);
    res.send(`callback error: ${error}`);
    return;
  }

  spotifyApi.authorizationCodeGrant(code).then(
    function (data) {
      const access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      const expires_in = data.body['expires_in'];
      const display_name = data.body['display_name'];
      const email = data.body['email'];
      
      console.log('token expires in ' + expires_in);
      console.log('access token is ' + access_token);
      console.log('refresh token is ' + refresh_token);
      req.session.access_token = access_token;
      req.session.refresh_token = refresh_token;
      req.session.display_name = display_name;
      req.session.email = email;
      req.session.save();

      // set the access token on the API object to use
      spotifyApi.setAccessToken(req.session.access_token)
      spotifyApi.setRefreshToken(req.session.refresh_token)
      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );
      
      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const access_token = data.body['access_token'];
        req.session.access_token = access_token;
      }, expires_in);
      res.redirect('http://localhost:3000/mood-selection');

    }).catch(error => {

      console.error('Error getting Tokens:', error);
      res.send(`Error getting Tokens: ${error}`);
    
    });

 
})

console.log('Listening on 8888');
app.listen(8888);
