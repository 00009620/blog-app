const express = require("express");
const app = express();
const fs = require("fs");
const port = 3000;

let postsDb = [];

fs.readFile("./db/posts.json", (err, data) => {
  if (!err) {
    postsDb = JSON.parse(data);
  }
});

const parser = require("body-parser");
app.use(parser.urlencoded({ extended: true }));

app.use("/assets", express.static("./public"));

app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/posts/create", (req, res) => {
  res.render("create", { success: req.query.success });
});

function generateRandomId() {
  return Math.floor(Math.random() * 99999999999) + 1;
}

app.post("/posts/create", (req, res) => {
  // get the sent data
  const timeline = new Date().toString();
  const post = {
    id: generateRandomId(),
    author: req.body.author,
    title: req.body.title,
    body: req.body.details,
    archived: false,
    timeline: timeline.substring(0, timeline.search("G") - 1),
  };

  // store it somewhere
  postsDb.push(post);
  fs.writeFile("./db/posts.json", JSON.stringify(postsDb), (err) => {
    if (err) {
      res.redirect("/posts/create?success=0");
    } else {
      res.redirect("/posts/create?success=1");
    }
  });

  // redirect user back
});

app.get("/posts", (req, res) => {
  let posts = postsDb.filter((post) => !post.archived);
  res.render("posts", { posts: posts });
});

app.get("/posts/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const post = postsDb.find((post) => post.id === id) || null;

  res.render("post", { post: post });
});

app.get("/posts/:id/delete", (req, res) => {
  const id = parseInt(req.params.id);
  const index = postsDb.findIndex((post) => post.id === id);

  // Delete from postsDB array
  postsDb.splice(index, 1);

  // Update posts.json file
  fs.writeFile("./db/posts.json", JSON.stringify(postsDb), (err) => {
    if (err) {
      res.redirect("/posts?success=0");
    } else {
      res.redirect("/posts?success=1");
    }
  });
});

app.get("/posts/:id/archive", (req, res) => {
  const id = parseInt(req.params.id);
  const index = postsDb.findIndex((post) => post.id === id);

  postsDb[index].archived = true;

  fs.writeFile("./db/posts.json", JSON.stringify(postsDb), (err) => {
    if (err) {
      res.redirect("/posts/" + id + "?success=0");
    } else {
      res.redirect("/posts/" + id + "?success=1");
    }
  });
});

app.get("/archive", (req, res) => {
  const posts = postsDb.filter((post) => post.archived);

  res.render("archive", { posts: posts });
});

app.get("/api/v1/posts", (req, res) => {
  fs.readFile("./db/posts.json", (err, db) => {
    if (err) throw err;

    const posts = JSON.parse(db);
    res.json(posts);
  });
});

app.listen(port, () => {
  console.log(`Blog app listening at http://localhost:${port}`);
});
