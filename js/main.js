let rowData = document.getElementById('rowData');
let searchContainer = document.getElementById('searchContainer');

function openSideNav() {
  $('.side-nav-menu').animate(
    {
      left: 0,
    },
    500
  );

  $('.open-close-icon').removeClass('fa-align-justify');
  $('.open-close-icon').addClass('fa-x');

  for (let i = 0; i < 5; i++) {
    $('.links li')
      .eq(i)
      .animate(
        {
          top: 0,
        },
        (i + 5) * 100
      );
  }
}

function closeSideNav() {
  let boxWidth = $('.side-nav-menu .nav-tab').outerWidth();
  $('.side-nav-menu').animate(
    {
      left: -boxWidth,
    },
    500
  );

  $('.open-close-icon').addClass('fa-align-justify');
  $('.open-close-icon').removeClass('fa-x');

  $('.links li').animate(
    {
      top: 300,
    },
    500
  );
}

closeSideNav();
$('.side-nav-menu i.open-close-icon').click(() => {
  if ($('.side-nav-menu').css('left') == '0px') {
    closeSideNav();
  } else {
    openSideNav();
  }
});

function displayMealDetails(meal) {
  let ingredients = '';
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients += `<li class="alert alert-info m-2 p-1">${
        meal[`strMeasure${i}`]
      } ${meal[`strIngredient${i}`]}</li>`;
    }
  }

  let tags = meal.strTags?.split(',') || [];
  let tagsStr = tags
    .map((tag) => `<li class="alert alert-danger m-2 p-1">${tag}</li>`)
    .join('');

  let mealDetails = `
    <div class="col-md-4">
      <img class="w-100 rounded-3" src="${meal.strMealThumb}" alt="">
      <h2>${meal.strMeal}</h2>
    </div>
    <div class="col-md-8">
      <h2>Instructions</h2>
      <p>${meal.strInstructions}</p>
      <h3><span class="fw-bolder">Area : </span>${meal.strArea}</h3>
      <h3><span class="fw-bolder">Category : </span>${meal.strCategory}</h3>
      <h3>Recipes :</h3>
      <ul class="list-unstyled d-flex g-3 flex-wrap">
        ${ingredients}
      </ul>
      <h3>Tags :</h3>
      <ul class="list-unstyled d-flex g-3 flex-wrap">
        ${tagsStr}
      </ul>
      <a target="_blank" href="${meal.strSource}" class="btn btn-success">Source</a>
      <a target="_blank" href="${meal.strYoutube}" class="btn btn-danger">Youtube</a>
    </div>
  `;

  $('#food-container').html(mealDetails);
}

async function fetchMealDetails(mealId) {
  $('#food-container').html('<p>Loading...</p>');

  try {
    let response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
    );
    let data = await response.json();
    console.log(data); // Log the fetched data

    if (data.meals && data.meals.length > 0) {
      displayMealDetails(data.meals[0]);
    } else {
      $('#food-container').html('<p>No meal details found.</p>');
    }
  } catch (error) {
    console.error('Error fetching meal details:', error);
    $('#food-container').html(
      '<p>Error fetching meal details. Please try again later.</p>'
    );
  }
}

$(document).ready(function () {
  fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=')
    .then((response) => response.json())
    .then((data) => {
      const meals = data.meals;
      console.log(meals); // Log the fetched meals data
      let foodContainer = $('#food-container');
      meals.forEach((meal) => {
        let mealDiv = `
          <div class="col-md-3 mb-4">
            <div class="meal position-relative rounded-3" onclick="fetchMealDetails(${meal.idMeal})">
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="img-fluid">
              <div class="meal-layer position-absolute d-flex flex-column justify-content-center align-items-center">
                <h5 class="title text-start">${meal.strMeal}</h5>
              </div>
            </div>
          </div>
        `;
        foodContainer.append(mealDiv);
      });
    })
    .catch((error) => console.error('Error fetching the meals:', error));
});

