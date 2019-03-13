



$(document).ready(selectApi);
var $buttons, $results, $input, $submit, $headerTitle, subjectArray, favoritesArray, apiObject,
searchTerm, selectedSearchTerm, selsctedObject, updateSelect, offset = 0, $saved, favoritesOpen = false;


function selectApi(){
    defineApiVariables();
    makeApiSelectButtons();
    clickApiSelectButton(setPage);
}

function setPage(){
    defineVariables();
    $saved.start();
    makeSearchButtons();
    addSearchButton();
    removeLastButton();
    resetDefaultSearchButtons();
    clickSearchButton();
    clickOpenFavorites();
    clickGif();
    clickDownload();
    clickFavorites();
    clickRemove();
}
function defineApiVariables(){
    apiObject = {
        giphy : {
            name: "Giphy",
            url : "https://api.giphy.com/v1/gifs/search?api_key=EgtM24e67jnWycA1Sd3ECE8PggBgwk1X&q="+searchTerm+"&limit=10&offset="+ offset,
            favorites : "giphyFavorites",
            stockButtons : [
                'Snowboarding',
                'Mountain Biking',
                'Rally Racing',
                'Surfing'
            ],
            displayKey: 'data'
        },
        nyTimes : {
            name: "NY Times Top Stories",
            url : "https://api.nytimes.com/svc/topstories/v2/"+searchTerm+".json?api-key=eFlA5zurQBNNCIs2c6urRJ5jAMGw8l8N&limit=10",
            favorites : "nytFavorites",
            stockButtons : [
                'Arts',
                'Automobiles',
                'Books',
                'Fashion'
            ],
            displayKey: 'results'
        }
    }
    $buttons = $('#buttons');
    $form = $('form')
    $headerTitle = $('#headerTitle').text('Welcome to Your News and Entertainment Collection App')
}
    

function makeApiSelectButtons(){
    for (key in apiObject){
       console.log(key)
       console.log(key.name)
        makeButton(apiObject[key].name)
    }
}

function clickApiSelectButton(callback){
    $form.on('click','#submit, #removeButton, #resetButtons', function(e){
        e.preventDefault()
    })
    $(document).one('click','.searchButton',function(){
        for(key in apiObject ){
            if ($(this).attr('data-name') == apiObject[key].name){
                updateSelect = key;
                selectedObject = apiObject[key];
                callback();  
            }    
        }
    })
}




function defineVariables(){
    $toggleFavoritesOpen = $('#savedGifs')
    $saved = {
        name: $('#saved'),
        start: function(){
                $saved.name.attr('style','height:0');
        },
        hide: function(){
                $saved.name.animate({height: 0},500);
        },
        show: function(){
                $saved.name.animate({height: 400}, 500);
        }
    }
    var favorites = localStorage.getItem(selectedObject.favorites);
    $saved.name.html(favorites);
    $results = $('#results');
    $submit = $('#sumbit');
    subjectArray = selectedObject.stockButtons;
}

function makeSearchButtons(){
    $buttons.empty();
    subjectArray.forEach(makeButton);
}

function makeButton(input){
   $('<button>').attr({'data-name' :input,'class': 'btn searchButton'}).text(input).appendTo($buttons)
}

function addSearchButton(){ 
    $form.on('click', '#submit', function(e){
        $input = $('#input');
        // subjectArray.push($input.val());
        makeButton($input.val());
        $input.val('')
    })
}

function removeLastButton(){
    $('#removeButton').on('click', function(){
        $('.searchButton').last().remove();
    })
}

function resetDefaultSearchButtons(){
    $('#resetButtons').on('click',function(){
        makeSearchButtons();
    });
}

function clickSearchButton(){
  
    $buttons.on('click','.searchButton', queryAPI);
}

function queryAPI(callback){
    
    searchTerm = $(this).attr('data-name').toLowerCase();
    if (selectedSearchTerm == searchTerm){
        offset += 10
    }
    else{
        offset = 0
        $results.empty();
    }
    defineApiVariables()
    selectedObject = apiObject[updateSelect]
    var url = selectedObject.url;
    $.ajax({url: url, method:'GET'})
    .then(displayResult);
    selectedSearchTerm = searchTerm
}

function displayResult(response){
    console.log(response);
    if (selectedObject.name == "Giphy")
        response[selectedObject.displayKey].forEach(makeAndDisplayTile)
    else if (selectedObject.name == "NY Times Top Stories"){
        response[selectedObject.displayKey].forEach(makeAndDisplayArticleTile)
    }
}

function makeAndDisplayArticleTile(article){
    // console.log(this)
    var save = $('<a>').addClass('save').append($('<button>').addClass('btn btn-plain article-btn').text('Favorites'));
    $('<div>').addClass('result').append($('<a>').attr({href: article.url, target: "_blank"}).text(article.title),save).prependTo($results);
}




function makeAndDisplayTile(gif){
    var stillUrl = gif.images.original_still.url;
    var animateUrl = gif.images.original.url;
    var image = $('<img>').addClass('gif').attr({'src' : stillUrl, 'data-still' : stillUrl, 'data-animate' : animateUrl});
    var rating = $('<p>').text("Rating: " + gif.rating);
    var title = $('<p>').text("Title: " + gif.title);
    var save = $('<a>').addClass('save').append($('<button>').text('Favorites'))
    var download = $('<a>').addClass('download').attr({'data-link': animateUrl,'download': title}).append($('<button>').text('Download'))
    $('<div>').addClass('tile col-sm-5 col-md-3').append(image, title, rating, download, save).prependTo($results);
}

function clickGif(){
    $(document).on('click','.gif', toggleGifAnimate)
}

function toggleGifAnimate(){
    var gif = $(this);
    var state = gif.attr('src');
    var still = gif.attr('data-still');
    var animated = gif.attr('data-animate');
    if (state == still)
        gif.attr('src', animated);
    else 
        gif.attr('src', still);
    
}

function clickDownload(){
    var $tile = $('.tile')
    $(document).on('click','.download', function(e){
        // e.preventDefault()
        var $this = $(this)
        
        var href = $this.attr('data-link');
        $this.attr('href', href);
        // var name = $this.attr('download')
        // download(name, href);
       
        console.log($(this).attr('value'))
    })
}
function clickFavorites(){
    $results.on('click', '.save', function(){
        $this = $(this)
        var inStorage = (localStorage.getItem(selectedObject.favorites) == null) ? "" : localStorage.getItem(selectedObject.favorites);
        $this.contents().text('Remove')
        $this.attr('class','remove')
        $this.parent().animate({top:-400},500);
        if (inStorage.indexOf($this.parent().html())>=0){
            $this.contents().text('Favorites');
            $this.attr('class','save');
            $this.parent().off().animate({top:0},200);
            return;
        }
        $saved.show();
        setTimeout(function(){
            $this.parent().remove().prependTo($saved.name)
            $this.parent().attr('style','top:0');
            updateLocalStorage();
        },600);
        setTimeout($saved.hide, 500);
    })
}

function clickOpenFavorites(){
    $toggleFavoritesOpen.on('click', function(){
        console.log('click')
        if (favoritesOpen){
            $saved.hide() 
            favoritesOpen = false;
        }
        else    
            $saved.show(), favoritesOpen = true;
    })
}

function clickRemove(){
    $saved.name.on('click','.remove', function(){
        console.log($(this).data())
        $(this).parent().remove();
        updateLocalStorage();

        
    })
}
function updateLocalStorage(){
   
    localStorage.removeItem(selectedObject.favorites)
    localStorage.setItem(selectedObject.favorites, $saved.name.html())
}


