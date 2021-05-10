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
var globalTime = new Date();
var gameState = 'game menu';
var answer = [];
var answered = [];
var objectList = ['dog', 'cat', 't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'];
AFRAME.registerComponent('hello-world', {
  init: function () {
    loadScene();
  }
});

const loadScene = () => {
  let scene = document.querySelector('a-scene');
  objectList.forEach(element => {
    let object = createObject(element);
    scene.append(object);
  });
}
// Component to set error message when the Wit.ai token has not been updated
AFRAME.registerComponent('error-message', {
  init: () => {
    if (TOKEN === "REPLACE TOKEN") {
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
        if (!transcript.includes(`hey ${WAKE_WORD}`) && gameState === 'game menu') {
          // Provide the user with a suggestion on voice commands they can say
          textEl.setAttribute("text", `value:Try saying: 'Hey ${WAKE_WORD}, Start game'`);
          return;
        }
        else if (!transcript.includes(`difference`) && gameState === 'game play') {
          // Provide the user with a suggestion on voice commands they can say
          textEl.setAttribute("text", `value:Try saying: 'difference \"objects\"'`);
          return;
        }

        // Extract the utterance from the wake word
        let utterance = ''
        if (gameState === 'game menu') {
          utterance = transcript.split(`hey ${WAKE_WORD}`)[1];
        } else if (gameState === 'game play') {
          utterance = transcript;
        }

        // Send the user's utterance to Wit.ai API for NLU inferencing
        fetch(`https://api.wit.ai/message?v=20210414&q=${utterance}`, {
          headers: {Authorization: `Bearer ${TOKEN}`}
        })
          .then(response => response.json())
          .then(json => {
            // Add a 3D object to the scene based on the NLU inferencing result
            let scene = document.querySelector('a-scene');
            entities = json["entities"]
            if (entities["object:object"]) {
              let objectType = entities["object:object"][0].value;
              let object = createObject(objectType);
              scene.append(object);
            }
            else if (entities["expression_game:expression_game"]) {
              let game_setup = entities["expression_game:expression_game"][0].value;
              if (game_setup == 'start') {
                globalTime = new Date();
                gameState = 'game play';
              }
            }
          });
      }
    };
  }
});

// Function for creating 3D objects
// Currently this function only supports box, cylinder, and sphere at fix positions
function createObject(objectType) {
  let object = document.createElement(`a-entity`);
  switch (objectType) {
    case "dog":
      object.setAttribute("position", "0 2 -5");
      object.setAttribute("gltf-model", '#dog');
      object.setAttribute('id', 'dog-entity');
      break;
    case "cat":
      object.setAttribute("position", "3 1 -5");
      object.setAttribute("scale", "0.1 0.1 0.1");
      object.setAttribute("gltf-model", '#cat');
      object.setAttribute('id', 'cat-entity');
      break;
  }
  return object;
}

AFRAME.registerComponent('timertext', {
  tick: function (time, timeDelta) {
    var el_ttimer = document.querySelector('#timertext');
    var d = millisToMinutesAndSeconds(new Date() - globalTime);
    el_ttimer.setAttribute('text', 'value: ' + d + '; color: #FAFAFA; width: 5; anchor: align');
  }
});

const millisToMinutesAndSeconds = (millis) => {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  //ES6 interpolated literals/template literals 
  //If seconds is less than 10 put a zero in front.
  return `${minutes}:${(seconds < 10 ? "0" : "")}${seconds}`;
}
