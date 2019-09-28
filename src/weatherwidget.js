const
  switchInterval = 4000;
  timerInterval = 50,
  showHideTimePercent = 30; //%
  APIKEY = 'cf332e64a96dcb840feaf7b25240689a',
  cityList = [
	  "Орёл",
	  "Москва",
	  "Ливны"
  ]; 
  
let 
  t = 0,
  currentCityIndex,
  contex,
  PictureWidth,
  PictureHeight,
  animationTimerId,
  switchCityTimerId,
  cityWeather = [];

function drawCloud(context){
	const
	  dx = -5;
	  dy = -10;
	context.beginPath();
	
	context.arc(35+dx,50+dy,12,Math.PI,0.1*Math.PI,true);
	context.arc(55+dx,40+dy,15,Math.PI/2,3*Math.PI/2,true);
	context.arc(40+dx,30+dy,9,-0.2*Math.PI,1*Math.PI,true);
	context.arc(20+dx,40+dy,9,-Math.PI/2,Math.PI/2,true);
	context.fillStyle = "rgb(232,236,235)";
	context.fill();
	//context.stroke();
	//context.fillStyle = 'black';
	
	
	context.closePath();
	context.stroke();
}

function drawSun(context,t){
	const 
	  n = 7,
	  x = 20;
	  y = 20;
	  rad = 9
	  lineBeginAt = 3;
	  lineLength = 7;
	context.beginPath();
	context.ellipse(x,y,rad,rad,0,0,2*Math.PI,false);
	context.stroke();
	context.closePath();
	
	let tt = 5*t/360;
	
	context.beginPath();
	for(let i=0;i<n;i++){
		context.moveTo(x+ (rad+lineBeginAt)*Math.cos(tt+i*(2*Math.PI/n)),
		  y+ (rad+lineBeginAt)*Math.sin(tt+i*(2*Math.PI/n)));
		context.lineTo(x+ (rad+lineBeginAt+lineLength)*Math.cos(tt+i*(2*Math.PI/n)),
		  y+ (rad+lineBeginAt+lineLength)*Math.sin(tt+i*(2*Math.PI/n)));
	}
	context.stroke();
	context.closePath();
}

function drawRain(context,t){
	let
	  lineAngle = 45,
	  maxLineLength = 10,	  
	  angle;
		
	angle = 5*t;
	
	if (Math.trunc(angle%180)<90) {	
	
	  lineLength = Math.abs(maxLineLength*Math.cos(2*Math.PI*angle/360));
	  
		let
		  x = -lineLength*Math.cos((2*Math.PI)*lineAngle/360);
		  y = -lineLength*Math.sin((2*Math.PI)*lineAngle/360);
	    context.beginPath();
		
		context.moveTo(20,55);
		context.lineTo(20+x,55+y);
		context.moveTo(30,65);
		context.lineTo(30+x,65+y);
		context.moveTo(40,65);
		context.lineTo(40+x,65+y);
		context.moveTo(50,60);
		context.lineTo(50+x,60+y);
		context.moveTo(60,60);
		context.lineTo(60+x,60+y);
		context.closePath();
		context.stroke();

		context.closePath();
	} 
}

function drawWeather(Sun,Cloud,Rain,t){	
	if (Sun) {
		drawSun(contex,t);
	}
	if (Rain) {
		drawRain(contex,t);
	}
	if (Cloud){
		drawCloud(contex);
	}
}

function loadWeatherData(cityList){
	for (let i=0;i<cityList.length;++i){
		cityWeather[i] = undefined;
	}
	for (let i=0; i<cityList.length;++i){
		let requestURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityList[i]}&APPID=${APIKEY}`;		
		let request = new XMLHttpRequest();
		request.open('GET', requestURL);
		request.responseType = 'json';
		request.send();
		
		cityWeather[i] = undefined;
		request.onload = function() {
			if (request.response["cod"] == 200) {
				cityWeather[i] = request.response;
				if (currentCityIndex==-1) {
					currentCityIndex=i-1;
					switchCity();
					animationTimerId = setInterval(animationCycle,timerInterval);
					//switchCityTimerId = setInterval(switchCity,switchInterval);
				}
			} else {
				cityWeather[i] = undefined;
				alert(`Cannot load city "${cityList[i]}".\nResponse code: ${request.pesponse['cod']}`);
			}
		};
	}	
}

function switchCity(){	
	
	currentCityIndex = (currentCityIndex+1) % cityList.length;
	let k=1;
	while (cityWeather[currentCityIndex] == undefined) {
	  currentCityIndex = (currentCityIndex+1) % cityList.length;
		  alert('wat');
	  if (k++>3) {
		  return;
	  }
	}
	
	let cityName = document.getElementById('CityName'),
		cityTemperature = document.getElementById('CurrentTemperature'),
		cityHumidity = document.getElementById('AirHumidity'),
		cityAirSpeed = document.getElementById('AirSpeed'),
		cityPressure = document.getElementById('Pressure');
		
	cityName.innerHTML = cityList[currentCityIndex];
	let temp = Math.trunc(cityWeather[currentCityIndex]['main']['temp']-273);
	if (temp>0){
		cityTemperature.innerHTML = "+"+temp;
	} else {
		cityTemperature.innerHTML = temp;
	}
	cityHumidity.innerHTML = Math.trunc(cityWeather[currentCityIndex]["main"]["humidity"]);
	cityAirSpeed.innerHTML = Math.trunc(cityWeather[currentCityIndex]["wind"]["speed"]);
	cityPressure.innerHTML = Math.trunc(cityWeather[currentCityIndex]["main"]["pressure"]);
}

function animationCycle(){	

	let Ni = switchInterval/timerInterval,
		Nc = Ni * showHideTimePercent/100,
		Nt = t%Ni,
		opacity;
	if (Nt <= Nc) {
		opacity = Nt/Nc;
	} else {
		if (Nt >= Ni-Nc) {
			opacity = (Ni-Nt)/Nc;
			if (Nt>=Ni-1) {
				switchCity();
			}
		} else {
			opacity = 1;
		}
	}
	
		
	let widgetDiv = document.getElementById("WeatherWidget");
	widgetDiv.style.opacity = opacity;

	contex.clearRect(0,0,pictureWidth,pictureHeight);
	let 
	  weather = cityWeather[currentCityIndex]["weather"][0]["main"],
	  sun,cloud,rain;
	switch (weather){
		case "Clear": 
			sun = true;
			cloud = false;
			rain = false;
		break;
		case "Clouds": 
			sun = true;
			cloud = true;
			rain = false;
		break;
		case "Rain": 
			sun = true;
			cloud = true;
			rain = true;
		break;
		default: 
	  sun = cloud = rain = false;
	}
	drawWeather(sun,cloud,rain,t);	
	t++;
}


function startWeatherWidget(){
	let img = document.getElementById('WeatherPicture');
	if (img.getContext){
		contex = img.getContext('2d');
		pictureWidth = img.width;
		pictureHeight = img.height;
		currentCityIndex = -1;
		loadWeatherData(cityList);		
	}
};