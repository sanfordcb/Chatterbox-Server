/*
  Structure code to avoid spaghetti code
  Be cognizant of the variables on the global scope
  App should load itself; app.init() should not be invoked on this page; invoke it in a script tag
    in index.html
  Decoupling logic
  Try to loosely couple the methods within the app
    Should not rely on one method to influence another method
    Methods should be good at ONE thing
*/

/*
  User Expectations / User Experiences
    // Remember my username \\
    // Remember room I was last in \\ 
    // Chat messages to load for the room I am in (default room is lobby) \\
    // Chat messages to refresh and be up to date \\
    // Add my own chat messages \\
    // Create a new room \\
    // See all the rooms \\
    // Change the room I am in and see messages for the room \\
    Add friends
    Be able to distinguish messages from friends
*/

// ~/classes/chatterbox ended the url on client side

var app;

$(document).ready(function() {
  app = {
    // set the server for use by all methods
    server: 'http://127.0.0.1:3000/classes/chatterbox',
    
    // set default username
    username: 'anonymous',
    
    // default room
    room: 'lobby',
    
    // friends object
    friends: {},
    
    init: function() {
      // grab username from the window prompt
      app.username = window.location.search.substr(10);
      
      app.$main = $('#main');
      app.$message = $('#message');
      app.$chat = $('#chats');
      app.$roomSelect = $('#roomSelect');
      app.$send = $('#send');

      app.$roomSelect.on('change', app.handleRoomChange);
      app.$send.on('submit', app.handleSubmit);
      app.$main.on('click', '.username', app.addFriend);
      
      app.stopSpinner();
      // go to server and get data
      app.fetch();
      
      // auto refresh chat log
      setInterval(app.fetch, 5000);
    },
    
    handleRoomChange: function(event) {
      var selectIndex = app.$roomSelect.prop('selectedIndex');
      
      if( selectIndex === 0) {
        // Create a new room
        var newRoom = prompt('Enter room name.'); // get new name from user
        if(newRoom) { // make sure valid name is passed
          app.room = newRoom; 
          app.addRoom(newRoom);
          app.$roomSelect.val(newRoom);
          app.fetch();
        }
      } else {
        //change room
        app.room = app.$roomSelect.val();
        // get data for new room
        app.fetch();
      }
    },
    
    send: function(data) {
      app.startSpinner();
      $.ajax({
        url : app.server,
        type : 'POST',
        data : JSON.stringify(data),
        contentType : 'application/json',
        success : function(result) {
          // posted successfully, get new data
          app.fetch();
        },
        error : function(reason) {console.log("Failed to send data: ", reason);},
        complete : function() {
          app.stopSpinner();
        }
      });
      
    },
    
    fetch: function() {
      app.startSpinner();
      // access server to get data
      $.ajax({
        url: app.server,
        type: 'GET',
        contentType: 'application/json',
        data: {order: '-createdAt'}, // gets 100 most recent data
        complete: function() {app.stopSpinner();},
        success: function(data) {
          // always process room data
          app.processRoomData(data.results);
          // always process and display chat data
          app.processDisplayChatData(data.results);
        },
        error: function(reason) {
          console.log('Failed to fetch data: ', reason);
        }
        
      })
      
    },
    
    startSpinner: function() {
      $('.spinner img').show();
    },
    
    stopSpinner: function() {
      $('.spinner img').hide();
    },
    
    
    processRoomData: function(results) {
      app.$roomSelect.html('<option value="__newRoom"> New Room...</option><option value="lobby" selected> Lobby</option>');
      
      // check if passed room data
      if(results) {
        var processedRooms = {};
        
        // adds new room to the processed rooms object
        if(app.room !== 'lobby') {
          app.addRoom(app.room);
          processedRooms[app.room] = true;
        }
        
        // iterate through the results and add room names to the processed rooms object
        results.forEach(function(data) {
          var roomName = data.roomname;
          if(roomName && !processedRooms[roomName]) {
            app.addRoom(roomName);
            processedRooms[roomName] = true;
          }
        });
      }
      // maintains state of the current room
      app.$roomSelect.val(app.room);
      
    },
        
    processDisplayChatData: function(results) {
      // remove all messages
      app.clearMessages();
      
      if(Array.isArray(results)) {
        results.forEach(app.addMessage);
      }
      
    },
    
    clearMessages: function() {
      app.$chat.html('');
    },
    
    addMessage: function(data) {
      if(!data.roomname) {
        data.roomname = 'lobby';
      }
      
      // only add message if in current room
      if(data.roomname === app.room) {
        var $message = $('<div class="chat" />');
        var $username = $('<span class="username" />');
        $username.text(data.username + ': ' ).attr('data-username', data.username)
          .attr('data-roomname', data.roomname)
          .appendTo($message);
        
        if(app.friends[data.username] === true) {
          $username.addClass('friend');
        }
          
        var $content = $('<br /><span />');
        $content.text(data.text)
          .appendTo($message);
          
        $message.appendTo(app.$chat);
      }
      
    },
    
    addRoom: function(name) {
      var $option = $('<option />').val(name).text(name);
      
      app.$roomSelect.append($option);
    },
    
    // simply handles the button click, does not send the data
    handleSubmit: function(event) {
      // prevents refresh of the page on submission
      event.preventDefault();
      
      var message = {
        username : app.username,
        roomname : app.room || 'lobby',
        text : app.$message.val()
      };
      
      app.send(message);
      
    },
    
    addFriend: function(event) {
      console.log('clicked to add a friend');
      event.preventDefault();
      
      var userName = $(event.currentTarget).attr('data-username');
      console.log(userName);
      if(userName !== undefined) {
        console.log('chatbox: adding %s as a friend', userName);
        
        app.friends[userName] = !app.friends[userName];
        
        var selector = '[data-username="' + userName.replace(/"/g, '\\\"') + '"]';
        $(selector).toggleClass('friend');
      }
    }
    
  }
  
  
});