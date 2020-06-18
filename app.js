// Library imports
const express = require('express');
const sqlite3 = require('sqlite3');
const _ = require('lodash');

// Constants 
const QUERY_ALL = 'ALL';
const QUERY_GET = 'GET';

// Project self dependencies
var Artist = require('./models/Artist');

// Connect to sqlite db
let db = new sqlite3.Database('./db/chinook.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
});

// Start express
const app = express();
const port = 8080;

// Hello World
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Hello Cat
app.get('/cat', (req, res) => {
    res.send('Hello Cat!');
});

// Hello Dog
app.get('/dog', (req, res) => {
    res.send('hello dog');
});

/**
 * API REST example
 * GET    /artists        -> List Artists
 * POST   /artists        -> Create Artists
 * GET    /artists/:id    -> Show Artist
 * PATCH  /artists/:id    -> Update Artist
 * DELETE /artists/:id    -> Delete Artist
**/

// List Artists
app.get('/artists', (req, res) => {
    const page = _.get(req, 'query.page', 0);
    const limit = 20;

    Artist.findAll({
        where: {
            ArtistId: 2
        },
        limit: limit,
        offset: limit * page,
    }).then((artists) => {
        res.json('index', ...artists);
    }).catch((err) => {
        res.status(500);
        return res.send('Internal server error');
    });
});

// Show Artist
app.get('/artists/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const artistSQL = `SELECT Name
        FROM artists 
        WHERE artists.ArtistId = ${id}`;
        let artist = await executeQuery(QUERY_GET, artistSQL);

        const albumSQL = `SELECT AlbumId, Title
        FROM albums 
        WHERE albums.ArtistId = ${id}`;
        let albums = await executeQuery(QUERY_ALL, albumSQL);
        let albumsIds = albums.map(album => album.AlbumId);

        const trackSQL = `SELECT TrackId, Name, Milliseconds, AlbumId
        FROM tracks 
        WHERE tracks.AlbumId IN (${albumsIds})`;
        let tracks = await executeQuery(QUERY_ALL, trackSQL);

        for (album of albums) {
            album.tracks = tracks.filter(track => track.AlbumId === album.AlbumId);
        }

        artist.albums = albums;

        res.json(artist);
    } catch (err) {
        res.status(500);
        console.log(err);
        return res.send('Internal server error');
    }
});

function executeQuery(type, sql) {
    if (type === QUERY_ALL) {
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    } else if (type === QUERY_GET) {
        return new Promise((resolve, reject) => {
            db.get(sql, [], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`));