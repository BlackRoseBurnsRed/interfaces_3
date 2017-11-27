var currentDir = "";

function initCurrentDirectory() {
  $.ajax({
    type: 'GET',
    url: '/api/curdir',
    dataType: "json",
    success: function(data) {
      if(data.success) {
        currentDir = (navigator.userAgent.indexOf ('Windows') != -1) ? data.curdir.replace(/\\/g, '/') : data.curdir;
        $('input#current-directory')[0].value = currentDir;
      }
    }
  })
}

function changeDir(newDir) {
  $.ajax({
    type: 'GET',
    url: '/api/changedir',
    data: {path: newDir},
    dataType: "json",
    success: function(data) {
      if(data.success) {
          currentDir = data.newDir;
          $('input#current-directory')[0].value = currentDir;
          initFiles();
      } else {
        alert("Wrong path\n" + $('input#current-directory')[0].value)
        $('input#current-directory')[0].value = currentDir;
      }
    }
  })
}

function openFolder(item) {
  let folderName = $(item).find(".fileName").text();
  let newDir = currentDir + '/' + folderName;
  changeDir(newDir)
}

function initFiles() {
  $.ajax({
    type: 'GET',
    url: '/api/dirinfo',
    dataType: "json",
    success: function(data) {
      if(data.success) {
        let directoryFiles = $('.directory-files')[0];
        directoryFiles.innerHTML = "";
        for(index in data.items) {
          let item = $(document.createElement('div'))[0];
          $(item).addClass("item");
          $(item).addClass(data.items[index].isFile ? "file" : "directory");
          /*if (data.items[index].isFile) {
            $(document.createElement('img')).attr({src: "../img/pen.png"}).appendTo(item);
          }*/
          $(document.createElement('div')).addClass('img').appendTo(item);
          let caption = document.createElement('div');
          caption.innerHTML = data.items[index].name;
          $(caption).addClass('fileName').appendTo(item);
          $(item).appendTo(directoryFiles)
        }

        $('.file').on('click', function() {
          $(this).toggleClass("active-file");
          if ($('.active-file').length === 0) {
            $('button.rename').removeClass("rename-one").removeClass("rename-some").hide();
          } else if($('.active-file').length === 1) {
            $('button.rename').addClass("rename-one").removeClass("rename-some").html('Rename file').show();
          } else {
            $('button.rename').addClass("rename-some").removeClass("rename-one").html('Rename files').show();
          }
        })

        /*$('.directory').on('click', function() {
          $(this).toggleClass("active-directory");
        })*/

        $('.directory').on('dblclick', function() {
          openFolder($(this));
        })

        $('img.back-dir').on('click', function() {
          let newDir = currentDir.split('/');
          newDir.pop();
          newDir = newDir.join('/');
          changeDir(newDir);
        })
      }
    },
    error(err) {

    }
  })
}

$(document).ready(function() {
  initCurrentDirectory();
  initFiles();
  $('button.rename').hide();
})

$('button.rename').on('click', () => {
  let filesForRename = [];
  $('.active-file').children('.fileName').each((index, item) => {
    filesForRename.push(item.innerHTML)
  })
  console.log(filesForRename)
  let newFilesNames = [];
  for (let i = 0; i < filesForRename.length; i++) {
    let wrongName = true;
    while (wrongName) {
      let newName = prompt('Input new name for file ' + filesForRename[i], filesForRename[i])
      if(newName !== null && $.trim(newName) !== "") {
        wrongName = false
        newFilesNames.push(newName)
      }
    } 
  }
  console.log(newFilesNames)   

  $.ajax({
    type: 'GET',
    url: '/api/renameFiles',
    data: {'filesForRename': filesForRename, 'newFilesNames': newFilesNames},
    dataType: "json",
    success: function(data) {
      if(data.success) {
        initFiles()
      } else {
        alert('Shit happens (c)')
      }
    }
  })
})

$('button.update').on('click', () => {
  $.ajax({
    type: 'GET',
    url: '/api/changedir',
    data: {path: $('input#current-directory')[0].value},
    dataType: "json",
    success: function(data) {
      if(data.success) {
          currentDir = data.newDir;
          $('input#current-directory')[0].value = currentDir;
          initFiles();
      } else {
        alert("Wrong path\n" + $('input#current-directory')[0].value)
        $('input#current-directory')[0].value = currentDir;
      }
    }
  })
})
