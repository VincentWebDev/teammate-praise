import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://playground-1b442-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const messageListDB = ref(database, "messageList");

const textareaMessage = document.getElementsByTagName("textarea");
const fromAndToUsers = document.getElementsByTagName("input");
const publishButton = document.getElementById("publish-button");
const messages = document.getElementById("messages");

publishButton.addEventListener("click", () => {
  const error = document.getElementById("error");

  if (
    textareaMessage[0].value &&
    fromAndToUsers[0].value &&
    fromAndToUsers[1].value
  ) {
    error.textContent = "";

    let date = new Date();
    push(messageListDB, {
      message: textareaMessage[0].value,
      from: fromAndToUsers[0].value,
      to: fromAndToUsers[1].value,
      date: `${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`,
      likeCount: 0,
    });
    textareaMessage[0].value = "";
    fromAndToUsers[0].value = "";
    fromAndToUsers[1].value = "";
  } else {
    error.textContent = "Please complete all fields";
  }
});

onValue(messageListDB, (snapshot) => {
  if (snapshot.exists()) {
    let messagesArray = Object.entries(snapshot.val());

    messages.innerHTML = "";

    for (let i = messagesArray.length - 1; i >= 0; i--) {
      let currentMessage = messagesArray[i];

      appendMessageToList(currentMessage);
    }
  }
});

let DBLocations = [];
function appendMessageToList(currentMessage) {
  let messageID = currentMessage[0];
  let messageData = currentMessage[1];
  DBLocations.push(ref(database, `messageList/${messageID}`));
  const newElement = document.createElement("div");

  newElement.classList.add("message-containers");

  newElement.innerHTML = `<strong>To ${currentMessage[1].to}</strong> <br/><br/>
    ${messageData.message} <br/><br/>
    <strong>From ${messageData.from}</strong>  <span class="likes"><img src=${
    messageData.likeCount > 0 ? "heart.svg" : "empty-heart.svg"
  } id="${messageID}" class="heart" alt="empty heart"/> ${
    messageData.likeCount
  }</span><br/><br/>
    <span class="date">${messageData.date}</span>`;
  messages.append(newElement);

  const heart = document.getElementById(`${messageID}`);
  //   localStorage.setItem(`messageLiked${messageID}`, "true");
  heart.addEventListener("click", () => {
    if (
      localStorage.getItem(`messageLiked${messageID}`) == "false" ||
      !localStorage.hasOwnProperty(`messageLiked${messageID}`)
    ) {
      localStorage.setItem(`messageLiked${messageID}`, "true");
      set(ref(database, "messageList/" + messageID), {
        ...messageData,
        likeCount: messageData.likeCount + 1,
      });
    } else {
      localStorage.setItem(`messageLiked${messageID}`, "false");

      set(ref(database, "messageList/" + messageID), {
        ...messageData,
        likeCount: messageData.likeCount - 1,
      });
    }
  });
}

let myInterval = setInterval(clearDB, 86400000);

function clearDB() {
  for (let message of DBLocations) {
    remove(message);
  }
  document.querySelectorAll(".message-containers").forEach((e) => e.remove());
  DBLocations = [];
  localStorage.clear();

  clearInterval(myInterval);
  myInterval = setInterval(clearDB, 86400000);
}
