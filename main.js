localVariables = { pumpMotor: '', dht11: { hum: 0, temp: 0 }, user: {} }
function openScreen(name, func) {
  screens = ['login', 'dashboard', 'weather', 'pump', 'sensors', 'sensor-data', 'my-farm', 'lights']
  for (i = 0; i < screens.length; i++) {
    document.getElementById(`${screens[i]}-screen`).style.display = 'none'
  }
  document.getElementById(`${name}-screen`).style.display = 'block'
  func()
}
function blank() {
  console.log('Function Blank Triggered!')
}
function load() {
  // openScreen('pump', blank)
  // openScreen('sensor-data',()=>{loadSensors('1','moisture')})
  if (firebase.auth().currentUser) {
    openScreen('dashboard', loadDashboard)
  } else {
    openScreen('login', blank)
  }
  loadTopBars()
  loadCropOptions()
  sensorData()
  loadWaterReq()
}
function loadWaterReq() {
  // firebase.database().ref('smartFarm/water').once('value', (snapshot) => {
  //   data = snapshot.val()
  //   dailyReqmL = data.req;
  //   dailyReqTime = data.time;
  //   document.getElementById('pump-req-vol').innerHTML = dailyReqmL;
  //   document.getElementById('pump-req-time').innerHTML = dailyReqTime;
  // })
}
function loginWithEmail() {
  email_elem = document.getElementById('login-emailid')
  password_elem = document.getElementById('login-pwd')
  email = email_elem.value;
  pwd = password_elem.value;
  firebase.auth().signInWithEmailAndPassword(email, pwd)
    .then((userCredential) => {
      localVariables.user = firebase.auth().currentUser
      console.log(localVariables.user);
      user = localVariables.user;
      openScreen('dashboard', loadDashboard);
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      Swal.fire({
        title: errorMessage,
        text: `Code : ${errorCode}`,
        icon: 'error'
      })
    });
}
function saveMyFarm() {
  const user = firebase.auth().currentUser;

  user.updateProfile({
    displayName: document.getElementById('my-farm-name').value
  }).then(() => {


  }).catch((error) => {
    Swal.fire({
      title: error.errorMessage,
      text: `Code ${error.errorCode}`,
      icon: 'error'
    })
  });
  openScreen('dashboard', loadDashboard)
}
function loadCropOptions() {
  crops_list = [{ name: 'Wheat', delta: 37.5 }, { name: 'Rice', delta: 120 }, { name: 'Jowar', delta: 45 }, { name: 'Bajra', delta: 47.5 }]
  crops_list_elem = document.getElementById('crop-options')
  crops_list_elem.innerHTML = ''
  for (i = 0; i < crops_list.length; i++) {
    crops_list_elem.innerHTML += `<option>${crops_list[i].name}</option>`
  }
}
function calcArea(value) {
  conversion_to_sqm = { acres: 4046.8564224, hectares: 10000, ares: 100, sqm: 1, sqkm: 1000000, sqfeet: 0.0929034 }
  unit = document.getElementById('my-farm-area-unit').value
  sqm_lbl = document.getElementById('my-farm-area-sqm')
  if (value) {
    conversion = conversion_to_sqm[unit]
    converted = Math.round(value * conversion * 100) / 100
    sqm_lbl.innerHTML = converted
  } else {
    sqm_lbl.innerHTML = 0
  }
  calculateNoOfPlants(document.getElementById('my-farm-plants-sqm').value)
}
function loadMyFarm() {
  user = firebase.auth().currentUser
  document.getElementById('my-farm-name').value = user.displayName;
}
function calculateNoOfPlants(persqm) {
  area = Number(document.getElementById('my-farm-area-sqm').innerHTML)
  persqm = Number(persqm)
  totalPlants = area * persqm
  document.getElementById('my-farm-total-plants').innerHTML = totalPlants
  finalLivingPlants = totalPlants * 0.7
  estdYield = Math.round((((finalLivingPlants / 15.43) / 1000) * 1000)) / 1000
  document.getElementById('my-farm-estd-yield').innerHTML = estdYield
}
function loadTopBars() {
  // Direct Place it Under Screen : 
  //  <div class="topBar"></div>
  elems = document.querySelectorAll('.topBar')
  for (i = 0; i < elems.length; i++) {
    txt = elems[i].parentElement.id;
    txt = txt.replace('-screen', '')
    elems[i].innerHTML = `<span style="cursor:pointer;" onclick="openScreen('dashboard',loadDashboard)">
    <img width="30" height="30" src="https://img.icons8.com/fluency-systems-filled/96/back--v1.png"
        alt="back--v1" />
</span>
&nbsp;&nbsp;
<span style="font-size: 20px;text-transform: capitalize;">${txt.replace('-', ' ')}</span>
`;
  }
}
function loadSensorData(sensorName) {
  console.log(sensorName)
}
function loadDashboard() {
  user = firebase.auth().currentUser
  document.getElementById('dashboard-userName').innerHTML = user.displayName;
}
function loadSensors() {

}
function loadWeather() {
  setTimeout(function () {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        arr = JSON.parse(this.responseText);
        document.getElementById("weather-main").innerHTML = arr.weather[0].main
        document.getElementById("weather-area").innerHTML = arr.name
        document.getElementById("weather-icon").alt = arr.weather[0].main
        document.getElementById("weather-icon").src = arr.weather[0].icon
        document.getElementById("weather-temp").innerHTML = Math.round(arr.main.temp)
        document.getElementById("weather-temp-min").innerHTML = (arr.main.temp_min) + '℃'
        document.getElementById("weather-temp-max").innerHTML = (arr.main.temp_max) + '℃'
        document.getElementById('weather-sunrise').innerHTML = new Date(arr.sys.sunrise * 1000).toLocaleTimeString()
        document.getElementById('weather-sunset').innerHTML = new Date(arr.sys.sunset * 1000).toLocaleTimeString()
      }
    };
    xhttp.open("GET", "https://fcc-weather-api.freecodecamp.repl.co/api/current?lat=19.223458&lon=72.835972");
    xhttp.send();
  }, 2000)
}
function googleTranslateElementInit() {
  new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'hi,mr,kn,gu,ml,sa,en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element');
}
function getPumpMotorState() { //Updates localVariables.pumpMotor
  firebase.database().ref('/smartFarm/pump/state').once('value', (snapshot) => {
    state = snapshot.val()
    localVariables.pumpMotor = state
  })
}
function setPumpMotorState(state) {
  firebase.database().ref('/smartFarm/pump/state').set(state)
}
function sensorData() {
//   firebase.database().ref('/smartFarm/sensor').on('value', (snapshot) => {
//     const data = snapshot.val();
//     if (data) {
//       dht11 = data.dht11;
//       sms = data.sms;
//       hum = dht11.hum
//       temp = dht11.temp
//       moisture = sms.moisture
//       document.getElementById('pump-soil-moisture').innerHTML = moisture;
//       document.getElementById('sensors-hum').innerHTML = hum
//       document.getElementById('sensors-temp').innerHTML = temp
//       document.getElementById('sensors-moisture').innerHTML = moisture
//     } else {
//       Swal.fire({ title: 'Sensor Data Error!!!' })
//     }
//   })
}
// function speakloud() {
//   all_text_elems = document.querySelectorAll('a, span, label, button,h1,h2,h3,h4,h5,h5.div')
//   for (i = 0; i < (all_text_elems.length - 1); i++) {
//     elem = all_text_elems[i];
//     elem.addEventListener("dblclick", () => {
//       txt = elem.innerText
//       const voices = window.speechSynthesis.getVoices();
//       var selectedVoice = voices.find(voice => voice.lang === 'en-IN');
//       if (selectedVoice) {
//         console.log(txt)
//         const message = new SpeechSynthesisUtterance(txt);
//         message.voice = selectedVoice;
//         window.speechSynthesis.speak(message);
//       } else {
//         console.error('Selected voice not found.');
//       }
//     })
//     continue;
//   }
// }
function signOut() {
  firebase.auth().signOut().then(() => {
    openScreen('login', blank)
  }).catch((error) => {
    // An error happened.
  });
}
function startPumpTimer() {
  document.getElementById('timer-modal').style.display = 'none'
  time = Number(document.getElementById('pump-timer-inp').value)
  time *= 1000
  pumpRef = firebase.database().ref('/smartFarm/pump/state');
  pumpRef.set('on')
  sendTelegramMessage('6846898178:AAHWX64n-Y6qBJSlybWaZorW1qruwCLFuBI','6507962398','The Pump Turned On')  
  timer = setTimeout(function () {
    pumpRef.set('off')
    sendTelegramMessage('6846898178:AAHWX64n-Y6qBJSlybWaZorW1qruwCLFuBI','6507962398','The Pump Turned Off')
  }, time)
}
function stopPumpTimer() {
  document.getElementById('timer-modal').style.display = 'none'
  clearInterval(timer)
}
function startPumpMotor(elem) {
  pumpRef = firebase.database().ref('/smartFarm/pump/state');
  pumpRef.once('value', (snapshot) => {
    const data = snapshot.val()
    if (data == 'on') {
      pumpRef.set('off');
      elem.innerHTML = 'Start Pump'
    } else {
      pumpRef.set('on')
      elem.innerHTML = 'Stop Pump'
    }
  })
}
function startLED(elem) {
  ledRef = firebase.database().ref('/smartFarm/lights/state');
  ledRef.once('value', (snapshot) => {
    const data = snapshot.val();
    if (data == 'on') {
      ledRef.set('off')
      elem.innerHTML = 'Start LED'
      sendTelegramMessage('6846898178:AAHWX64n-Y6qBJSlybWaZorW1qruwCLFuBI','6507962398','The Light Turned On Until Morning')
    } else {
      ledRef.set('on')
      elem.innerHTML = 'Stop LED'
      sendTelegramMessage('6846898178:AAHWX64n-Y6qBJSlybWaZorW1qruwCLFuBI','6507962398','The Light Turned Off')
    }
  })
}

function sendTelegramMessage(token, chat_id, toSend) {
  url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${toSend}&parse_mode=html`
  let api = new XMLHttpRequest()
  api.open('GET', url, true)
  api.send()

}
