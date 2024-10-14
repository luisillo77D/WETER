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
  const index = storedCiudades.indexOf(ciudad.toLowerCase());
  if (index !== -1) {
    storedCiudades.splice(index, 1);
    GuardarEnLocalStorage("ciudades", JSON.stringify(storedCiudades));
  }
};

const generarHTMLCiudad = (ciudad, esGuardada) => {
  return `
    <div class="card presave-cont shadow-lg">
        <div class="card-body">
            ${esGuardada ? '' : `
            <div class="d-flex justify-content-between">
                <button class="btn btn-danger" onClick="
                eliminarCiudad('${ciudad.name}');
                MostrarPresave();">X</button>
            </div>
            `}
            <div class="d-flex justify-content-start justify-items-center">
                <img src="http://openweathermap.org/img/wn/${ciudad.weather[0].icon}.png">
                <h5 class="my-auto">${ciudad.main.temp}°C</h5>
            </div>
            <h5 class="card-title">${ciudad.name}</h5>
        </div>
    </div>
    `;
};

const ActualizarClimaContainer = (clima) => {
  climaContainer.innerHTML = `
    <div class="card w-75 card-main fw-bold shadow-lg">
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
                <img src="http://openweathermap.org/img/wn/${clima.weather[0].icon}.png">
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
    <div class="card most-heat text-danger fw-bold presave-cont shadow-lg">
        <div class="card-body">
            <div class="d-flex justify-content-start justify-items-center">
            <img src="http://openweathermap.org/img/wn/${ciudadMasCaliente.weather[0].icon}.png">
            <h4 class="my-auto">${ciudadMasCaliente.main.temp}°C</h4>
            </div>
            <h4 class="card-title">${ciudadMasCaliente.name}</h4>
        </div>
    </div>
    `;

  clima.forEach((ciudad) => {
    const esGuardada = CIUDADES.includes(ciudad.name);
    presaveContainer.innerHTML += generarHTMLCiudad(ciudad, esGuardada);
  });
};

const MostrarPresave = async () => {
  const storedCiudades = ObtenerDeLocalStorage("ciudades");
  if (storedCiudades) {
    const ciudades = JSON.parse(storedCiudades);
    ciudades.forEach((ciudad) => {
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

document.getElementById("addCity").addEventListener("click", async () => {
  let ciudad = document.getElementById("city").value;
  ciudad = ciudad.toLowerCase();
  const response = await ObtenerClima([ciudad]);
  if (response[0].cod === "404") {
    alert("Ciudad no encontrada");
    document.getElementById("city").value = "";
    return;
  }
  if (CIUDADES.includes(ciudad)) {
    alert("La ciudad ya está en la lista");
    document.getElementById("city").value = "";
    return;
  }
  CIUDADES.push(ciudad);
  const storedCiudades = ObtenerDeLocalStorage("ciudades");
  if (storedCiudades) {
    const ciudades = JSON.parse(storedCiudades);
    ciudades.push(ciudad);
    GuardarEnLocalStorage("ciudades", JSON.stringify(ciudades));
  } else {
    GuardarEnLocalStorage("ciudades", JSON.stringify([ciudad]));
  }
  MostrarPresave();
  document.getElementById("city").value = "";
});

document.getElementById("saveCity").addEventListener("click", GuardarCiudad);

MostrarPresave();
MostrarClimaLocal();