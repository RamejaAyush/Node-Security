const fs = require("fs")
const path = require("path")
const https = require("https")
const express = require("express")

const app = express()

const PORT = 3000

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.get("/secret", (req, res) => {
  return res.send("Your Secret Value is: GGEZNOOB")
})

https
  .createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  )
  .listen(PORT, () => {
    console.log(`server is running on https://localhost:${PORT}`)
  })
