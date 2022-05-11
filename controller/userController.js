const fs = require("fs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const responce = (res, statusCode, status, message) => {
  return res.status(statusCode).json({
    status,
    message,
  });
};

const userNameAndPass = (username, pass, first, last) => {
  if (
    /^[a-z]+$/.test(username) &&
    username.length >= 4 &&
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/.test(pass) &&
    /^[A-Za-z]+$/.test(first) &&
    /^[A-Za-z]+$/.test(last)
  ) {
    return true;
  } else {
    return false;
  }
};

exports.signup = (req, res, next) => {
  let usrData = {
    username: req.body.username,
    password: crypto
      .createHash("sha256")
      .update(req.body.password)
      .digest("hex"),
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  };

  if (
    userNameAndPass(
      req.body.username,
      req.body.password,
      req.body.firstname,
      req.body.lastname
    )
  ) {
   fs.readFile(`./userdata.json`, (err, data) => {
      if (err) {
        fs.appendFile(
          `./userdata.json`,
          JSON.stringify([usrData], true, 2),
          (err) => {
            if (err) throw err;
            responce(res, 201, true, "SignUp success. Please proceed to Signin");
          }
        );
      } else {
        let fileData = JSON.parse(data);
        if (fileData.filter((el) => el.username == req.body.username).length == 0) {
          fileData.push(usrData);
          fs.writeFile(
            `./userdata.json`,
            JSON.stringify(fileData, null, 2),
            (err) => {
              if (err) throw err;
            }
          );
          responce(res, 201, true, "SignUp success. Please proceed to Signin");
        } else {
          responce(res, 409, "failed", "user already exits");
        }
      }
    });
  } else {
    const message = "check validation username,password,fistname,lastname";
    responce(res, 400, "invalid", message);
  }
};



exports.signin = (req, res, next) => {
  
    let userInfo = null;
    let { username, password } = req.body;
    
    if (!username || !password) {
      return responce(
        res,
        400,
        "error",
        "please provide username and password"
      );
    }
    password = crypto.createHash("sha256").update(password).digest("hex")
    fs.readFile(`./userdata.json`, "utf8", (err, data) => {
      if (err) throw err;
      let users = JSON.parse(data);
      users.map((user) => {
        if (user.username === username && user.password === password) {
          userInfo = user;
        }
      });
    
      if(!userInfo || !userInfo.password === password){
            return responce(res, 500, "fail", "wrong credintials")
      }
  
      const token = 
      jwt.sign({username:userInfo.username,firstname:userInfo.firstname},process.env.JWT_SEC)
    return  res.status(200).json({
        result: true,
        jwt: token,
        message: "Signin success",
      });
    });
  
};


exports.me = async(req,res,next)=>{
    try {
        let userInfo = null;
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }
        if (!token) {
            return responce(res,401,'fail','please provide jwt token')
          }

          const decode = await jwt.verify(token,process.env.JWT_SEC)  
          
          fs.readFile(`./userdata.json`, "utf8", (err, data) => {
            if (err) throw err;
            let users = JSON.parse(data);
            users.map((user) => {
              if (user.username === decode.username) {
                userInfo = {
                    firstname:user.firstname,
                    lastname:user.lastname,
                    password:user.password
                };
              }
            });
        //   console.log(userInfo);
        res.status(200).json({
            result:true,
            data:userInfo
        })
        }) 

    } catch (error) {
        console.log(error);
    }
   
}
