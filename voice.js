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
var gameState = 'game loading';
var removeObject = [];
var showObject = [];
var answer = [];
var answered = [];
var objectList = ['dog', 'cat', 'chicken', 'bird', 'crocodile', 'lion', 'tiger', 'elephant', 'giraffe', 'duck'];
var objectFiltered = [];
AFRAME.registerComponent('hello-world', {
  init: function () {
    document.querySelector('a-assets').fileLoader.manager.onLoad = function () {
      loadScene();
      gameState = 'game menu';
      let textEl = document.querySelector('#text-object');
      textEl.setAttribute("text", `value:Start the game by saying: 'Hey ${WAKE_WORD}, Start game'`);
    };
  }
});


const loadScene = () => {
  let scene = document.querySelector('a-scene');
  objectList.forEach(element => {
    document.querySelector('#' + element).remove();
  });
  randomRemove1 = objectList[Math.floor(Math.random() * objectList.length)];
  objectFiltered = objectList.filter(item => item != randomRemove1);
  randomRemove2 = objectList[Math.floor(Math.random() * objectList.length)];
  objectFiltered = objectList.filter(item => item != randomRemove2);
  objectFiltered.forEach(element => {
    let object = createObject(element);
    scene.append(object);
  });
  randomRemove3 = objectList[Math.floor(Math.random() * objectList.length)];
  objectFiltered = objectList.filter(item => item != randomRemove3);
  randomRemove4 = objectList[Math.floor(Math.random() * objectList.length)];
  objectFiltered = objectList.filter(item => item != randomRemove4);
  showObject = [randomRemove1]
  removeObject = [randomRemove3, randomRemove4]
  answer = [randomRemove1, randomRemove3, randomRemove4]
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
        if (gameState === 'game loading') {
          textEl.setAttribute("text", `value: Please wait game is loading`);
          return;
        } else if (!transcript.includes(`hey ${WAKE_WORD}`) && gameState === 'game menu') {
          // Provide the user with a suggestion on voice commands they can say
          textEl.setAttribute("text", `value:Start the game by saying: 'Hey ${WAKE_WORD}, Start game'`);
          return;
        }
        else if (!transcript.includes(`difference`) && gameState === 'game play') {
          // Provide the user with a suggestion on voice commands they can say
          textEl.setAttribute("text", `value:Try saying: 'difference \"objects\"'`);
          return;
        }

        // Extract the utterance from the wake word
        let utterance = ''
        if (gameState === 'game loading') {
          utterance = ''
        } else if (gameState === 'game menu') {
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
              const checkAnswer = answer.find(objectType);
              if (checkAnswer) {
                answered.append(answer);
                answer = answer.filter(item => item != checkAnswer);
                if (answer.length == 0) {
                  loadScene();
                  gameState = 'game menu';
                  let textEl = document.querySelector('#text-object');
                  textEl.setAttribute("text", `value:Start the game by saying: 'Hey ${WAKE_WORD}, Start game'`);
                }
              }
            }
            else if (entities["expression_game:expression_game"]) {
              let game_setup = entities["expression_game:expression_game"][0].value;
              if (game_setup == 'start') {
                let scene = document.querySelector('a-scene');
                removeObject.forEach(element => {
                  document.querySelector('#' + element).remove();
                });
                showObject.forEach(element => {
                  let object = createObject(element);
                  scene.append(object);
                });
                gameState = 'game play';
                textEl.setAttribute("text", `value:Try saying: 'difference \"objects\"'`);
                globalTime = new Date();
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
    case "chicken":
      object.setAttribute("position", "-3 1 -5");
      // object.setAttribute("scale", "0.1 0.1 0.1");
      object.setAttribute("gltf-model", '#chicken');
      object.setAttribute('id', 'chicken-entity');
      break;
    case "bird":
      object.setAttribute("position", "6 1 -5");
      // object.setAttribute("scale", "0.1 0.1 0.1");
      object.setAttribute("gltf-model", '#bird');
      object.setAttribute('id', 'bird-entity');
      break;
    case "crocodile":
      object.setAttribute("position", "-6 1 -5");
      // object.setAttribute("scale", "0.1 0.1 0.1");
      object.setAttribute("gltf-model", '#crocodile');
      object.setAttribute('id', 'crocodile-entity');
      break;
    case "lion":
      object.setAttribute("position", "-9 1 -5");
      object.setAttribute("scale", "0.1 0.1 0.1");
      object.setAttribute("gltf-model", '#lion');
      object.setAttribute('id', 'lion-entity');
      break;
    case "tiger":
      object.setAttribute("position", "9 1 -5");
      // object.setAttribute("scale", "0.1 0.1 0.1");
      object.setAttribute("gltf-model", '#tiger');
      object.setAttribute('id', 'tiger-entity');
      break;
    case "giraffe":
      object.setAttribute("position", "12 1 -5");
      // object.setAttribute("scale", "0.1 0.1 0.1");
      object.setAttribute("gltf-model", '#giraffe');
      object.setAttribute('id', 'giraffe-entity');
      break;
    case "duck":
      object.setAttribute("position", "-12 1 -5");
      // object.setAttribute("scale", "0.1 0.1 0.1");
      object.setAttribute("gltf-model", '#duck');
      object.setAttribute('id', 'duck-entity');
      break;
    case "elephant":
      object.setAttribute("position", "15 1 -5");
      // object.setAttribute("scale", "0.1 0.1 0.1");
      object.setAttribute("gltf-model", '#elephant');
      object.setAttribute('id', 'elephant-entity');
      break;
  }
  return object;
}

AFRAME.registerComponent('timertext', {
  tick: function (time, timeDelta) {
    var el_ttimer = document.querySelector('#timertext');
    var d = millisToMinutesAndSeconds(globalTime - new Date() + 30000);
    if (gameState == 'game loading' || gameState == 'game menu') {
      el_ttimer.setAttribute('text', 'value: ; color: #FAFAFA; width: 5; anchor: align');
    } else {
      if (d > 0) {
        el_ttimer.setAttribute('text', 'value: ' + d + '; color: #FAFAFA; width: 5; anchor: align');
      } else {
        gameState = 'game menu'
        loadScene();
      }
    }
  }
});

AFRAME.registerComponent('text-left-answer', {
  tick: function (time, timeDelta) {
    var el_ttimer = document.querySelector('#text-left-answer');
    if (gameState == 'game loading' || gameState == 'game menu') {
      el_ttimer.setAttribute('text', 'value: ; color: #FAFAFA; width: 5; anchor: align');
    } else {
      answerleft = 3 - answered.length
      el_ttimer.setAttribute('text', 'value: ' + answerleft + ' need to be answered; color: #FAFAFA; width: 5; anchor: align');
    }
  }
});

const millisToMinutesAndSeconds = (millis) => {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  //ES6 interpolated literals/template literals 
  //If seconds is less than 10 put a zero in front.
  return `${minutes}:${(seconds < 10 ? "0" : "")}${seconds}`;
}
