CREATE TABLE users (
  uid SERIAL PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255),
  spotify_token VARCHAR(255),
  refresh_token VARCHAR(255)
);

CREATE TABLE mood (
  mid SERIAL PRIMARY KEY,
  mood VARCHAR(255),
  user_id INT REFERENCES users(uid)
);

CREATE TABLE tracks (
  tid SERIAL PRIMARY KEY,
  track_uri VARCHAR(255),
  artist_name VARCHAR(255),
  song_name VARCHAR(255),
  album_art VARCHAR(255),
  mood_id INT REFERENCES mood(mid),
  user_id INT REFERENCES users(uid)
);



