const climaContainer = document.getElementById('climaContainer');
const presaveContainer = document.getElementById('presaveContainer');
const API_KEY = "c449aa28a9fb47352d09c9e37a47211f";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather?q=";
const CIUDADES = ['Hermosillo', 'Guadalajara', 'Monterrey', 'Comonfort', 'Mazatlan'];
const LOCALSTORAGE = localStorage.getItem('ciudad');

const ObtenerClima = async (ciudades) => {
    try{
        const fetchPromises = ciudades.map(async ciudad => {
            const response = await fetch(`${BASE_URL}${ciudad}&appid=${API_KEY}&units=metric`);
            const data = await response.json();
            return data;
        });
        const climas = await Promise.all(fetchPromises);
        console.log(climas);
        return climas;
    }
    catch(error){
        console.error(error);
    }
}

const GuardarCiudad = () => {
        const ciudad = document.getElementById('ciudad').value;
        localStorage.setItem('ciudad', ciudad);
        //pasamos el array de ciudades y la nueva ciudad a la funcion ObtenerClima para que nos regrese el clima de todas las ciudades
        MostrarClima();
}

const MostrarClima = async () => {
    climaContainer.innerHTML = '';
    if (LOCALSTORAGE){
        //mostramos los climas de las ciudades RECORRIENDO EL ARRAY DE CLIMAS
        const climaCiudad = await ObtenerClima([LOCALSTORAGE]);
        climaContainer.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Clima ${climaCiudad[0].name}</h5>
                <p>Temperatura: ${climaCiudad[0].main.temp}</p>
                <p>Presion: ${climaCiudad[0].main.pressure}</p>
                <p>Humedad: ${climaCiudad[0].main.humidity}</p>
                <p>Temperatura Minima: ${climaCiudad[0].main.temp_min}</p>
                <p>Temperatura Maxima: ${climaCiudad[0].main.temp_max}</p>
            </div>
        </div>
        `;
    }
    else{
        climaContainer.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Clima</h5>
                <label for="ciudad">Ciudad</label>
                <input type="text" id="ciudad" class="form-control">
                <button class="btn btn-primary" onclick="GuardarCiudad()">Guardar</button>
            </div>
        </div>
        `;
    }
}

const MostrarPresave = async () => {
    presaveContainer.innerHTML = '';
    const clima = await ObtenerClima(CIUDADES);
    //obtener la ciudad con la temperatura mas alta y lo sacamos del array
    const ciudadMasCaliente = clima.reduce((prev, current) => (prev.main.temp > current.main.temp) ? prev : current);
    const index = clima.indexOf(ciudadMasCaliente);
    clima.splice(index, 1);
    //MOSTRAMOS LA CIUDAD MAS CALIENTE CON UN FONDO ROJO
    presaveContainer.innerHTML += `
    <div class="card bg-danger">
        <div class="card-body">
            <h5 class="card-title">Clima ${ciudadMasCaliente.name}</h5>
            <p>Temperatura: ${ciudadMasCaliente.main.temp}</p>
            <p>Presion: ${ciudadMasCaliente.main.pressure}</p>
            <p>Humedad: ${ciudadMasCaliente.main.humidity}</p>
            <p>Temperatura Minima: ${ciudadMasCaliente.main.temp_min}</p>
            <p>Temperatura Maxima: ${ciudadMasCaliente.main.temp_max}</p>
        </div>
    </div>
    `;

    clima.forEach(ciudad => {
        presaveContainer.innerHTML += `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Clima ${ciudad.name}</h5>
                <p>Temperatura: ${ciudad.main.temp}</p>
                <p>Presion: ${ciudad.main.pressure}</p>
                <p>Humedad: ${ciudad.main.humidity}</p>
                <p>Temperatura Minima: ${ciudad.main.temp_min}</p>
                <p>Temperatura Maxima: ${ciudad.main.temp_max}</p>
            </div>
        </div>
        `;
    });
}

MostrarPresave();
MostrarClima();