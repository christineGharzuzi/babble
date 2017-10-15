var messages = [];
var deletedMessages = [];
var mainjs = require('./main');


module.exports.addMessage  = function(message) {
        message.id = messages.length + deletedMessages.length;
        if (message.name === "Anonymous"){
            message.photo = "https://www.gravatar.com/avatar/a9737e84ef01e33fa2d2a961131a0229?s=36&d=identicon";
        } else {
            message.photo = "https://www.gravatar.com/avatar/" + message.photo;
        }
        messages.push(message);
        return message.id;
}

module.exports.getMessages  = function(count) {
    console.log("get new messages:")
        data = [];
        if(messages.length > count){
            data = messages.slice(count, messages.length + 1);
            return data;
        }
        else {
            return data;
        }
}

module.exports.deleteMessage  = function(id) {

            for (var i = 0 ; i < messages.length ; i ++){
                if(messages[i].id == id)
                    break;
            }
            console.log("message to delete", messages[i]);
            console.log(i);
            deletedMessages.push(messages[i]);
            var item = messages[i];
            messages.splice(i, 1);
            console.log("messages now:", messages);
            return item;
}