function fetchMealsByCategory(categoryName) {
  fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryName}`)
    .then((response) => response.json())
    .then((data) => {
      const meals = data.meals;

      if (!meals) {
        $('#food-container').html('<p>No meals found for this category.</p>');
        return;
      }

      let mealHtml = '';

      meals.forEach((meal) => {
        mealHtml += `
          <div class="col-md-3 mb-4">
            <div class="meal position-relative rounded-3">
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="img-fluid">
              <div class="meal-layer position-absolute d-flex flex-column ">
                <h5 class="title text-start">${meal.strMeal}</h5>
              </div>
            </div>
          </div>
        `;
      });

      $('#food-container').html(mealHtml);
    })
    .catch((error) => {
      console.error('Error fetching meals by category:', error);
      $('#food-container').html(
        '<p>Error fetching meals. Please try again later.</p>'
      );
    });
}

// categories
function getCategories() {
  fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
    .then((response) => response.json())
    .then((data) => {
      const categories = data.categories;
      let foodContainer = $('#food-container');
      foodContainer.empty();

      // Render category items
      categories.forEach((category) => {
        let categoryDiv = `
          <div class="col-md-3 mb-4">
            <div class="meal position-relative" onclick="fetchMealsByCategory('${
              category.strCategory
            }')">
              <img src="${category.strCategoryThumb}" class="img-fluid" alt="${
          category.strCategory
        }">
              <div class="meal-layer position-absolute d-flex flex-column justify-content-center align-items-center rounded-3">
                <h5 class="title">${category.strCategory}</h5>
                <p class="description text-center">${category.strCategoryDescription.substring(
                  0,
                  100
                )}...</p>
              </div>
            </div>
          </div>
        `;
        foodContainer.append(categoryDiv);
      });
    })
    .catch((error) => {
      console.error('Error fetching categories:', error);
      $('#food-container').html(
        '<p>Error fetching categories. Please try again later.</p>'
      );
    });
}
// display area
function fetchMealsByArea(areaName) {
  fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${areaName}`)
    .then((response) => response.json())
    .then((data) => {
      const meals = data.meals;

      if (!meals) {
        $('#food-container').html('<p>No meals found for this area.</p>');
        return;
      }

      let mealHtml = '';

      meals.forEach((meal) => {
        mealHtml += `
          <div class="col-md-3 mb-4">
            <div class="meal position-relative rounded-3">
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="img-fluid">
              <div class="meal-layer position-absolute d-flex flex-column ">
                <h5 class="title text-start">${meal.strMeal}</h5>
              </div>
            </div>
          </div>
        `;
      });

      $('#food-container').html(mealHtml);
    })
    .catch((error) => {
      console.error('Error fetching meals by area:', error);
      $('#food-container').html(
        '<p>Error fetching meals. Please try again later.</p>'
      );
    });
}

// Function to handle click event for "Area" menu item
function getArea() {
  fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list')
    .then((response) => response.json())
    .then((data) => {
      const areas = data.meals;
      console.log(areas);
      let foodContainer = $('#food-container');
      foodContainer.empty();

      // Render area items
      areas.forEach((area) => {
        let areaDiv = `
          <div class="col-md-3">
            <div class="area-item text-center" onclick="fetchMealsByArea('${area.strArea}')">
              <i class="fa-solid fa-house-laptop fa-4x"></i>
              <h4 class="mt-2">${area.strArea}</h4>
            </div>
          </div>
        `;
        foodContainer.append(areaDiv);
      });
    })
    .catch((error) => console.error('Error fetching the areas:', error));
}

