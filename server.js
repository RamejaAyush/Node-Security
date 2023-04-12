require("dotenv").config()
const fs = require("fs")
const path = require("path")
const https = require("https")
const helmet = require("helmet")
const express = require("express")
const passport = require("passport")
const { Strategy } = require("passport-google-oauth20")

const PORT = 3000

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
}

const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
}

const verifyCallback = (accessToken, refreshToken, profile, done) => {
  console.log(`Google Profile: ${profile}`)
  done(null, profile)
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback))

const app = express()

app.use(helmet())
app.use(passport.initialize())

const checkLoggedIn = (req, res, next) => {
  const isLoggedIn = true // Todo
  if (!isLoggedIn)
    return res.status(401).json({
      error: "You must log in!",
    })
  next()
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email"],
  })
)

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: false,
  }),
  (req, res) => {
    console.log("Google Called us back!")
  }
)

app.get("/auth/logout", (req, res) => {})

app.get("/secret", checkLoggedIn, (req, res) => {
  return res.send("Your Secret Value is: GGEZNOOB")
})

app.get("failure", (req, res) => {
  return res.send("Failed To log in!")
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
