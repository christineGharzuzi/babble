/* Babble global variables contains the user login info */
var babble = {
    currentMessage: "",
    userInfo: {
        name: "",
        email: ""
    }
};

window.Babble = {
    register: function(userInfo) {
        localStorage.setItem('babble', JSON.stringify({currentMessage: "", userInfo: {name: userInfo.name, email: userInfo.email}}));
    },
    getMessages: function(counter, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var output = JSON.parse(this.responseText);
                callback(output);
            }
        }
        xhr.open('GET', "http://localhost:9000/messages?counter=" + counter, true);
        xhr.send();
    },

    postMessage: function(messages, callback) {
        console.log("postMessage", messages);
        var myJSON = JSON.stringify(messages);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var output = JSON.parse(this.responseText);
                console.log("finished:", output);
                callback(output);
            }
        }
        xhr.open("POST", "http://localhost:9000/messages", true);
        xhr.send(myJSON);
    },

    deleteMessage: function(id, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(JSON.parse(this.responseText));
            }
        }
        xhr.open('DELETE', "http://localhost:9000/messages/" + id, true);
        xhr.send();
    },

    getStats: function(callback) {
        console.log("getStats");
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var data = JSON.parse(this.responseText);
                callback(data);
            }
        }
        xhr.open("GET", "http://localhost:9000/Stats", true);
        xhr.send();
    },
}

function updateLocalStorage(e) {
    babble.currentMessage = e.value;
    babble.userInfo = JSON.parse(localStorage.getItem('babble')).userInfo;
    localStorage.setItem('babble', JSON.stringify(babble));
}

var form = document.getElementById("textInput");
form.addEventListener('submit', function(e) {
    e.preventDefault();
    var data = {
        name: String,
        email: String,
        message: String,
        timestamp: Number,
        id: Number,
        photo: String
    };
    babble = JSON.parse(localStorage.getItem('babble'));
    for (var i = 0; i < form.elements.length; i++) {
        var element = form.elements[i];
        if (element.name) {
            data.name = babble.userInfo.name;
            data.email = babble.userInfo.email;
            data.message = (element.value);
            element.value = "";
            var today = new Date();
            data.timestamp = today.getHours().toString() + ':' + today.getMinutes().toString();
        };
    }
    Babble.postMessage(data, emptyCurrentMessage);
});

window.onload = function() {
    /* Babble has not yet been assing to localStorage*/
    var currentBabble = JSON.parse(localStorage.getItem("babble"));
    if (currentBabble !== null) {
        modal = document.getElementById("login");
        modal.style.display = "none";
        Babble.getStats(uploadOnlines);
    } /* User is already loggedin here */

    var currentBabble = JSON.parse(localStorage.getItem("babble"));
    if(!currentBabble){
        localStorage.setItem("babble", JSON.stringify({currentMessage:"", userInfo: {name:"", email:""}}));
    }

    var anonymous = document.getElementsByClassName("anonymous")[0];
    var save = document.getElementsByClassName("save")[0];
    var userInfo = {
        name: String,
        email: String
    };
    var login = document.getElementById("login");
    anonymous.onclick = function() {
        userInfo.name = "Anonymous";
    }
    save.onclick = function() {
        userInfo.name = document.getElementById("name").value;
        userInfo.email = document.getElementById("email").value;
    }
    login.addEventListener('submit', function(e) {
        e.preventDefault();
        registerNewUser(userInfo);
        poll(getNewMessages);
    });
}

function poll(callback) {
    callback();
}

function uploadOnlines(data) {
    document.getElementById("stats").innerHTML = data.onlines;
    poll(getNewMessages);
}

function getNewMessages() {
    var counter = document.getElementById("msgStats").innerHTML;
    Babble.getMessages(counter, updateNewMessages);
}

function updateNewMessages(data) {
    document.getElementById("stats").innerHTML = data.stats.onlines;
    document.getElementById("msgStats").innerHTML = data.stats.count;
    printMessages(data.messages);
}

function printMessages(messages) {
    console.log("inside printfMessages");
    postMessage(messages, poll);
}

function deleteMessageRequest() {
    console.log(this.id);
    Babble.deleteMessage(this.id, updateDelete);
}

function updateDelete(data) {
    var id = "message" + data.id;
    var child = document.getElementById(id);
    var parent = document.getElementById("newMsg");
    parent.removeChild(child);
}

function getNewStats() {
    Babble.getStats(poll);
}

function registerNewUser(userInfo) {
    console.log("inside register", userInfo);
    var login = document.getElementById("login");
    var data = {
        name: String,
        email: String
    };

    if (userInfo.name == "Anonymous") {
        data.name = "Anonymous";
        data.email = "Anonymous";
    } else {
        data.name = userInfo.name;
        data.email = userInfo.email;
    }
    var req = {
        userInfo: data,
        count: document.getElementById("msgStats").innerHTML
    };
    var myJSON = JSON.stringify(req);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var res = JSON.parse(this.responseText);
            Babble.register(res.userInfo);
            modal = document.getElementById("login")
            modal.style.display = "none";
            document.getElementById("stats").innerHTML = res.onlines;
        }
    }
    xhr.open(login.method, login.action);
    xhr.send(myJSON);
}

function emptyCurrentMessage() {
    babble = JSON.parse(localStorage.getItem('babble'));
    babble.currentMessage = "";
    localStorage.setItem('babble', JSON.stringify(babble));
}

function postMessage(messages) {
    console.log("inside postMessagestoMain");
    if (!messages) {
        i = 0;
    } else {
        i = messages.length;
    }
    for (j = 0; j < i; j++) {
        var msg = document.createElement("span");
        var name = document.createElement("cite");
        var time = document.createElement("time");
        var photo = document.createElement("img")
        var deleteButton = document.createElement("button");
        var form = document.createElement("form");
        var newMsg = document.createElement("div");
        var messageWrap = document.createElement("li");
        var currentBabble = JSON.parse(localStorage.getItem('babble'));
        newMsg.className = "messageContent";
        messageWrap.style.listStyleType = "none";
        if (messages[j].name == "") {
            name.appendChild(document.createTextNode("Anonymous"));
        } else {
            name.appendChild(document.createTextNode(messages[j].name));
        }
        newMsg.appendChild(name);

        if (messages[j].name != "" && messages[j].email === currentBabble.userInfo.email) {
            deleteButton.className = "deleteButton";
            deleteButton.appendChild(document.createTextNode("x"));
            deleteButton.onclick = deleteMessageRequest;
            deleteButton.id = messages[j].id;
            newMsg.appendChild(deleteButton);
        }
        time.appendChild(document.createTextNode(messages[j].timestamp));
        newMsg.appendChild(time);
        var emptyDev = document.createElement("div");
        emptyDev.className = "emptyDev";
        newMsg.appendChild(emptyDev);
        msg.appendChild(document.createTextNode(messages[j].message));
        newMsg.appendChild(msg);
        photo.className = "avatar";
        photo.src = messages[j].photo;
        messageWrap.id = "message" + messages[j].id;
        messageWrap.appendChild(photo);
        messageWrap.appendChild(newMsg);
        document.getElementById("newMsg").appendChild(messageWrap);
        
    }
    poll(getNewMessages);
}