const chatBox = document.getElementById("chat-box");
const closeChat = document.getElementById("chat-close");
const chatDisplay = document.getElementById("chat-display");
const sendChat = document.getElementById("chat-send");
const inputChat = document.getElementById("chat-input");
const chatBoxDiv = document.getElementById("chat-box-div");

chatBox.addEventListener("click", () => {
  chatBoxDiv.style.display = "block";
  chatBoxDiv.style.opacity = "1";
});

sendChat.addEventListener("click", () => {
  if (inputChat.value) {
    chatDataTrack.send(inputChat.value);
    const outgoingMsg = document.createElement("div");
    const message = document.createElement("span");
    const sender = document.createElement("span");
    outgoingMsg.className = "incoming-message";
    outgoingMsg.style.alignItems = "flex-end";
    sender.className = "message-sender";
    message.innerHTML = inputChat.value;
    sender.innerHTML = "YOU";
    outgoingMsg.append(sender, message);
    chatDisplay.append(outgoingMsg);
    inputChat.value = "";
  }
});

closeChat.addEventListener("click", () => {
  chatBoxDiv.style.opacity = "0";
  chatBox.style.color = "";
  chatBoxDiv.style.display = "none";
});
