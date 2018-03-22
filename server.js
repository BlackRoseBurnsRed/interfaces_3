var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var fs = require('fs')
var path = require('path')

var currentDir = __dirname;

ERRORS = {
  1001: {
    code: 1001,
    message: 'Запрашиваемая директория не найдена'
  },
  1002: {
    code: 1002,
    message: 'Некорректное имя файла'
  },
  1003: {
    code: 1003,
    message: 'Информация о директории недоступна'
  },
  1004: {
    code: 1004,
    message: 'Сервер недоступен'
  },
  1005: {
    code: 1005,
    message: 'Системная ошибка'
  }
}

var serverFunctions = {
  getErrorByCode(code) {
    return ERRORS[code];
  }
}

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

//Getting labs html files
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

app.get('/help', function(req, res) {
  res.sendFile(path.join(__dirname, 'src/help/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

app.get('/info', function(req, res) {
  res.sendFile(path.join(__dirname, 'src/help/info.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

app.get('/errors/1001.html', function(req, res) {
  res.sendFile(path.join(__dirname, 'src/help/errors/1001.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

//API URLS

// get current directory
router.get('/curdir', function(req, res) {
  console.log('Get')
  res.json({curdir: currentDir, success: true});
})

// change current directory
/**
 * @param {string} path in require
 */
router.get('/changedir', function(req, res) {
  if (!fs.existsSync(req.query.path)) {
    res.json({newDir: currentDir, success: false, error: serverFunctions.getErrorByCode('1001')})
    return
  } else {    
    currentDir = req.query.path;
  }
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
      console.log(stats)
      let file = {
        name: files[index],
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        size: stats.size,
        birthtime: stats.birthtime,
        atime: stats.atime
      }
      items.push(file);
    }

    res.json({'items': items, success: true})
  } catch(err) {
    console.log(err);
    res.json({success: false, error: serverFunctions.getErrorByCode('1003')})
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
    res.json({success: false, error: serverFunctions.getErrorByCode('1005')})
  }
})



/*app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'src/notFound/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})*/

// REGISTER ROUTES
// all of our api routes will be prefixed with /api
// =============================================================================
app.use('/api', router);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log(`Server opened on port ${port}`);
