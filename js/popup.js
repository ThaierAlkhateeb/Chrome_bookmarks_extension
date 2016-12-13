  var apiLink="http://dar-alhekma.com/bookmarks/php/";

  var google = new OAuth2('google', {
    approval_prompt:'auto',
    access_type:'online',
    client_id: '864952528811-8g8misrid2i4vik3ljdh6td927goe4k0.apps.googleusercontent.com',
    client_secret: '-l5rihvauciPV2OT4Fb3203o',
    api_scope: 'https://www.googleapis.com/auth/plus.profile.emails.read https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email'
  });
 
  function authorize(providerName) {
   
    var provider = window[providerName];
    provider.authorize(checkAuthorized);

  }
  function login(){
    $('#login-submit').click(function(){
       $.ajax({
            url:'localhost/test/user.php',
            type:'POST',
            data:{username:u,password:p},
            'success':function(){
              console.log('logedin');
            },
            'error':function(){
                 console.log('failed');
            }
      });
    });
  }
  function check(user,pass){
    var tmp=0; 
       $.ajax({
            async:false,
            url:'http://localhost/test/check.php',
            type:'POST',
            data:{username:user,password:pass},
            'success':function(data){
               tmp=1;
            },
            'error':function(){ 
                 tmp=2;
            }
      });
   return tmp;
  }
//--------------------------------------------checkAuthorized---------------------------------------
  function checkAuthorized() {
    console.log('checkAuthorized-google');

    ['google'].forEach(function(providerName) {
      var provider = window[providerName];
      var button = document.querySelector('#' + providerName);
       var loggedin=check('user','pass');
      if (provider.hasAccessToken() || loggedin ) {
      dumpBookmarks();
      var json="access_token="+provider.getAccessToken();
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          document.getElementById("demo").innerHTML = xhttp.responseText;
        }
      };
        xhttp.open("POST", apiLink+"user_info.php", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(json);

        console.log("https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token="+provider.getAccessToken());
        button.classList.add('authorized');
      } 
    
      else {
        document.getElementById("all").remove();
        button.classList.remove('authorized');
      }
    });
  }

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button#google').addEventListener('click', function() { authorize('google'); });
  document.querySelector('#login-submit').addEventListener('click', function() { auth('login-submit'); });
  document.querySelector('button#clear').addEventListener('click', function() { clearAuthorized() });
  checkAuthorized();
});



// Search the bookmarks when entering the search keyword.

$(function() {
  $('#search').change(function() {
     $('#bookmarks').empty();
     dumpBookmarks($('#search').val());
  });
});


//--------------------------------------------clearAuthorized---------------------------------------
  function clearAuthorized() {
    console.log('clear');
    alert('cleared');

    ['google'].forEach(function(providerName) {
      var provider = window[providerName];
      var access_token = provider.getAccessToken(); 
      var url = 'https://accounts.google.com/o/oauth2/revoke?token=' + access_token;
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET',url,false);
        xhr.onload = function(response){
          if(this.status == 200){
            //success
            console.log("user disconnected")
          
          }

        }
        xhr.send();
        localStorage.removeItem('name');
        localStorage.removeItem('imageUrl')
    } catch (error) {
        window.location = 'https://plus.google.com/apps';
    }

      provider.clearAccessToken();
    });
    checkAuthorized();
  }
// Traverse the bookmark tree, and print the folder and nodes.




function dumpBookmarks(query) {
  var bookmarkTreeNodes = chrome.bookmarks.getTree(
    function(bookmarkTreeNodes) {
      $('#bookmarks').append(dumpTreeNodes(bookmarkTreeNodes, query));
    });
}

function dumpTreeNodes(bookmarkNodes, query) {

	var p='';
  ['google'].forEach(function(providerName) {

 p = window[providerName];
});

  var list = $('<ul>');
  var arr=[];
  var i;
  for (i = 0; i < bookmarkNodes.length; i++) {
    list.append(dumpNode(bookmarkNodes[i], query));
    arr[i]=bookmarkNodes[i];
      
      }
var json = JSON.stringify(arr);
var blob = new Blob([json], {type: "application/json"});
var url  = URL.createObjectURL(blob);
var a = document.createElement('a');
a.download    = "jsonbackup.json";
a.href        = url;
a.textContent = "Download backup.json";
$('#json').empty();
document.getElementById('json').appendChild(a); 
//sendAllBookmarks(json,p);

return list;
}

