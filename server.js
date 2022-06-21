var express = require("express");
const  mongoose = require("mongoose");
const  bodyParser = require("body-parser");
var moment = require('moment');
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const bcrypt = require("bcrypt");

const port = process.env.PORT || 5000

const time = 300000;
app.use(
    sessions({
        secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
        saveUninitialized: true,
        cookie: {maxAge: time},
        resave: false
    })
);
app.use(cookieParser());
var session;


app.use(express.json());
var engine = require("consolidate");
const { json } = require("express");
app.set("views", __dirname + "/views");
app.engine("html", engine.mustache);
app.set("view engine", "html");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/views"));

var remoteDB = "mongodb+srv://Senkasi:senkasimicheal@cluster0.rivod.mongodb.net/BankSystem";
mongoose.connect(remoteDB, { useNewUrlParser: true },{ useUnifiedTopology: true });

var userSchema = new mongoose.Schema({
    regDate: {
        type: Date,
        required: true,
        default: Date.now(),
      },
    name: String,
    phone: String,
    email: {
        type: String,
        unique: true,
        lowercase: true,
    },
    DOB: Date,
    gender: String,
    country: String,
    residence: String,
    nextOfKin: {
        type: String,
        default: ''
    },
    emailKin: {
        type: String,
        unique: true,
        lowercase: true,
        default: ''
    },
    accountNumber: Number,
    password1: String
});
const User = mongoose.model("user", userSchema);

var depositSchema = new mongoose.Schema({
    name: String,
    deposit: Number,
    accountnumber: Number,
    phone: Number
});
const Deposit = mongoose.model("deposit", depositSchema);

var withdrawSchema = new mongoose.Schema({
    name: String,
    withdrawal: Number,
    accountnumber: Number,
    phone: Number
});
const Withdraw = mongoose.model("withdraw", withdrawSchema);

var loanSchema = new mongoose.Schema({
    name: String,
    loan: Number,
    accountnumber: Number
});
const Loan = mongoose.model("loan", loanSchema);

app.get('/register', (req, res)=>{
    res.render("account.html");
});
app.post('/register', async(req, res)=>{
    
        try{
            
            const Existemail = await User.findOne({email: req.body.email});
            if(Existemail){
                res.send("User already exists")
            }else{
                if(req.body.password1 !== req.body.password2){
                    res.send("passwords do not match")
                }else{
                    var Rnumber = Math.floor(1000000000000 + Math.random() * 9000000000000);
                    const hashedPwd = await bcrypt.hash(req.body.password1, 10);
                    const insertUser = await User.create({
                        regDate: Date.now(),
                        name: req.body.name,
                        phone: req.body.phone,
                        email: req.body.email,
                        DOB: req.body.DOB,
                        gender: req.body.gender,
                        country: req.body.country,
                        residence: req.body.residence,
                        nextOfKin: req.body.nextOfKin,
                        emailKin: req.body.emailKin,
                        accountNumber: Rnumber,
                        password1: hashedPwd
                    });
                    res.render("deposit.html");
                    
                }
            }
        }
        catch(error){
            res.send("Internal Server error Occured");
        }
    });
        
        
app.get('/myprediction', (req, res) => {
    res.render('predict.html')
})

app.post('/myprediction', async (req, res) => {
    const {clients, ploans} = req.body

    try{
        const users = await User.find();
        if(clients && ploans){
            const a = 2749441.935; //in User.find()
            const b = 6146116.003; //in User.find()
            const depo = a*(parseInt(clients)) + b*(parseInt(ploans))
            res.json({depo, status: 200})  

        }else{
            throw new Error("Invalid inputs")
        }    
    }
    catch(err){
        res.json({status: 500, error: err.message})
    }

})

app.get('/deposit', (req, res)=>{
    res.render("transactions.html");
});

app.post('/deposit', async(req, res)=>{
    try {
        const Existaccount = await User.findOne({accountNumber: req.body.accountnumber});
        if(Existaccount){
            const cmp = await bcrypt.compare(req.body.password1, Existaccount.password1);
            if(cmp){
                const insertDepo = await Deposit.create({
                    name: Existaccount.name,
                    loan: req.body.loan,
                    accountnumber: req.body.accountnumber
                });
                res.send("Deposit was successful to " + req.body.accountnumber);
            }else{
                res.send("Wrong password");
            }
        }else{
            res.send("User account is not found!!, Check your account number and try again");
        }
    } catch (error) {
        res.status(500).send("Internal Server error Occured");
    }
});

app.get('/withdraw', (req, res)=>{
    res.render("transactions.html");
});

app.post('/withdraw', async(req, res)=>{
    try {
        const Existaccount = await User.findOne({accountnumber: req.body.accountnumber});
        if(Existaccount){
            const cmp = await bcrypt.compare(req.body.password1, Existaccount.password1);
            if(cmp){
                const insertWith = await Withdraw.create({
                    name: Existaccount.name,
                    withdrawal: req.body.withdrawal,
                    accountnumber: req.body.accountnumber,
                    phone: req.body.phone
                });
                res.send("Withdrawal of " + req.body.withdrawal + " has been initiated on account "+  req.body.accountnumber);
            }else{
                res.send("Wrong password");
            }
            
        }else{
            res.send("User account is not found!!, Check your account number and try again");
        }
    } catch (error) {
        res.status(500).send("Internal Server error Occured");
    }
});

app.get('/loan', (req, res)=>{
    res.render("transactions.html");
});

app.post('/loan', async(req, res)=>{
    try {
        const Existaccount = await User.findOne({accountnumber: req.body.accountnumber});
        if(Existaccount){
            const cmp = await bcrypt.compare(req.body.password1, Existaccount.password1);
            if(cmp){
                const insertLoan = await Loan.create({
                    name: Existaccount.name,
                    loan: req.body.loan,
                    accountnumber: req.body.accountnumber,
                    phone: req.body.phone
                });
                res.send("Loan of " + req.body.loan + " has been initiated" + " on " + req.body.accountnumber + " Please wait for service providers response");
    
            }else{
                res.send("Wrong password");
            }
        }
    } catch (error) {
        res.json({
            status: 500,
            error: "User account is not found!!, Check your account number and try again"
        })
    }
});
app.get('/details', (req, res)=>{
    res.render("details.html");
});
app.post('/details', async(req, res)=>{
    const Existemail = await User.findOne({email: req.body.email});
    if(Existemail){
            session = req.session;
            session.userid = Existemail;
            res.redirect("/details");
    }else{
        res.send("User does not exist");
    }
});

app.get("/getSession", async (req, res) => {
    res.json({
      user: req.session.userid,
    });
  });
  
  app.get("/list", async (req, res) => {
    res.render("details.html", {
      list: req.session.userid,
    });
  });

app.listen(port, ()=> {
    console.log("Server is running on 5000");
  });