// display ingredients
function fetchMealsByIngredient(ingredientName) {
  fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredientName}`
  )
    .then((response) => response.json())
    .then((data) => {
      const meals = data.meals;

      if (!meals) {
        $('#food-container').html('<p>No meals found for this ingredient.</p>');
        return;
      }

      let mealHtml = '';

      meals.forEach((meal) => {
        mealHtml += `
          <div class="col-md-3 mb-4">
            <div class="meal position-relative justify-content-center align-items-center rounded-3">
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="img-fluid">
              <div class="meal-layer position-absolute d-flex flex-column ">
                <h5 class="title text-start">${meal.strMeal}</h5>
              </div>
            </div>
          </div>
        `;
      });

      $('#food-container').html(mealHtml);
    })
    .catch((error) => {
      console.error('Error fetching meals by ingredient:', error);
      $('#food-container').html(
        '<p>Error fetching meals. Please try again later.</p>'
      );
    });
}

// Function to handle click event for "Ingredients" menu item
function getIngredients() {
  fetch('https://www.themealdb.com/api/json/v1/1/list.php?i=list')
    .then((response) => response.json())
    .then((data) => {
      const ingredients = data.meals;
      let foodContainer = $('#food-container');
      foodContainer.empty();

      // Render ingredient items
      ingredients.forEach((ingredient) => {
        let ingredientDiv = `
          <div class="col-md-3 mb-4">
            <div class="meal position-relative justify-content-center align-items-center " onclick="fetchMealsByIngredient('${
              ingredient.strIngredient
            }')">
              <i class="fa-solid fa-drumstick-bite fa-4x"></i>
              <h4 class="mt-2">${ingredient.strIngredient}</h4>
              <p class="description text-center">${
                ingredient.strDescription
                  ? ingredient.strDescription.substring(0, 100)
                  : ''
              }...</p>
            </div>
          </div>
        `;
        foodContainer.append(ingredientDiv);
      });
    })
    .catch((error) => {
      console.error('Error fetching ingredients:', error);
      $('#food-container').html(
        '<p>Error fetching ingredients. Please try again later.</p>'
      );
    });
}

function showContacts() {
  $('#food-container').hide();
  $('#contact-container').removeClass('d-none').show();
}

function inputsValidation() {
  let nameInput = $('#nameInput').val();
  let emailInput = $('#emailInput').val();
  let phoneInput = $('#phoneInput').val();
  let ageInput = $('#ageInput').val();
  let passwordInput = $('#passwordInput').val();
  let repasswordInput = $('#repasswordInput').val();

  let nameValid = /^[A-Za-z\s]+$/.test(nameInput);
  let emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);
  let phoneValid = /^\d+$/.test(phoneInput);
  let ageValid = /^\d+$/.test(ageInput) && ageInput > 0;
  let passwordValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(
    passwordInput
  );
  let repasswordValid = passwordInput === repasswordInput;

  $('#nameAlert').toggleClass('d-none', nameValid);
  $('#emailAlert').toggleClass('d-none', emailValid);
  $('#phoneAlert').toggleClass('d-none', phoneValid);
  $('#ageAlert').toggleClass('d-none', ageValid);
  $('#passwordAlert').toggleClass('d-none', passwordValid);
  $('#repasswordAlert').toggleClass('d-none', repasswordValid);

  let formValid =
    nameValid &&
    emailValid &&
    phoneValid &&
    ageValid &&
    passwordValid &&
    repasswordValid;
  $('#submitBtn').prop('disabled', !formValid);
}

$(document).ready(function () {
  // Event listener for Contact Us menu item
  $('li:contains("Contact Us")').on('click', function () {
    showContacts();
    closeSideNav();
  });
});

function showSearchInputs() {
  // Hide contact form if visible
  $('#contact-container').hide();

  // Clear previous content in food container
  $('#food-container').empty();

  // Display search input fields
  let searchInputHtml = `
  <div class="row py-4 ">
        <div class="col-md-6 ">
            <input onkeyup="searchMealByName(this.value)" class="form-control bg-transparent text-white" type="text" placeholder="Search By Name">
        </div>
        <div class="col-md-6">
            <input onkeyup="listMealsByFirstLetter(this.value)" maxlength="1" class="form-control bg-transparent text-white" type="text" placeholder="Search By First Letter">
        </div>
    </div>
  `;
  $('#food-container').append(searchInputHtml);

  // Close the side navigation after showing search inputs
  closeSideNav();

  // Add event listeners for dynamic search
  $('#searchInput').on('input', function () {
    let searchTerm = $(this).val().trim();
    if (searchTerm.length > 0) {
      searchMealByName(searchTerm);
    } else {
      $('#food-container').empty(); // Clear container if search term is empty
    }
  });

  $('#firstLetterInput').on('input', function () {
    let firstLetter = $(this).val().trim().toLowerCase();
    if (firstLetter.length === 1) {
      listMealsByFirstLetter(firstLetter);
    } else {
      $('#food-container').empty(); // Clear container if first letter input is invalid
    }
  });
}

function searchMealByName(mealName) {
  let apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const meals = data.meals;

      if (!meals) {
        $('#food-container').html('<p>No meals found.</p>');
        return;
      }

      let mealHtml = '';

      meals.forEach((meal) => {
        mealHtml += `
          <div class="col-md-3 mb-4">
            <div class="meal position-relative rounded-3">
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="img-fluid">
              <div class="meal-layer position-absolute d-flex flex-column ">
                <h5 class="title text-start">${meal.strMeal}</h5>
              </div>
            </div>
          </div>
        `;
      });

      $('#food-container').html(mealHtml);
    })
    .catch((error) => {
      console.error('Error fetching meals:', error);
      $('#food-container').html(
        '<p>Error fetching meals. Please try again later.</p>'
      );
    });
}

// Example usage:
// searchMealByName('Arrabiata');

function listMealsByFirstLetter(firstLetter) {
  let apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?f=${firstLetter}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const meals = data.meals;

      if (!meals) {
        $('#food-container').html('<p>No meals found.</p>');
        return;
      }

      let mealHtml = '';

      meals.forEach((meal) => {
        mealHtml += `
          <div class="col-md-3 mb-4">
            <div class="meal position-relative rounded-3">
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="img-fluid">
              <div class="meal-layer position-absolute d-flex flex-column ">
                <h5 class="title text-start">${meal.strMeal}</h5>
              </div>
            </div>
          </div>
        `;
      });

      $('#food-container').html(mealHtml);
    })
    .catch((error) => {
      console.error('Error fetching meals:', error);
      $('#food-container').html(
        '<p>Error fetching meals. Please try again later.</p>'
      );
    });
}

// Example usage:
// listMealsByFirstLetter('a');
