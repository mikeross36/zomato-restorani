
class Zomato{
    constructor(){
        this.api = '6b266331b2242531d0fd025c43e129da';
        this.header = {
            method: 'GET',
            headers: {
                'user-key': this.api,
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        }
    }
    async searchApi(city, categoryId){
        const categoryUrl = 'https://developers.zomato.com/api/v2.1/categories';
        const categoryInfo = await fetch(categoryUrl, this.header);
        const categoryJson = await categoryInfo.json();
        const categories = await categoryJson.categories;

        const cityUrl = `https://developers.zomato.com/api/v2.1/cities?q=${city}`;
        const cityInfo = await fetch(cityUrl, this.header);
        const cityJson = await cityInfo.json();
        const cityLoacation = await cityJson.location_suggestions;

        let cityId = 0;
        if(cityLoacation.length > 0){
            cityId = cityLoacation[0].id;
        }

        const restaurantUrl = `https://developers.zomato.com/api/v2.1/search?entity_id=${cityId}&entity_type=city&category=${categoryId}&sort=rating`
        const restaurantInfo = await fetch(restaurantUrl, this.header);
        const restaurantJson = await restaurantInfo.json();
        const restaurants = await restaurantJson.restaurants;

        return {
            categories,
            cityId,
            restaurants
        }
    }
}

class UI{
    constructor(){
        //this.loader = document.querySelector('.loader');
        this.restaurantList = document.getElementById('restaurant-list');
    }

    addSelectOptions(categories){
        const select = document.getElementById('search-category');
        let option = `<option value="0" selected>search category</option>`
        categories.forEach(category => {
            option += `<option value="${category.categories.id}">${category.categories.name}</option>`;
        });
        select.innerHTML = option;
    }

    showFeedback(message){
        const feedback = document.querySelector('.feedback');
        feedback.classList.add('showItem');
        feedback.innerHTML = `<p>${message}</p>`;
        setTimeout(()=> feedback.classList.remove('showItem'), 3000);
    }
    /*showLoader(){
        this.loader.classList.add('showItem');
    }
    
    hideLoader(){
        this.loader.classList.remove('showItem');
    } */

    getRestaurants(restaurants){
        //this.hideLoader();
        if(restaurants.length === 0){
            ui.showFeedback('there is no category for this city!');
        }else{
            this.restaurantList.innerHTML = '';
            restaurants.forEach(restaurant => {
                const{
                    thumb: img,
                    name,
                    location:{address},
                    user_rating:{aggregate_rating},
                    cuisines,
                    average_cost_for_two: cost,
                    menu_url,
                    url
                } = restaurant.restaurant;
                if(img !== ''){
                    this.showRestaurant(img,name,address,aggregate_rating,cuisines,cost,menu_url,url);
                }
            });
        }
    }

    showRestaurant(img,name,address,aggregate_rating,cuisines,cost,menu_url,url){
        const div = document.createElement('div');
        div.classList.add('col-11','mx-auto','my-3','col-md-4');
        div.innerHTML = `
        <div class="card border-success mb-1">
              <div class="card border-success text-success">
                <div class="row p-3">
                  <div class="col-5">
                    <img src="${img}" class="img-fluid img-thumbnail" alt="">
                  </div>
                  <div class="col-5 text-capitalize">
                    <h6 class="text-capitalize pt-2 redText">${name}</h6>
                    <p>${address}</p>
                  </div>
                  <div class="col-1">
                    <div class="badge badge-success">${aggregate_rating}</div>
                  </div>
                </div>
                <hr>
                <div class="row p-3 ml-1">
                  <div class="col-5 text-uppercase">
                    <p>cuisines:</p>
                    <br>
                    <p>cost for two:</p>
                  </div>
                  <div class="col-5 text-uppercase">
                    <p>${cuisines}</p>
                    <br>
                    <p>${cost}</p>
                  </div>
                </div>
                <hr>
                <div class="row text-center no-gutters pb-3">
                  <div class="col-6">
                    <a href="${menu_url}" target="_blank" class="btn btn-outline-danger text-uppercase"><i class="fas fa-book"></i> menu</a>
                  </div>
                  <div class="col-6">
                    <a href="${url}" target="_blank" class="btn btn-outline-danger text-uppercase">website</a>
                  </div>
                </div>
              </div>
            </div>
        `;
        this.restaurantList.appendChild(div);
    }
}

(function(){
    const searchForm = document.getElementById('search-form');
    const searchCity = document.getElementById('search-city');
    const searchCategory = document.getElementById('search-category');

    const zomato = new Zomato();
    const ui = new UI();

    document.addEventListener('DOMContentLoaded', ()=> {
        zomato.searchApi().then(data => {
            ui.addSelectOptions(data.categories);
        });
    });
    searchForm.addEventListener('submit', e => {
        e.preventDefault();
        const city = searchCity.value.toLowerCase();
        const categoryId = parseInt(searchCategory.value);
        if(!city || categoryId === 0){
            ui.showFeedback('please fill in all the fields!');
        }else{
            zomato.searchApi(city).then(data => {
                if(data.cityId === 0){
                    ui.showFeedback('please enter proper city name!');
                }else{
                    //ui.showLoader();
                    zomato.searchApi(city, categoryId).then(data => {
                        ui.getRestaurants(data.restaurants);
                    });
                }
            });
        }
    });
})();