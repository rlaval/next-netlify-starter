<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carte des prévisions météo - Aveyron</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <style>
        #map { height: 600px; }
        
        /* Style pour le popup de prévisions */
        .weather-popup {
            background-color: white;
            color: black;
            padding: 10px;
            border-radius: 8px;
            font-size: 14px;
            width: 300px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        /* Tableau des prévisions horizontal */
        .weather-table {
            display: flex;
            overflow-x: auto;
            padding: 10px 0;
            justify-content: space-around;
            gap: 10px;
        }
        
        .weather-table .weather-item {
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
            min-width: 80px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .weather-item img {
            width: 40px;
            height: 40px;
            margin-bottom: 5px;
        }
        
        .weather-item h3 {
            font-size: 16px;
            margin: 5px 0;
        }
        
        .weather-item p {
            font-size: 12px;
            margin: 0;
        }

        /* Ajouter des styles pour améliorer la lisibilité */
        .weather-item h3, .weather-item p {
            margin: 5px 0;
            font-family: Arial, sans-serif;
        }

    </style>
</head>
<body>
    <h1>Carte des prévisions météorologiques sur 5 jours (3 heures)</h1>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script>
        // Initialisation de la carte centrée sur l'Aveyron
        var map = L.map('map').setView([44.6, 2.55], 10); // Coordonnées pour l'Aveyron

        // Ajout du fond de carte OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        // Clé API OpenWeatherMap
        const apiKey = '51f8e43995c70088efd5c2d49bb505a5'; // Votre clé API OpenWeatherMap

        // Liste des villes avec leurs coordonnées (latitude, longitude)
        const cities = [
            { name: "Decazeville", lat: 44.559, lon: 2.253 },
            { name: "Rodez", lat: 44.3500, lon: 2.5833 },
            { name: "Marcillac-Vallon", lat: 44.475, lon: 2.466 },
            { name: "Laguiole", lat: 44.684, lon: 2.848 },
            { name: "Mur-de-Barrez", lat: 44.845, lon: 2.662 },
            { name: "Millau", lat: 44.1000, lon: 3.0833 },
            { name: "Espalion", lat: 44.5100, lon: 2.8150 },
            { name: "Saint-Afrique", lat: 43.9558, lon: 2.8891 },
            { name: "Villefranche-de-Rouergue", lat: 44.3508, lon: 2.0390 },
            { name: "Naucelle", lat: 44.2022, lon: 2.3433 },
            { name: "Réquista", lat: 44.0667, lon: 2.5333 }
        ];

        // Fonction pour obtenir l'icône météo en fonction de la description
        function getWeatherIcon(description) {
            const weatherIcons = {
                "couvert": "https://cdn-icons-png.flaticon.com/512/414/414825.png",
                "ciel dégagé": "https://cdn-icons-png.flaticon.com/512/869/869869.png",
                "partiellement nuageux": "https://cdn-icons-png.flaticon.com/512/1163/1163624.png",
                "pluie": "https://cdn-icons-png.freepik.com/512/2937/2937986.png",
                "orage": "https://cdn-icons-png.flaticon.com/512/5483/5483794.png",
                "neige": "https://cdn-icons-png.flaticon.com/512/642/642102.png",
                "brume": "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
                "bruine légère": "https://cdn-icons-png.flaticon.com/512/652/652531.png"
            };

            // Normaliser la description
            description = description.toLowerCase();

            // Retourner l'icône appropriée ou une icône par défaut
            return weatherIcons[description] || "https://cdn-icons-png.flaticon.com/512/652/652531.png";
        }

        // Fonction pour obtenir le jour de la semaine en français
        function getDayOfWeek(date) {
            const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
            return days[date.getDay()];
        }

        // Fonction pour formater l'heure en format 24h
        function formatTime(date) {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }

        // Fonction pour récupérer les prévisions météorologiques sur 5 jours et afficher dans un tableau
        async function addWeatherForecast(city, lat, lon) {
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`;

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
                
                const data = await response.json();
                const forecastData = data.list; // Tableau de prévisions horaires

                // Créer le tableau HTML pour les prévisions (affichage horizontal)
                let tableContent = `<div class="weather-table">`;

                forecastData.forEach(forecast => {
                    const time = new Date(forecast.dt * 1000); // Convertir le timestamp UNIX en Date
                    const day = getDayOfWeek(time); // Récupérer le jour de la semaine
                    const formattedTime = formatTime(time); // Obtenir l'heure formatée
                    const description = forecast.weather[0].description;
                    const temp = forecast.main.temp.toFixed(1); // Température en °C
                    const iconUrl = getWeatherIcon(description); // Récupérer l'icône météo

                    // Ajouter une ligne dans le tableau pour chaque prévision
                    tableContent += `
                        <div class="weather-item">
                            <img src="${iconUrl}" alt="${description}">
                            <h3>${day} ${formattedTime}</h3>
                            <p>${temp}°C</p>
                            <p>${description}</p>
                        </div>`;
                });

                tableContent += "</div>";

                // Créer l'icône Leaflet pour la ville
                const weatherIcon = L.icon({
                    iconUrl: getWeatherIcon(forecastData[0].weather[0].description),
                    iconSize: [40, 40], // Taille de l'icône
                    iconAnchor: [20, 20], // Centrer l'icône
                    popupAnchor: [0, -20] // Position du popup
                });

                // Ajouter un marqueur sur la carte
                var marker = L.marker([lat, lon], { icon: weatherIcon }).addTo(map);

                // Ajouter un popup avec le tableau des prévisions
                marker.bindPopup(`
                    <div class="weather-popup">
                        <b>${city}</b>
                        <div>${tableContent}</div>
                    </div>
                `);

            } catch (error) {
                console.error(`Erreur lors du chargement des prévisions pour ${city}:`, error);
            }
        }

        // Ajouter les prévisions pour toutes les villes
        cities.forEach(city => {
            addWeatherForecast(city.name, city.lat, city.lon);
        });
    </script>
</body>
</html>

