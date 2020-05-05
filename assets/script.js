$(document).ready(function(){

    // Get the user input on click of search button
    $('#search-btn').on('click', function() {
        var searchInput = $('#search-input').val();
        //var changedText = searchInput.replace(/ /g, '');
        
        // setup API query variables
        var weatherQuery = 'https://api.openweathermap.org/data/2.5/weather?q=' + searchInput + '&units=imperial&appid=f4465c08026d2de3e9ae72cb65313ea1';
        var forecastQuery = 'https://api.openweathermap.org/data/2.5/forecast?q=' + searchInput + '&units=imperial&appid=f4465c08026d2de3e9ae72cb65313ea1';
        
        // Run a API GET call for current weather when the search button is clicked
        $.ajax({
            url: weatherQuery,
            method: 'GET'
        }).then(function(resp) {
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

            $.ajax({
                url: `http://api.openweathermap.org/data/2.5/uvi?appid=f4465c08026d2de3e9ae72cb65313ea1&lat=${resp.coord.lat}&lon=${resp.coord.lon}`,
                method: 'GET'
            }).then(function(innerResp){
                console.log(innerResp);
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


        });
        
        // Run a API GET call for forecast weather when the search button is clicked
        $.ajax({
            url: forecastQuery,
            method: 'GET'
        }).then(function(resp) {
            console.log('Weather Forecast:')
            console.log(resp);
        });
        
        // Then update the search history (prepend)

    })
    
    

    // Then update today's detail

    // Then update 5 Day forecase
});