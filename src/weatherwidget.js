const
	APIKEY = 'cf332e64a96dcb840feaf7b25240689a',
	cityList = [
	  "Орёл",
	  "Москва",
	  "Ливны"
	],
	switchInterval = 4000,
	timerInterval = 50,
	showHideTimePercent = 20, //%
	drawCloudTimePercent = 70, //%
	positionShift = 5,
	rainAngle = 45,
	maxRainLength = 10,
	sunInf = {x: 20, y: 20, radius: 9, RayCnt: 7},
	rainXY = [
		{x:13,y:45},
		{x:28,y:55},
		{x:37,y:55},
		{x:43,y:48},
		{x:53,y:48},
	],
	cloudStartPos = {
		x:30,
	    y:15,
	}
	clouds = [
		{x:30, y:40, r:12, a1: 1.0*Math.PI, a2:0.1*Math.PI},
		{x:50, y:30, r:15, a1: 0.5*Math.PI, a2:1.5*Math.PI},
		{x:35, y:20, r:9 , a1:-0.2*Math.PI, a2:1.0*Math.PI},
		{x:15, y:30, r:9 , a1:-0.5*Math.PI, a2:0.5*Math.PI},
	];		
		
let 
  switchCnt = 0,
  animCnt = 0,
  currentCityIndex,
  contex,
  PictureWidth,
  PictureHeight,
  animationTimerId,
  cityWeather = [],
  showAlert = true;

function drawCloud(context, swCnt){
	const
	  dx = 0;
	  dy = 0;
	context.beginPath();
	
	for (let ind=0;ind<clouds.length;ind++){
		let 
			finalX = clouds[ind].x,
			finalY = clouds[ind].y,
			r = clouds[ind].r,
			a1 = clouds[ind].a1,
			a2 = clouds[ind].a2,
			cloudDrawFrames = Math.trunc((switchInterval/timerInterval*showHideTimePercent/100)*drawCloudTimePercent/100),
			x,y;
			
		if (swCnt < cloudDrawFrames){
			x = cloudStartPos.x + swCnt*(finalX - cloudStartPos.x)/cloudDrawFrames,
			y = cloudStartPos.y + swCnt*(finalY - cloudStartPos.y)/cloudDrawFrames;
		} else {
			x = finalX;
			y = finalY;
		}
		context.arc(x,y,r,a1,a2,true);
	}
	context.fillStyle = "rgb(232,236,235)";
	context.fill();	
	context.closePath();
	context.stroke();
}

function drawSun(context,t){
	const 
		lineBeginAt = 3;
		lineLength = 7;
	 
	let x = sunInf.x,
	    y = sunInf.y;
		rad = sunInf.radius;
		n = sunInf.RayCnt;
	  
	context.beginPath();
	context.ellipse(x,y,rad,rad,0,0,2*Math.PI,false);
	context.stroke();
	context.closePath();
	
	let tt = 8*t/360;
	
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
		angle = 5*t,
		alpha = 2*Math.PI*rainAngle/360,
	    lineLength = Math.abs(maxRainLength*Math.sin(2*Math.PI*angle/360)),
		dxMax = maxRainLength*Math.cos(alpha),
		dyMax = maxRainLength*Math.sin(alpha),
		dx = Math.abs(lineLength*Math.cos(alpha)),
		dy = Math.abs(lineLength*Math.sin(alpha));		
		  
	context.beginPath();		
		
	for (let dropI=0; dropI<rainXY.length;dropI++){
		let 
		  x = rainXY[dropI].x,
		  y = rainXY[dropI].y;		
		if ((Math.trunc(angle%180)<90)) {	
			context.moveTo(x,y);
			context.lineTo(x+dx, y+dy);
		} else {
			x+=dxMax;
			y+=dyMax;
			context.moveTo(x,y);
			context.lineTo(x-dx, y-dy);
		}
	}
	context.closePath();
	context.stroke();
}

function drawWeather(Sun,Cloud,Rain,t,swCnt){	
	if (Cloud) {
		if (swCnt>(switchInterval/timerInterval*showHideTimePercent/100)*drawCloudTimePercent/100) {
			if (Rain) {
				drawRain(contex,t);
			}
			if (Sun) {
				drawSun(contex,t);
			}
		}
		drawCloud(contex,swCnt);
	} else {		
		if (Rain) {
			drawRain(contex,t);
		}
		if (Sun) {
			drawSun(contex,t);
		}
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
	  if (k++>3) {
		  if (showAlert) {
			  showAlert = false;
			  alert('No loaded cities. Try update page in 1 minute');
		  }
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

	let 
		Ni = switchInterval/timerInterval,
		Nc = Ni * showHideTimePercent/100,
		opacity;
	if (switchCnt <= Nc) {
		opacity = switchCnt/Nc;
	} else {
		if (switchCnt >= Ni-Nc) {
			opacity = (Ni-switchCnt)/Nc;
			if (switchCnt>=Ni-1) {
				switchCity();
				switchCnt = 0;
			}
		} else {
			opacity = 1;
		}
	}	
		
	
	let list = document.getElementsByClassName("HidingItem"),
	    item;
	for (item of list) {
		item.style.opacity = opacity;
	}
	
	item = document.getElementById("CityName");
	item.style.transform = `translateY(${positionShift*(1-opacity)}px)`;
	
	list = document.getElementsByName("droppingDownItems");	
	for (item of list) {
		if (switchCnt<Nc) {
			item.style.transform = `translateY(${positionShift*(opacity-1)}px)`;
		} else { 
			if (switchCnt>Ni-Nc) {
				item.style.transform = `translateY(${positionShift*(1-opacity)}px)`;		
			} else {
				item.style.transform = "translateY(0px)";
			}
	    }
	}

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
	drawWeather(sun,cloud,rain,animCnt,switchCnt);
	animCnt = (animCnt+1)%360;
	switchCnt++;
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