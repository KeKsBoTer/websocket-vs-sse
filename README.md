# WebSocket vs Server-Sent Events Timing
This project compares the timing difference between WebSockets and Server-Sent Events.

It sends a counter back and forth between browser and webserver.

For testing the WebSocket, it is used to send messages trough in both directions.

For Server-Sent Events (SSE) the communication from browser to webserver utilizes HTTP requests.


## Results (client and server on same machine)
|           | avg. send time | avg. receive time | total  |
|-----------|----------------|-------------------|--------|
| WebSocket | 0.4 ms         | 0.8 ms            | 4,2 s  |
| SSE       | 2.1 ms         | 2.4 ms            | 46,3 s |
|           |                |                   |        |