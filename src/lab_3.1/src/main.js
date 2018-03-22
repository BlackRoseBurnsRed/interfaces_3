
function showErrorMessage(error, query) {
  let errorMsg =
    `Произошла ошибка
    Код ошибки: ${error.code}
    Сообщение: ${error.message}
    ${query ? 'Запрос: ' + query : ''}`
  alert(errorMsg);
}

(function($){				
	jQuery.fn.lightTabs = function(options){

		var createTabs = function(){
			tabs = this;
			i = 0;
			
			showPage = function(i){
				$(tabs).children("div").children("div").hide();
				$(tabs).children("div").children("div").eq(i).show();
				$(tabs).children("ul").children("li").removeClass("active");
				$(tabs).children("ul").children("li").eq(i).addClass("active");
			}
								
			showPage(0);				
			
			$(tabs).children("ul").children("li").each(function(index, element){
				$(element).attr("data-page", i);
				i++;                        
			});
			
			$(tabs).children("ul").children("li").click(function(){
				showPage(parseInt($(this).attr("data-page")));
			});				
		};		
		return this.each(createTabs);
	};	
})(jQuery);

var currentDir = ""

initCurrentDirectory = () => {
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

function initFiles() {
  $.ajax({
    type: 'GET',
    url: '/api/dirinfo',
    dataType: "json",
    success: function(data) {
      if(data.success) {
        let dirsTable = $('.dirs-info>tbody')[0];
        dirsTable.innerHTML = "";
        let filesTable = $('.files-info>tbody')[0];
        filesTable.innerHTML = "";
        let rename_list = $('.rename-list')[0];
        let list = $('.files-rename')[0];
        rename_list.innerHTML = "";
        for(index in data.items) {
          let row = document.createElement('tr')
          $(document.createElement('td')).html(data.items[index].name).appendTo(row)
          $(document.createElement('td')).html(data.items[index].size).appendTo(row)
          $(document.createElement('td')).html(data.items[index].birthtime).appendTo(row)
          $(document.createElement('td')).html(data.items[index].atime).appendTo(row)


          if (data.items[index].isDirectory) {
            $(row).appendTo(dirsTable);
          } else if (data.items[index].isFile) {
            $(document.createElement('li'))
              .html(data.items[index].name)
              .addClass('file_for_rename')
              .appendTo(rename_list)
            $(row).appendTo(filesTable);
          }
        }
      } else {        
        showErrorMessage(data.error);
      }
    },
    error(err) {
      showErrorMessage(err);
    }
  })
  initRenameList();
}

initRenameList = () => {
  console.log('Initialization rename list')
  $(document).on('click', '.file_for_rename', function() {
    $(this).toggleClass("active-rename-file");
  })
}

initAllInfo = () => {
	$.ajax({
    type: 'GET',
    url: '/api/curdir',
    dataType: "json",
    success: function(data) {
      if(data.success) {
        currentDir = (navigator.userAgent.indexOf ('Windows') != -1) ? data.curdir.replace(/\\/g, '/') : data.curdir;
        $('input#current-directory')[0].value = currentDir;
      } else {        
        showErrorMessage(data.error);
      }
    }
  })
  initCurrentDirectory();
  initFiles();
}

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
          initAllInfo();
      } else {        
        showErrorMessage(data.error);
      }
    }
  })
})

$('button.rename.button').on('click', () => {
  let filesForRename = [];
  $('.active-rename-file').each((index, item) => {
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
        initAllInfo();
      } else {
        showErrorMessage(data.error);
      }
    } else {        
        showErrorMessage(data.error);
      }
  })
})

$(document).ready(function(){
	$(".tabs").lightTabs();
	initAllInfo()
});