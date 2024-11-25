
const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    try {
        //const token = req.headers.authorization;
        const token = req.cookies.token;
        if (!token) {
            throw new Error("Unauthorized token");
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        console.error(err);
        //res.status(401)//.json({ message: "Unauthorized User" });
        res.redirect("/login");
    }
};

module.exports = authMiddleware;





/**
 * router.get("/register", (req, res) => {
  res.render("Pages/register", {
    locals
  });
});


router.post("/register", async (req, res) => {
  try {
    req.body.password = bcrypt.hash(password, 10);

    if (!req.body) {
      res.status(400).json({
        message: "cannot add user"
      });
    }
    let newUser = new user(req.body);
    res.json(newUser);
    if (!newUser) {
      throw new Error(
        "cannot save user, check the request and try again"
      );
    }
    await newUser.save();
  } catch (err) {
    //res.json(err)
  }
});

/**
* POST -validate
* check if email address exists already
*/
/*
router.post("/validate", async (req, res) => {
  try {
    const {
      emailAddress
    } = req.body;

    let findUser = await user.findOne({
      emailAddress: emailAddress
    });
    console.log(findUser);
    if (findUser) {
      return res.json({
        exists: true,
        message: "email already exists"
      });
    } else {
      return res.json({
        exists: false,
        message: "email is available"
      });
    }
  } catch (err) {
    console.error(err);
  }
});

router.get("/login", (req, res) => {
  res.render("pages/register");
});
router.post("/login", async (req, res) => {
  try {
    let {
      emailAddress,
      password
    } = req.body;
    if (!emailAddress || !password) {
      res.status(401).json({
        message: "invalid request"
      });
    }

    let currentUser = await user.findOne({
      emailAddress: emailAddress
    });
    if (!currentUser) {
      res.status(401).json({
        message: "invalid username"
      });
    }

    let isValidPassword = await bcrypt.compare(
      currentUser.password,
      password
    );
    if (!isValidPassword) {
      res.status(401).json({
        message: "invalid password"
      });
    }
    if (currentUser.role === "customer") {
      res.redirect("/cart");
    }
    if (currentUser.role === "vendor") {
      res.redirect("/dashboard");
    }
  } catch (err) {}
});

router.post("/upload-image", upload.single("uploadFile"), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("no file uploaded");
    }
    // let filename = req.file.filename;
    // let originalname = req.file.originalname;
    let uploadPath = req.file.path;

    const data = new formData();
    data.append("uploadFile", req.file.buffer, req.file.originalname);

    let response = await fetch("https://api.imgur.com/3/upload", {
      method: "POST",
      headers: {
        "Content-Type": "image/jpg",
        "Authorization": "client-ID e2b328ad29f2fa8"
      },
      body: data
    });
    const jsonResponse = await response.json();

    if (response.status !== 200) {
      throw new Error(
        `Imgur API Error: ${response.status} - ${jsonResponse.data.error}`
      );
    }

    res.send(jsonResponse);
  } catch (err) {
    console.error(err);
  }
});

 */