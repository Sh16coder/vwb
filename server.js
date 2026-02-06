const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const notebooks = {};

io.on("connection", socket => {
  socket.on("joinBoard", ({ notebookId, boardId }) => {
    socket.join(boardId);
    socket.boardId = boardId;

    notebooks[notebookId] ||= {};
    notebooks[notebookId][boardId] ||= [];

    socket.emit("loadBoard", notebooks[notebookId][boardId]);
  });

  socket.on("draw", data => {
    const { notebookId, boardId, stroke } = data;
    notebooks[notebookId][boardId].push(stroke);
    socket.to(boardId).emit("draw", stroke);
  });

  socket.on("clear", boardId => {
    socket.to(boardId).emit("clear");
  });

  socket.on("cursor", data => {
    socket.to(socket.boardId).emit("cursor", {
      ...data,
      id: socket.id
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Running"));
