document.getElementById('cocktailForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const cocktailName = document.getElementById('cocktailName').value;
  getRecipe(cocktailName);
});

async function getRecipe(cocktailName) {
  try {
    const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${cocktailName}`);
    const data = await response.json();

    if (data.drinks) {
      const cocktail = data.drinks[0];
      displayRecipe(cocktail);
      findBars(cocktail.strDrink);
    } else {
      displayError('Cocktail not found.');
    }
  } catch (error) {
    displayError('Error fetching cocktail data.');
  }
}

function displayRecipe(cocktail) {
  const recipeContainer = document.getElementById('recipeContainer');
  recipeContainer.style.display = 'block';
  recipeContainer.innerHTML = `
    <h2>${cocktail.strDrink}</h2>
    <p><strong>The Barista's Toolbox:</strong></p>
    <ul>
      <li>${cocktail.strIngredient1} - ${cocktail.strMeasure1}</li>
    </ul>
    <p><strong>Concoct Like a Pro:</strong> ${cocktail.strInstructions}</p>
    <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}">
  `;
}

function displayError(message) {
  const recipeContainer = document.getElementById('recipeContainer');
  recipeContainer.style.display = 'block';
  recipeContainer.innerHTML = `<p>${message}</p>`;
}

function findBars(cocktailName) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async function(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const barsContainer = document.getElementById('barsContainer');
      barsContainer.style.display = 'block';

      // Google Places API
      const placesService = new google.maps.places.PlacesService(document.createElement('div'));
      const request = {
        location: new google.maps.LatLng(latitude, longitude),
        radius: 5000,
        keyword: cocktailName + ' bar',
        type: 'bar'
      };

      placesService.nearbySearch(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
          barsContainer.innerHTML = '<h2>Want it professionally made? Checkout some nearby bars that sell this drink! </h2>';
          const list = document.createElement('ul');
          results.forEach((place) => {
            const listItem = document.createElement('li');
            listItem.textContent = place.name + ' - ' + place.vicinity;
            list.appendChild(listItem);
          });
          barsContainer.appendChild(list);
        } else {
          barsContainer.innerHTML = '<p>Bad Luck! No bars found nearby</p>';
        }
      });
    }, function() {
      displayError('Geolocation is not supported by this browser.');
    });
  } else {
    displayError('Geolocation is not supported by this browser.');
  }
}
