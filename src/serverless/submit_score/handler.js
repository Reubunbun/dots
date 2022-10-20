const mysql = require('mysql');
const knex = require('knex')({
    client: require('knex-serverless-mysql'),
});

let connDB;

module.exports.handler = async function(event) {
    try {
        return await submitScore(event);
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ message: 'Something went wrong' }),
        };
    } finally {
        if (connDB) {
            connDB.destroy();
        }
    }
};

const submitScore = async (event) => {
    if (!event.body || !event.body.Score || !event.body.Time || !event.body.Name) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ message: 'Missing body params' }),
        };
    }

    const {body: { Score, Time, Name }} = event;

    if (!connDB) {
        connDB = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_USER,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            charset: 'utf8_general_ci',
            connectTimeout: 1000,
        });
    }

    const query = knex('Scores')
        .insert({
            Name,
            Score,
            TimeTaken: Time,
            TimeSubmitted: Math.floor(Date.now() / 1000),
        })
        .toString();

    await new Promise((res, rej) => connDB.query(query, (err) => err ? rej(err) : res()))

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({}),
    };
};
