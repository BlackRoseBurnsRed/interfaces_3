var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var fs = require('fs')
var path = require('path')

var currentDir = __dirname;

// configure app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// config static server for SPA startfile
let lab_work = 2; // 1-First var, 2-Second var
let lab_path = lab_work === 1 ? "lab_3.1" : "lab_3.2";
app.use(express.static(__dirname));

var port = process.env.PORT || 8888; // set port

// ROUTES FOR APPLICATION API
// =============================================================================
var router = express.Router(); // get an instance of the express Router

router.use(function(req, res, next) {
    // do logging
    next();
});

app.get('/lab32', function(req, res) {
  res.sendFile(path.join(__dirname, 'src/lab_3.2/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

app.get('/lab31', function(req, res) {
  res.sendFile(path.join(__dirname, 'src/lab_3.1/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

// get current directory
router.get('/curdir', function(req, res) {
  res.json({curdir: currentDir, success: true});
})

// change current directory
/**
 * @param {string} path in require
 */
router.get('/changedir', function(req, res) {
  if (fs.existsSync(req.query.path))
    currentDir = req.query.path;
  res.json({newDir: currentDir, success: fs.existsSync(req.query.path)})
})

// get directory info
/**
 * @param {string} path in require for dir info
 */
router.get('/dirinfo', function(req, res) {
  try {
    let directory = req.query.path ? req.query.path : currentDir;
    let files = fs.readdirSync(directory);
    let items = [];

    for (index in files) {
      let stats = fs.statSync(path.join(directory, files[index]));
      let file = {
        name: files[index],
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile()
      }
      items.push(file);
    }

    res.json({'items': items, success: true})
  } catch(err) {
    console.log(err);
    res.json({success: false, error: err})
  }
})

router.get('/renameFiles', function(req, res) {
  try {
    let filesForRename = req.query.filesForRename;
    let newFilesNames = req.query.newFilesNames;
    let error = false

    console.log(filesForRename)
    console.log(newFilesNames)

    for(let i = 0; i < filesForRename.length; i++) {
      fs.rename(path.join(currentDir, filesForRename[i]), path.join(currentDir, newFilesNames[i]), (err) => {
        error = err
      })
    }

    res.json({success: true})
  } catch(err) {
    console.log(err);
    res.json({success: false, error: err})
  }
})

// REGISTER ROUTES
// all of our api routes will be prefixed with /api
// =============================================================================
app.use('/api', router);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log(`Server opened on port ${port}`);
