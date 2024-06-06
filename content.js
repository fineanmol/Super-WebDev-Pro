// Inject a script to the page to access various features
const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");
(document.head || document.documentElement).appendChild(script);

window.addEventListener("message", function (event) {
  if (event.source !== window || !event.data.superWebDevExtension) {
    return;
  }
  chrome.runtime.sendMessage(event.data);
});
