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
        let directoryFiles = $('.directory-files')[0];
        let renameList = $('.rename-list')[0];
        directoryFiles.innerHTML = "";
        for(index in data.items) {
          let item = $(document.createElement('div'))[0];
          $(item).addClass("item");
          $(item).addClass(data.items[index].isFile ? "file" : "directory");
          $(document.createElement('div')).addClass('img').appendTo(item);
          let caption = document.createElement('div');
          caption.innerHTML = data.items[index].name;
          $(caption).addClass('fileName').appendTo(item);
          $(item).appendTo(directoryFiles)

          if (data.items[index].isFile) {
            let renameListItem = document.createElement('li')
            renameListItem.innerHTML = data.items[index].name
            $(renameListItem).appendTo(renameList)
          }
          $()
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

initAllInfo = () => {
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
          //initFiles();
      } else {
        alert("Wrong path\n" + $('input#current-directory')[0].value)
        $('input#current-directory')[0].value = currentDir;
      }
    }
  })
})

$(document).ready(function(){
	$(".tabs").lightTabs();
	initAllInfo()
});