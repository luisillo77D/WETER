const climaContainer = document.getElementById("climaContainer");
const presaveContainer = document.getElementById("presaveContainer");
const API_KEY = "c449aa28a9fb47352d09c9e37a47211f";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather?q=";
const CIUDADES = [
  "Hermosillo",
  "Guadalajara",
  "Monterrey",
  "Comonfort",
  "Mazatlán",
];

const ObtenerClima = async (ciudades) => {
  try {
    const fetchPromises = ciudades.map(async (ciudad) => {
      const response = await fetch(
        `${BASE_URL}${ciudad}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      return data;
    });
    const climas = await Promise.all(fetchPromises);
    console.log(climas);
    return climas;
  } catch (error) {
    console.error(error);
  }
};

const GuardarEnLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};

const ObtenerDeLocalStorage = (key) => {
  return localStorage.getItem(key);
};

const EliminarDeLocalStorage = (key) => {
  localStorage.removeItem(key);
};

const eliminarCiudad = (ciudad) => {
    const storedCiudades = JSON.parse(ObtenerDeLocalStorage("ciudades"));
    const index = storedCiudades.indexOf(ciudad);
    storedCiudades.splice(index, 1);
    GuardarEnLocalStorage("ciudades", JSON.stringify(storedCiudades));
    }

const ActualizarClimaContainer = (clima) => {
  climaContainer.innerHTML = `
    <div class="card w-75 card-main fw-bold">
        <div class="card-body">
            <div class="d-flex justify-content-between">
                <div class="d-flex align-items-center">
                    <img src="img/location.svg" alt="location">
                    <h2 class="my-auto location">${clima.name}</h2>
                </div>
                <button class="btn btn-danger" onClick="
                EliminarDeLocalStorage('ciudad');
                MostrarClimaLocal();
                ">X</button>
            </div>
            <div class="d-flex justify-content-evenly justify-items-center">
            <div class="d-flex flex-column justify-content-center">
                <h2 class="card-title text-center temp">${clima.main.temp}°C</h2>
            </div>
            <div class="d-flex justify-content-center text-center justify-items-center flex-column">
                <img src="http://openweathermap.org/img/w/${clima.weather[0].icon}.png">
                <h5 class="my-auto">${clima.weather[0].main}</h5>
            </div>
            </div>
        </div>
    </div>
    `;
};

const MostrarClimaLocal = async () => {
  climaContainer.innerHTML = "";
  const ciudad = ObtenerDeLocalStorage("ciudad");
  if (!ciudad) {
    climaContainer.innerHTML = ``;
  } else {
    const climaCiudad = await ObtenerClima([ciudad]);
    if (climaCiudad[0].cod === "404") {
      alert("Ciudad no encontrada");
        EliminarDeLocalStorage("ciudad");
      return;
    }
    console.log(climaCiudad);
    ActualizarClimaContainer(climaCiudad[0]);
  }
};

const ActualizarPresaveContainer = (clima, ciudadMasCaliente) => {
  presaveContainer.innerHTML = `
    <div class="card most-heat text-light presave-cont">
        <div class="card-body">
            <div class="d-flex justify-content-start justify-items-center">
            <img src="http://openweathermap.org/img/w/${ciudadMasCaliente.weather[0].icon}.png">
            <h5 class="my-auto">${ciudadMasCaliente.main.temp}°C</h5>
            </div>
            <h5 class="card-title">${ciudadMasCaliente.name}</h5>
        </div>
    </div>
    `;

  clima.forEach((ciudad) => {
    CIUDADES.includes(ciudad.name) ? 
        presaveContainer.innerHTML += `
        <div class="card opacity-75 presave-cont">
            <div class="card-body">
                <div class="d-flex justify-content-start justify-items-center">
                <img src="http://openweathermap.org/img/w/${ciudad.weather[0].icon}.png">
                <h5 class="my-auto">${ciudad.main.temp}°C</h5>
                </div>
                <h5 class="card-title">${ciudad.name}</h5>
            </div>
        </div>
        ` : 
        presaveContainer.innerHTML += `
        <div class="card opacity-75 presave-cont">
            <div class="card-body">
            <div class="d-flex justify-content-between">
                <button class="btn btn-danger" onClick="
                eliminarCiudad('${ciudad.name}');
                MostrarPresave();">X</button>
            </div>
                <div class="d-flex justify-content-start justify-items-center">
                <img src="http://openweathermap.org/img/w/${ciudad.weather[0].icon}.png">
                <h5 class="my-auto">${ciudad.main.temp}°C</h5>
                </div>
                <h5 class="card-title">${ciudad.name}</h5>
            </div>
        </div>
        `;
  });
};

const MostrarPresave = async () => {
  const storedCiudades = ObtenerDeLocalStorage("ciudades");
  if (storedCiudades) {
    const ciudades = JSON.parse(storedCiudades);
    ciudades.forEach(ciudad => {
        if (!CIUDADES.includes(ciudad)) {
            CIUDADES.push(ciudad);
        }
    });
     }
  presaveContainer.innerHTML = "";
  const clima = await ObtenerClima(CIUDADES);
  const ciudadMasCaliente = clima.reduce((prev, current) =>
    prev.main.temp > current.main.temp ? prev : current
  );
  const index = clima.indexOf(ciudadMasCaliente);
  clima.splice(index, 1);
  ActualizarPresaveContainer(clima, ciudadMasCaliente);
};

const GuardarCiudad = () => {
  const ciudad = document.getElementById("ciudad").value;
  GuardarEnLocalStorage("ciudad", ciudad);
  MostrarClimaLocal();
};

document.getElementById("addCity").addEventListener("click", () => {
  const ciudad = document.getElementById("city").value;
  //COMPROBAR QUE NO ESTE EN EL ARRAY DE CIUDADES
  if (CIUDADES.includes(ciudad)) {
    alert("La ciudad ya esta en la lista");
    document.getElementById("city").value = "";
    return;
  }
  CIUDADES.push(ciudad);
  //guardar en local storage pero si ya hay una ciudad guardada, agregarla a la lista
  const storedCiudades = ObtenerDeLocalStorage("ciudades");
  if (storedCiudades) {
    //guardar las ciudades en un array
    const ciudades = JSON.parse(storedCiudades);
    ciudades.push(ciudad);
    GuardarEnLocalStorage("ciudades", JSON.stringify(ciudades));
  } else {
    GuardarEnLocalStorage("ciudades", JSON.stringify([ciudad])); // Guardar como array
  }
    MostrarPresave();
    document.getElementById("city").value = "";
});

document.getElementById("saveCity").addEventListener("click", GuardarCiudad);

MostrarPresave();
MostrarClimaLocal();