const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
const intializeDbAndServer = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
intializeDbAndServer()
function convertToResponseObject(obj) {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  }
}
//API1
app.get('/players/', async (req, res) => {
  const playerQuery = `SELECT * FROM cricket_team;`
  const playerArr = await db.all(playerQuery)
  const player = playerArr.map(i => convertToResponseObject(i))
  res.send(player)
})
//API 2
app.post('/players/', async (req, res) => {
  const player_details = req.body
  const {playerName, jerseyNumber, role} = player_details
  const postQuery = `INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES
    ("${playerName}",${jerseyNumber},"${role}");`
  const dbRes = await db.run(postQuery)
  res.send('Player Added to Team')
})
//API 3
app.get('/players/:playerId/', async (req, res) => {
  const {playerId} = req.params
  const getQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId};`
  const player = await db.get(getQuery)
  res.send(convertToResponseObject(player))
})
//API 4
app.put('/players/:playerId/', async (req, res) => {
  const {playerId} = req.params
  const playerDetails = req.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updateQuery = `UPDATE cricket_team
    SET
    player_name='${playerName}', jersey_number=${jerseyNumber},role='${role}'
    WHERE player_id=${playerId};`
  await db.run(updateQuery)
  res.send('Player Details Updated')
})
//API 5
app.delete('/players/:playerId/', async (req, res) => {
  const {playerId} = req.params
  const query = `DELETE FROM cricket_team WHERE player_id=${playerId};`
  await db.run(query)
  res.send('Player Removed')
})
module.exports = app
