console.log("This is a background script.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("receive message:", request, sender);
  if (!sender.tab) {
    if (request === "test-speech") {
      testSpeech().then(sendResponse);
    }
  }
  return true;
});

async function testSpeech() {
  return "test speech done.";
}
