/* Copyright (c) Facebook, Inc. and its affiliates. */

// Intiatilize an instance of SpeechRecognition from the Web-Speech-API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = true;
recognition.maxAlternatives = 1;

// Obtain it from your Wit.ai app's Settings page
const TOKEN = "JA5ACRJCVXTMZBSIQAHLT6TFDPLQ5D53";

// Set your wake word
const WAKE_WORD = "gizmo";

AFRAME.registerComponent('hello-world', {
  init: function () {
    console.log('Hello, World!');
    let scene = document.querySelector('a-scene');
    let object = createObject("dog");
    scene.append(object);
  }
});
// Component to set error message when the Wit.ai token has not been updated
AFRAME.registerComponent('error-message', {
  init: () => {
    if (TOKEN === "JA5ACRJCVXTMZBSIQAHLT6TFDPLQ5D53") {
      let textEl = document.querySelector('#text-object');
      textEl.setAttribute("text", `value: UPDATE CODE WITH YOUR WIT.AI TOKEN`);
    }
  }
});

// Component to for voice commands
AFRAME.registerComponent('voice-command', {
  init: () => {
    recognition.start();
    recognition.onresult = (event) => {
      console.log(event.results)
      let utteranceList = event.results;
      let latestUtterance = utteranceList[utteranceList.length - 1];
      let speechRecognition = latestUtterance[latestUtterance.length - 1];

      // Update text object with speech recognition transcription
      let transcript = speechRecognition.transcript.toLowerCase();
      let textEl = document.querySelector('#text-object');
      textEl.setAttribute("text", `value:${transcript}`);

      if (latestUtterance.isFinal) {
        // Exit the function if the wake word was not triggered to respect user privacy
        if (!transcript.includes(`hey ${WAKE_WORD}`)) {
          // Provide the user with a suggestion on voice commands they can say
          textEl.setAttribute("text", `value:Try saying: 'Hey ${WAKE_WORD}, Start game'`);
          return;
        }

        // Extract the utterance from the wake word
        let utterance = transcript.split(`hey ${WAKE_WORD}`)[1];

        // Send the user's utterance to Wit.ai API for NLU inferencing
        fetch(`https://api.wit.ai/message?v=20210414&q=${utterance}`, {
          headers: {Authorization: `Bearer ${TOKEN}`}
        })
          .then(response => response.json())
          .then(json => {
            // Add a 3D object to the scene based on the NLU inferencing result
            let scene = document.querySelector('a-scene');
            let objectType = json["entities"]["object:object"][0].value;
            let object = createObject(objectType);
            scene.append(object);
          });
      }
    };
  }
});

// Function for creating 3D objects
// Currently this function only supports box, cylinder, and sphere at fix positions
function createObject(objectType) {
  let object = document.createElement(`a-entity`);
  if (objectType === "dog") {
    object.setAttribute("position", "0 2 -5");
    object.setAttribute("gltf-model", '#dog');
    object.setAttribute('id', 'dog-entity');
  } else if (objectType === "cat") {
    object.setAttribute("position", "0 1 -5");
    object.setAttribute("gltf-model", '#cat');
    object.setAttribute('id', 'cat-entity');
  }
  return object;
}
