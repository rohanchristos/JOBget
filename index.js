const express = require("express");
const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

let port=3000;
app.listen(port,()=>{
  console.log(`listening in port ${port}`);
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: process.env.DB_PASSWORD,
});

let getUser = () => {
  return [
    faker.datatype.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

// not using try catch for handling exceptions as callback is async and run after scheduling so no use of try and catch here
app.get("/",(req,res)=>{
  let q='SELECT count(*) FROM user';
    connection.query(q,(err,result)=>{
      if (err) {
      console.error('Database error:',err);
      res.status(500).send("Couldn't fetch data. Please try again later.");
      return;
    }
    let count = result[0]["count(*)"];
    res.render("home.ejs",{count});
    });
});

app.get("/user",(req,res)=>{
  let q=`SELECT * FROM user`;
  connection.query(q,(err,result)=>{
    if (err) {
      console.error('Database error:',err);
      res.status(500).send("Couldn't fetch data. Please try again later.");
      return;
    }
    let data=result;
    res.render("user.ejs",{data});
  });
});


app.get("/user/:id/edit",(req,res)=>{
  let {id}=req.params;
  let q=`SELECT * FROM user WHERE id= "${id}"`;
  connection.query(q,(err,result)=>{
     if (err) {
      console.error('Database error:',err);
      res.status(500).send("Couldn't fetch data. Please try again later.");
      return;
    }
    let user=result[0];
    console.log(user.password);
    res.render("edit.ejs",{user});
  });
});

app.patch("/user/:id",(req,res)=>{
  let {id}=req.params;
  let {username,password}=req.body;
  let q=`SELECT * FROM user WHERE id= "${id}"`;
  connection.query(q,(err,result)=>{
    if (err) {
      console.error('Database error:',err);
      res.status(500).send("Couldn't fetch data. Please try again later.");
      return;
    }
    let user=result[0];
    if(user.password!=password){
      res.send("<h1><b> password do not match</b></h1>");
    }else{
       let q2=`UPDATE user set username="${username}" WHERE id="${id}"`;
       connection.query(q2,(err2,result2)=>{
        if (err2) {
          console.error('Database error:',err2);
          res.status(500).send("Couldn't fetch data. Please try again later.");
          return;
        }
        console.log(result2.info);
        console.log(`entry of ${username} is updated`);
        res.redirect("/user");
       });
    }
  });

});



app.get("/user/new",(req,res)=>{
  res.render("new.ejs");
});

app.post("/user/new",(req,res)=>{
  let {username,email,password}=req.body;
  console.log("posting request");
  let id=uuidv4();
  let q=`INSERT INTO user(id,username,email,password) values('${id}','${username}','${email}','${password}')`;
  connection.query(q,(err,result)=>{
    if (err) {
      console.error('Database error:',err);
      res.status(500).send("Couldn't add data to DB.");
      return;
    }
    console.log(result);
    res.redirect("/user");

  });
});




app.get("/user/:id/delete",(req,res)=>{
  let {id}=req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  connection.query(q,(err,result)=>{
    if (err) {
      console.error('Database error:',err);
      res.status(500).send("Couldn't fetch data from DB.");
      return;
    }
    let user=result[0];
    console.log(user.password);
    res.render("delete.ejs",{user});
  });

});

app.delete("/user/:id",(req,res)=>{
  let {id}=req.params;
  let {password}=req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;
connection.query(q,(err,result)=>{
  if (err) {
      console.error('Database error:',err);
      res.status(500).send("Couldn't fetch data from DB.");
      return;
    }
    let user=result[0];
    if(user.password!=password){
      res.send("<h1><b>WRONG Password entered!</b></h1>");
    }else{
      let q2=`DELETE FROM user WHERE id='${id}'`;
      connection.query(q2,(err2,result2)=>{
        if (err2) {
          console.error('Database error:',err2);
          res.status(500).send("Couldn't delete data from db.");
          return;
        }
        console.log("deleted rows =",result2.affectedRows);
        console.log(`entry of db deleted!`);
        res.redirect("/user");
      });

    }

});
});


//server from ghoshtech.corp
