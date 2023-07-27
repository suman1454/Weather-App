const userTab=document.querySelector("[data-userWeather]");
const searchTab=document.querySelector("[data-searchWeather]");
const userContainer=document.querySelector(".weather-container");

const grantAcessContainer=document.querySelector(".grant-location-container");
const searchForm=document.querySelector("[data-searchForm]");
const loadingScreen=document.querySelector(".loading-container");
const userInfoContainer=document.querySelector(".user-info-container");

const notFound = document.querySelector('.error-container');
const errorBtn = document.querySelector('[data-errorButton]');
const errorText = document.querySelector('[data-errorText]');
const errorImage = document.querySelector('[data-errorImg]');

const API_KEY = "168771779c71f3d64106d8a88376808a";
let currTab=userTab;
currTab.classList.add("current-tab");
getFromSessionStorage();


function switchTab(clickedTab)
{
    //checking if clicked tab is not the current tab then making all the changes
    // because if you click the current tab then noyhing to change
    if(currTab != clickedTab)
    {   
        notFound.classList.remove("active");
        currTab.classList.remove("current-tab");
        currTab=clickedTab;
        currTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active"))
        {
            notFound.classList.remove("active");
            userInfoContainer.classList.remove("active");
            grantAcessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        //if we were in serch waether container then now go to your weather container
        else{
            //remove form and user info container
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            notFound.classList.remove("active");

            //search for user tab
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener('click',() =>{
    //passing userTab as input para
    switchTab(userTab);
});

searchTab.addEventListener('click',() =>{
    //passing searchTab as input para
    switchTab(searchTab);
});

 //check if loacal coordiantes are present or not
function getFromSessionStorage(){
    const localCoordinates=sessionStorage.getItem("user-coordinates");

    //if loacl coordinates not found
    if(!localCoordinates){
        grantAcessContainer.classList.add("active");
    }
    //if localcoordinates found
    else
    {    
        //stored in JSON string form so converting into JSON object 
        const coordiantes=JSON.parse(localCoordinates);
        //call the function to fetch info according the the coordinates
        fetchUserWeatherInfo(coordiantes);
    }

}

async function fetchUserWeatherInfo(coordiantes){
    const {lat,lon}=coordiantes;

    grantAcessContainer.classList.remove("active");
    notFound.classList.remove("active");
    loadingScreen.classList.add("active");

    //API CALL
    try
    {
        const response= await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data= await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        //HW
        notFound.classList.add('active');
        errorImage.style.display = 'none';
        errorText.innerText = `Error: ${err?.message}`;
        errorBtn.style.display = 'block';
        errorBtn.addEventListener('click', fetchUserWeatherInfo);
    }
   
}

function renderWeatherInfo(weatherInfo){

    //fetch all elements
    const cityName=document.querySelector("[data-cityName]");
    const countryIcon=document.querySelector("[data-countryIcon]");
    const desc=document.querySelector("[data-weatherDesc]");
    const weatherIcon=document.querySelector("[data-weatherIcon]");
    const temp=document.querySelector("[data-temp]");
    const windspeed=document.querySelector("[data-windspeed]");
    const humidity=document.querySelector("[data-humidity]");
    const cloudiness=document.querySelector("[data-cloudiness]");

    //fetch values from weather info and put into UI
    cityName.innerText=weatherInfo?.name;
    countryIcon.src=`https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText=weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText=`${weatherInfo?.main?.temp} °C`;
    windspeed.innerText=`${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText=`${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText=`${weatherInfo?.clouds?.all} %`;

}

const grantAcessButton=document.querySelector("[data-grantAcess]");

//clicking on grant acesss button to get current loaction
grantAcessButton.addEventListener('click',() => {
    getLocation();
});

// ***** fuction starts to get current loaction coordiantes
function getLocation()
{
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        //HW show an allert foe no geolocation support available
        grantAcessButton.style.display = 'none';
    }
}

function showPosition(position)
{
    const userCoordinates= {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    //storing the current loaction coordinates inside session storage in a variable named as user-coordinates
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    //now calling this fn to fetch all the weather info of this loaction and show
    fetchUserWeatherInfo(userCoordinates);
}

// function ends *****

//handling form section
const searchInput=document.querySelector("[data-searchInput]");

searchForm.addEventListener('submit',(e) => {

    e.preventDefault();
    let cityName=searchInput.value;

    //cityname is empty
    if(cityName === "")
    {
        return;
    }
    //when you search any city name then this fn being called to fetch weather of that city
    else{
        fetchSearchWeatherInfo(cityName);
    }
});

async function fetchSearchWeatherInfo(city)
{
    loadingScreen.classList.add("active");
    notFound.classList.remove("active");
    userInfoContainer.classList.remove("active");
    grantAcessContainer.classList.remove("active");

    try{
        const response= await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data= await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        //HW
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.remove('active');
        notFound.classList.add('active');
        errorText.innerText = `${err?.message}`;
        errorBtn.style.display = "none";
    }
}
