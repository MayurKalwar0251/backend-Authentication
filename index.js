import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express'
import mongoose from 'mongoose';
import jwt, { decode } from "jsonwebtoken"

mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
  })
  .then(() => {
    console.log("Db Connencted");
  })
  .catch((e) => {
    e;
  });

let userSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String
})

let User = mongoose.model("users",userSchema)

let app = express()
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended : true}))

app.listen(3000,()=>{
    console.log("Server responding");
})

app.get("/", async(req,res)=>{
    let {token} = req.cookies
    if (token) {
      let decodedData = jwt.verify(token,"Secret")
      req.user = await User.findById(decodedData._id)
      res.redirect("/logout")
    }
    else {
      res.redirect("/login")
    }
})

app.get("/login",(req,res)=>{
  res.render("login.ejs")
})

app.get("/logout",(req,res)=>{
  res.render("logout.ejs")
})


app.get('/register',(req,res)=>{
  res.render("register.ejs")
})



app.post("/login", async (req,res)=>{
  
    let {name,email,password} = req.body

    let user = await User.findOne({email})
    
    if (!user) {
      return res.redirect("/register")
    }
    
    let isPasswordMatched = user.password === password

    if (!isPasswordMatched) {
      return res.render("login.ejs",{
        email : email,
        message : "Incorrrect Password"
      })
    }
    
  let token = jwt.sign({_id : user._id},"Secret")

  res.cookie("token",token,{
      httpOnly : true,
      expires : new Date(Date.now() + 60*1000)
  })
    res.redirect("/logout")
})

app.post("/logout", async (req,res)=>{
    
    res.cookie("token","",{
        httpOnly : true,
        expires : new Date(Date.now())
    })

    res.redirect("/")
})

app.post("/register", async (req,res)=>{
  
  let {name,email,password} = req.body

  let user = await User.findOne({email})

  if (user) {
    return res.redirect("/login")
  }

  user = await User.create({name,email,password})

  let token = jwt.sign({_id : user._id},"Secret")

  res.cookie("token",token,{
      httpOnly : true,
      expires : new Date(Date.now() + 60*1000)
  })
  res.redirect("/logout")

})
