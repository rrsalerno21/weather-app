// jQuery to run once document is loaded and ready
$(document).ready(function(){
    // ============================================
    // VARIABLES
    // ============================================

    // localStorage object
    var JSONstorage = JSON.parse(localStorage.getItem('searchItems'));
    var storage;

    // check if localStorage is empty and respond accordingly
    if (JSONstorage !== null ) {
        storage = JSONstorage;
    } else {
        storage = {
            searchArray: []
        };
    }

    // ===========================================
    // FUNCTIONS
    // ===========================================

    // function to render previous searches
    function renderSearchHistory() {
        // empty the search list div
        $('#search-history').empty();

        // go through each element in the storage array
        storage.searchArray.forEach(function(cur) {
            // Set the search item html string with the cur element
            var searchItem = `<li class="list-group-item text-capitalize search-history-click">${cur}</li>`;

            // prepend that searchItem to the search list div
            $('#search-history').prepend(searchItem);
        });
    };

    

    // function to return a date object based on the unix time from openweather API
    function Unix_timestamp(t) {
        // make a new date based on unix time and add 12 hours to it
        var dt = new Date((t * 1000) + (12 * 3600));
        // set the month (add one since index starts at 0)
        var month = dt.getMonth() + 1;
        // set the day
        var day = dt.getDate();
        // set the full year
        var year = dt.getFullYear();

        // return the string that I want
        return (`${month}/${day}/${year}`);  
    }

    // function to record the search history
    function recordSearchHistory(value) {
        // set a variable for the HTML string that I want to prepend
        var searchItem = `<li class="list-group-item text-capitalize search-history-click">${value}</li>`;

        // if the storage does not already includes the value
        if (!(storage.searchArray.includes(value))) {
            // then prepend the html string
            $('#search-history').prepend(searchItem);

            // and add that value to storage
            storage.searchArray.push(value);
        } else {
            // if the value is in the storage array, then go through each element in the array
            storage.searchArray.forEach(function(item,i){
                // if that element is in the array
                if(item === value){
                    // then remove the element from the array
                    storage.searchArray.splice(i, 1);
                    // and push the item back in the array to bring it to the top
                    storage.searchArray.push(item);
                }
            });
        }

        localStorage.setItem('searchItems', JSON.stringify(storage));
        
        // now render the newly updated search history
        renderSearchHistory();
    }

    // create the primary function to render the UI when the search button is activated
    function renderSearch(value) {

        // setup API query variables
        var weatherQuery = 'https://api.openweathermap.org/data/2.5/weather?q=' + value + '&units=imperial&appid=f4465c08026d2de3e9ae72cb65313ea1';
        var forecastQuery = 'https://api.openweathermap.org/data/2.5/forecast?q=' + value + '&units=imperial&appid=f4465c08026d2de3e9ae72cb65313ea1';
        
        // Run a API GET call for current weather when the search button is clicked
        $.ajax({
            url: weatherQuery,
            method: 'GET'
        })
        // If the call fails
        .fail(function() {
            // alert that the search was invalid
            alert("Invalid search");
            // reset the search bar input val
            $('#search-input').val('');
            // focus on the search bar
            $('#search-input').focus();
        })
        .then(function(resp) {
            // show hidden weather divs
            $("#current-weather-div").show();
            $('#weather-forecast-div').show();

            // set a new date variable based on the current weather's unix time
            var myDate = new Date(resp.dt *1000);

            // set a variable of the source for the weather image icon
            var weatherIcon = `http://openweathermap.org/img/wn/${resp.weather[0].icon}@2x.png`

            // render the current weather section
            $('#city-header').text(`${resp.name} (${myDate.toDateString()})`);
            
            $('.weather-icon').html(`<img src=${weatherIcon} alt="${resp.weather[0].main} weather icon"/>`);

            $('#city-temp').text(`${resp.main.temp}\xB0 F`);

            $('#city-humidity').text(resp.main.humidity);

            $('#city-wind-speed').text(resp.wind.speed);


            // UV Index AJAX call per openweather's API
            $.ajax({
                url: `http://api.openweathermap.org/data/2.5/uvi?appid=f4465c08026d2de3e9ae72cb65313ea1&lat=${resp.coord.lat}&lon=${resp.coord.lon}`,
                method: 'GET'
            }).then(function(innerResp){
                // render the value of the city UV
                $('#city-UV').text(innerResp.value);
                // set the default font color of the city UV value
                $('#city-UV').css('color', '#ffffff');

                // Change the background color and font-color based on what UV value is returned
                if (innerResp.value < 3) {
                    $('#city-UV').css('background-color', 'green');
                } else if ((innerResp.value >= 2) && (innerResp.value < 6)) {
                    $('#city-UV').css('background-color', 'yellow');
                    $('#city-UV').css('color', 'inherit');
                } else if ((innerResp.value >= 6) && (innerResp.value < 8)) {
                    $('#city-UV').css('background-color', 'orange');
                    $('#city-UV').css('color', 'inherit');
                } else if ((innerResp.value >= 8) && (innerResp.value < 11)) {
                    $('#city-UV').css('background-color', 'red');
                } else if (innerResp.value >= 11) {
                    $('#city-UV').css('background-color', 'violet');
                }
            });  

            // Run a API GET call for forecast weather when the search button is clicked
            $.ajax({
                url: forecastQuery,
                method: 'GET'
            }).then(function(resp) {
                // empty the forecast div
                $('#forecast').empty();
                
                // set the starting index based on the openweather API list of 3 hour incremented times
                var dayIndex = 6;
                
                // set a for loop to iterate 5 times for 5 days
                for (var i = 0; i < 5; i++) {
                    // set a current day variable
                    var curDay;

                    // if the dayIndex gets higher than 38
                    if (dayIndex >= 39) {
                        // then set curDay to the list's 39 index value
                        curDay = resp.list[39]
                    } else {
                        // if not, then set the index to what dayIndex is at this iteration
                        curDay = resp.list[dayIndex];
                    };

                    // set the date variable using the selected day's unix time via my Unix_timestamp function
                    var date = Unix_timestamp(curDay.dt);
                    
                    // set the weatherIcon src url
                    var weatherIcon = `http://openweathermap.org/img/wn/${curDay.weather[0].icon}@2x.png`;
    
                    // set the HTML to append
                    var dateHTML = `
                    <div class="col-sm card bg-primary text-white m-2">
                    <strong>${date}</strong>
                    <img src="${weatherIcon}" alt="${curDay.weather[0].main}" width="50px" />
                    <p>Temp: ${curDay.main.temp}\xB0 F</p>
                    <p>Humidity: ${curDay.main.humidity}%</p>
                    </div>
                    `;
                    
                    // append the HTML to the forecast div
                    $('#forecast').append(dateHTML);
    
                    // increment the dayIndex
                    dayIndex += 8;
                }
            });
            
            // check the value before log correct input value
            var correctDisplay;
            // if the value includes a comma
            if (value.includes(',')) {
                // make sure to add the space back in if need be
                correctDisplay = value.replace(',', ', ');
            } else {
                // else just take the value as is
                correctDisplay = value;
            }

            // record the value to the search history
            recordSearchHistory(correctDisplay);
        });

        // focus back on element
        $('#search-input').focus(function() {
            $(this).select();
        });   
    };



    // ============================================
    // CLICK EVENTS
    // =============================================

    // Click event on a previous search list item
    $(document).on('click', '.search-history-click', function() {
        //  render the search based on the list value that was clicked
        renderSearch(this.innerHTML);
    });

    // Even listener for the search button on click
    $('#search-btn').on('click', function() {
        // set variables for the search input value
        var input = $('#search-input').val();
        var searchInput;

        // Check to see if the input includes a comma
        if (input.includes(',')) {
            // if so, remove the space after the comma
            searchInput = input.replace(', ', ',');
        } else {
            // else, set the searchInput var as the actual input
            searchInput = input;
        }

        // render UI based on search input
        renderSearch(searchInput);
        
        // Set the storage object in localStorage after every click
        localStorage.setItem('searchItems', JSON.stringify(storage));
    });

    // Enter keypress event for search bar
    $('#search-input').keypress(function(e) {
        var key = e.which;

        if (key == 13) {
            $('#search-btn').click();
            return false;
        }
    })

    // ===================
    // LOADING EVENTS
    // ====================

    // show loading screen
    $( document ).ajaxStart(function() {
        $( "#loading" ).show();
    });

    // hide loading screen
    $( document ).ajaxStop(function() {
        $( "#loading" ).hide();       
    });

    // ===================================
    // INVOKE ON LOAD
    // ===================================

    // call a search on the last searched item
    if (storage.searchArray.length > 0) {
        renderSearch(storage.searchArray[storage.searchArray.length - 1]);
    } 
    // call renderSearchHistory
    renderSearchHistory();
});