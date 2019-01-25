(async function () {
    const runs = 10000
    let durations = await testWebSocket(runs)
    logTiming(durations)
    console.log("finished testing WebSockets")
    durations = await testSSE(runs)
    logTiming(durations)
    console.log("finished testing Server-Sent Events")
})()

function logTiming(durations) {
    const avgSend = durations.map(d => d.send).reduce((p, c, _, a) => p + c / a.length, 0)
    const avgReceive = durations.map(d => d.receive).reduce((p, c, _, a) => p + c / a.length, 0)
    console.group("average time:")
    console.log("send:", avgSend, "ms")
    console.log("receive:", avgReceive, "ms")
    console.groupEnd()

}

function testWebSocket(runs) {
    return new Promise((resolve, reject) => {
        let ws = new WebSocket("ws://localhost:8080/ws")
        let counter = 0
        let sendTime = undefined
        let durations = []
        ws.onopen = () => {
            console.time("websocket")
            sendTime = new Date() / 1
            ws.send(counter)
        }
        ws.onmessage = (msg) => {
            const receiveTime = new Date() / 1
            let data = JSON.parse(msg.data)
            durations.push({
                "send": data.timestamp - sendTime,
                "receive": receiveTime - data.timestamp
            })
            counter = data.counter
            if (counter % 100 == 0)
                console.log(counter)
            if (counter < runs) {
                sendTime = new Date() / 1
                ws.send(counter)
            } else {
                console.timeEnd("websocket")
                ws.close(1000, "finished")
            }
        }
        ws.onerror = reject
        ws.onclose = (e) => {
            if (e.code == 1000 && e.reason == "finished")
                resolve(durations)
            else
                reject(e)
        }
    })
}

function testSSE(runs) {
    return new Promise((resolve, reject) => {
        const durations = []
        let sendTime = undefined
        let counter = 0
        let eventSource = new EventSource('http://localhost:8080/sseCounter');

        eventSource.onopen = () => {
            sendTime = new Date() / 1
            fetch("/counter?counter=" + counter)
            console.time("sse")
        }
        eventSource.onerror = reject
        eventSource.onmessage = (e) => {
            const receiveTime = new Date() / 1
            let data = JSON.parse(e.data)
            durations.push({
                "send": data.timestamp - sendTime,
                "receive": receiveTime - data.timestamp
            })
            counter = data.counter
            if (counter % 100 == 0)
                console.log(counter)
            if (counter < runs) {
                sendTime = new Date() / 1
                fetch("/counter?counter=" + counter)
            } else {
                console.timeEnd("sse")
                eventSource.close()
                resolve(durations)
            }
        }
    })
}