function sendAllBookmarks(json,p){ 
$.ajax({
    type: 'POST',
    data: {json: json, folder: p.getAccessToken()},
    url: apiLink+"all_bookmarks.php",
    success: function(data){
        console.log('success-all');
    },
    error: function(){
      
        console.log('fail all'); 
    }
});
}
function dumpNode(bookmarkNode, query) {
var p='';
  ['google'].forEach(function(providerName) {

 p = window[providerName];
});

  if (bookmarkNode.title) {
    if (query && !bookmarkNode.children) {
      if (String(bookmarkNode.title).indexOf(query) == -1) {
        return $('<span></span>');
      }
    }
    var anchor = $('<a>');
    anchor.attr('href', bookmarkNode.url);
    anchor.text(bookmarkNode.title);
    /*
     * When clicking on a bookmark in the extension, a new tab is fired with
     * the bookmark url.
     */
    anchor.click(function() {
      chrome.tabs.create({url: bookmarkNode.url});
    });
    var span = $('<span>');
    var options = bookmarkNode.children ?
      $('<span>[<a href="#" id="addlink">Add</a>]</span>') :
      $('<span style="color:red;">[<a id="editlink" href="#">Edit</a> <a id="deletelink" ' +
        'href="#">Delete</a>]</span>');
    var edit = bookmarkNode.children ? $('<table><tr><td>Name</td><td>' +
      '<input id="title"></td></tr><tr><td>URL</td><td><input id="url">' +
      '</td></tr></table>') : $('<input>');
    // Show add and edit links when hover over.
        span.hover(function() {
        span.append(options);
        $('#deletelink').click(function() {
          $('#deletedialog').empty().dialog({
                 autoOpen: false,
                 title: 'Confirm Deletion',
                 resizable: false,
                 height: 140,
                 modal: true,
                  show: 'slide', 
                 overlay: {
                   backgroundColor: '#000',
                   opacity: 0.5
                 },
                 buttons: {
                   'Yes, Delete It!': function() {
                   //here will send ajax request to api
                    $.ajax({
                        type: 'POST',
                        data: {node:bookmarkNode, folder:p.getAccessToken()},
                        url: apiLink+"delete.php",
                        success: function(data){
                            console.log('delete success');
                        },
                        error: function(){
                          
                            console.log('delete fail'); 
                        }
                    });
                      chrome.bookmarks.remove(String(bookmarkNode.id));
                      span.parent().remove();
                      $(this).dialog('destroy');


                    },
                    Cancel: function() {
                      $(this).dialog('destroy');
                    }
                 }
               }).dialog('open');
         });
        $('#addlink').click(function() {
          $('#adddialog').empty().append(edit).dialog({
            autoOpen: false,
            closeOnEscape: true, 
             resizable: false,
            title: 'Add New Bookmark', 
            modal: true,
             show: 'slide', 
            buttons: {
            'Add' : function() {

               chrome.bookmarks.create({parentId: bookmarkNode.id,
                 title: $('#title').val(), url: $('#url').val()});
               $('#bookmarks').empty();
               $(this).dialog('destroy');
               window.dumpBookmarks();
             },
            'Cancel': function() {
               $(this).dialog('destroy');
            }
          }}).dialog('open');
        });
        $('#editlink').click(function() {
         edit.val(anchor.text());
         $('#editdialog').empty().append(edit).dialog({
           autoOpen: false,
           closeOnEscape: true, 
            resizable: false,
           title: 'Edit Title',
           modal: true,
           show: 'slide', 
           buttons: {
              'Save': function() {
              var prev=bookmarkNode;
                 chrome.bookmarks.update(String(bookmarkNode.id), {
                   title: edit.val()
                 });
                 anchor.text(edit.val());
                 var txt= (edit.val());
                    //here will send ajax request to api
                     $.ajax({
                        type: 'POST',
                        data: {preValue:prev,newValue:txt,folder:p.getAccessToken()},
                        url: apiLink+"update.php",
                        success: function(data){
                            console.log('update success');
                        },
                        error: function(){
                          
                            console.log('update fail'); 
                        }
                    });
                 options.show();
                 $(this).dialog('destroy');
              },
             'Cancel': function() {
                 $(this).dialog('destroy');
             }
         }}).dialog('open');
        });
        options.fadeIn();
      },
      // unhover
      function() {
        options.remove();
      }).append(anchor);
  }
  var li = $(bookmarkNode.title ? '<li>' : '<div>').append(span);
  if (bookmarkNode.children && bookmarkNode.children.length > 0) {
    li.append(dumpTreeNodes(bookmarkNode.children, query));
  }
  return li;
}

