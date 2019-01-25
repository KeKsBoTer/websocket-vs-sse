const express = require("express")
const path = require("path")
const app = express()
const sseExpress = require("sse-express")
require("express-ws")(app)

const html = __dirname + "/www"

app.ws("/ws", async function (ws) {
    ws.isAlive = true

    ws.on("close", (e) => {
        console.error(e)
    })

    ws.on("message", msg => {
        const receiveTime = new Date() / 1
        let counter = parseInt(msg)
        ws.send(JSON.stringify({
            counter: counter + 1,
            timestamp: receiveTime
        }))
    })
})
let sse = undefined

app.get("/sseCounter", sseExpress, (req, res) => {
    sse = res.sse
})


app.get("/counter", (req, res) => {
    let url = new URL(req.url, "http://localhost:8080/")
    let counter = parseInt(url.searchParams.get("counter"))
    sse("message", {
        counter: counter + 1,
        timestamp: new Date() / 1
    })
    res.send("")
})

app.get("/*", (req, res) => {
    let p = req.path === "/" ? "/index.html" : req.path
    res.sendFile(path.join(html, p))
})


const port = process.env.PORT || 8080
app.listen(port, (err) => {
    if (err) {
        return console.log("something bad happened", err)
    }
    console.log(`server is listening on ${port}`)
})
