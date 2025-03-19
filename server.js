import { createServer } from 'http'
import express from 'express'
import { Server } from 'socket.io'
import path from "path"

const port = parseInt(process.env.PORT || '8000', 10)
const dev = process.env.NODE_ENV !== 'production'

const app = express()

// CORS SETUP
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}))

// Store active connections and meeting rooms
const clients = new Map()
const meetings = new Map()

const server = createServer(app)

// Create WebSocket server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {

  socket.on('requestPrivateCallAccess', (data) => {
    const { username, roomId, userId } = data
    socket.to(roomId).emit("requestMessage", {username, roomId, userId})
  })
  
  socket.on('acceptedPrivateCallAccess', (data) => {
    const { roomId, userId } = data
    socket.to(roomId).emit("acceptedPrivateCallAccess", {userId})
  })

  // socket.on('requestPrivateCallAccess', (data: {username: string, roomId: string, userId: string}) => {
  //   const { username, roomId, userId } = data
  //   socket.to(roomId).emit("requestMessage", {username, roomId, userId})
  // })
  
  // socket.on('acceptedPrivateCallAccess', (data: {roomId: string, userId: string}) => {
  //   const { roomId, userId } = data
  //   socket.to(roomId).emit("acceptedPrivateCallAccess", {userId})
  // })

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})
app.use(express.static(path.join(process.cwd(), 'public')));

app.get("/", (_, res) => {
  res.json({message: "Server is running"})
})


// Start the server
server.listen(port, () => {
  console.log(`> Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV}`)
})
// })