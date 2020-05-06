$(document).ready(function(){
    // localStorage object
    var JSONstorage = JSON.parse(localStorage.getItem('searchItems'));
    var storage;

    if (JSONstorage !== null ) {
        storage = JSONstorage;
    } else {
        storage = {
            searchArray: []
        };
    }

    // render previous searches
    function renderSearchHistory() {
        $('#search-history').empty();

        storage.searchArray.forEach(function(cur, i) {
            var searchItem = `<li class="list-group-item text-capitalize search-history-click">${cur}</li>`;
            $('#search-history').prepend(searchItem);
        });
    };

    renderSearchHistory();

    // Click event on a previous search
    $(document).on('click', '.search-history-click', function() {
        var historyValue = this.innerHTML;
        renderSearch(historyValue)

        // recordSearchHistory(historyValue);
    });

    // Get the user input on click of search button
    $('#search-btn').on('click', function() {
        var input = $('#search-input').val();
        var searchInput;

        if (input.includes(',')) {
            searchInput = input.replace(', ', ',');
            console.log(searchInput);
        } else {
            searchInput = input;
        }



        // render UI based on search input
        renderSearch(searchInput);
        
        localStorage.setItem('searchItems', JSON.stringify(storage));
    });

    function Unix_timestamp(t) {
        var dt = new Date((t * 1000) + (12 * 3600));
        var month = dt.getMonth() + 1;
        var day = dt.getDate();
        var year = dt.getFullYear();
        return (`${month}/${day}/${year}`);  
    }

    function recordSearchHistory(value) {
        var searchItem = `<li class="list-group-item text-capitalize search-history-click">${value}</li>`;

        if (!(storage.searchArray.includes(value))) {
            $('#search-history').prepend(searchItem);
            storage.searchArray.push(value);
        } else {
            storage.searchArray.forEach(function(item,i){
                if(item === value){
                  storage.searchArray.splice(i, 1);
                  storage.searchArray.push(item);
                }
            });
        }
        
        renderSearchHistory();

    }

    function renderSearch(value) {
        
        // setup API query variables
        var weatherQuery = 'https://api.openweathermap.org/data/2.5/weather?q=' + value + '&units=imperial&appid=f4465c08026d2de3e9ae72cb65313ea1';
        var forecastQuery = 'https://api.openweathermap.org/data/2.5/forecast?q=' + value + '&units=imperial&appid=f4465c08026d2de3e9ae72cb65313ea1';
        
        // Run a API GET call for current weather when the search button is clicked
        $.ajax({
            url: weatherQuery,
            method: 'GET'
        })
        .fail(function() {
            alert("Invalid search");
            $('#search-input').val('');
            $('#search-input').focus();
        })
        .then(function(resp) {
            console.log('Current Weather:')
            console.log(resp);

            var myDate = new Date(resp.dt *1000);
            var weatherIcon = `http://openweathermap.org/img/wn/${resp.weather[0].icon}@2x.png`

            // render the current weather section
            $('#city-header').text(`${resp.name} (${myDate.toDateString()})`);
            
            $('.weather-icon').html(`<img src=${weatherIcon} alt="${resp.weather[0].main} weather icon"/>`);

            $('#city-temp').text(`${resp.main.temp}\xB0 F`);

            $('#city-humidity').text(resp.main.humidity);

            $('#city-wind-speed').text(resp.wind.speed);

            // UV Index AJAX call
            $.ajax({
                url: `http://api.openweathermap.org/data/2.5/uvi?appid=f4465c08026d2de3e9ae72cb65313ea1&lat=${resp.coord.lat}&lon=${resp.coord.lon}`,
                method: 'GET'
            }).then(function(innerResp){
                $('#city-UV').text(innerResp.value);
                $('#city-UV').css('color', '#ffffff');

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
                console.log('Weather Forecast:')
                console.log(resp);
                
                $('#forecast').empty();
    
                var dayIndex = 6;
    
                for (var i = 0; i < 5; i++) {
                    var curDay;
                    if (dayIndex >= 39) {
                        curDay = resp.list[39]
                    } else {
                        curDay = resp.list[dayIndex];
                    };
                    var date = Unix_timestamp(curDay.dt);
                    
                    var weatherIcon = `http://openweathermap.org/img/wn/${curDay.weather[0].icon}@2x.png`;
    
                    var dateHTML = `
                    <div class="col card bg-primary text-white mx-2">
                    <strong>${date}</strong>
                    <img src="${weatherIcon}" alt="${curDay.weather[0].main}" width="50px" />
                    <p>Temp: ${curDay.main.temp}\xB0 F</p>
                    <p>Humidity: ${curDay.main.humidity}%</p>
                    </div>
                    `;
    
                    $('#forecast').append(dateHTML);
    
    
                    dayIndex += 8;
                }
            });           
        });

        // focus back on element
        $('#search-input').focus(function() {
            $(this).select();
        });

        // log correct input value
        var correctDisplay;
        if (value.includes(',')) {
            correctDisplay = value.replace(',', ', ');
        } else {
            correctDisplay = value;
        }

        recordSearchHistory(correctDisplay);
        
    };

    // have loading screen
    $( document ).ajaxStart(function() {
        $( "#loading" ).show();
    });

    // hide loading screen
    $( document ).ajaxStop(function() {
        $( "#loading" ).hide();
    });
});