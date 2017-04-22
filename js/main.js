var access_token = "412549179114933|EAppUimRo2Fw2vgwAfpPdkYL_p4";
if(localStorage.getItem('favourites') == undefined) { //using localStorage for keeping favourites
  localStorage.setItem('favourites','');

}
var request = function request(obj) { // request function returns a promise
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', obj.url);
        if (obj.headers) {
            Object.keys(obj.headers).forEach(function (key) {
                xhr.setRequestHeader(key, obj.headers[key]);
            });
        }
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = function () {
            return reject(xhr.statusText);
        };
        xhr.send(obj.body);
    });
};

function makeCall(key) {//makes a call to get pages and takes id for each page and makes a call again to get page details
request({url:'https://graph.facebook.com/v2.9/search?q='+key+'&type=page&access_token='+access_token}).then(function(data) {
   data.data.forEach(function(obj,key) {
     if(key < 4){
        request({url:'https://graph.facebook.com/v2.9/'+obj.id+'?fields=id%2Cabout%2Ccategory%2Cpicture%2Ccompany_overview&access_token='+access_token}).then(function(page) {
          createCards(page);

        })
      }
   });
})

}

function getData() { //when you type a word in input field and press enter
  if(event.keyCode == 13) {
     makeCall(event.target.value)
  } else {
    document.getElementById('cards-container').innerHTML = '';
  }

}


function createCards(data) {
  //  document.getElementById('cards-container').innerHTML = '';
    document.getElementById('cards-container').appendChild(createSingleCard(data));
}

function cardTopSection(data) { // create top image and details
  var wrapperDiv = document.createElement('div');
  wrapperDiv.setAttribute('class','wrapper-div');
  var div2 = document.createElement('div');
  div2.setAttribute('class','details');
  div2.innerHTML = data.company_overview != null?data.company_overview.substr(0,250)+'...':data.about;
  var p = document.createElement('p');
  p.setAttribute('class','category')
  p.innerHTML = 'Category:'+data.category;
  div2.appendChild(p);
  var img = document.createElement('img');
  img.setAttribute('src',data.picture.data.url);
  wrapperDiv.appendChild(img);
  wrapperDiv.appendChild(div2);
  return wrapperDiv;
}

function createFooter(data) {
  var div3 = document.createElement('div');
  div3.setAttribute('class','footer-div');
  var img = document.createElement('img');
  var favCheck=[];
  favCheck = checkIfFav(data);
  var src ='';
  var title='';
  if( favCheck.length > 0){ // if entry already present in localStorage
    src = 'images/favRemove.png';
    title = 'Remove from favourites';
    img.onclick = function(event) {
      event.target.setAttribute('src', 'images/fav.png');
      event.target.setAttribute('title', 'Add to favourites');
      var favourites = [];
      favourites = JSON.parse(localStorage.getItem('favourites')).filter(function(obj){
        return obj.id != data.id;
      });
      localStorage.setItem('favourites',JSON.stringify(favourites));
      getfavoritePages();

    }
  }else {
    src = 'images/fav.png';
    title = 'Add to favourites';
    img.onclick = function(event) {
      event.target.setAttribute('src', 'images/favRemove.png');
      event.target.setAttribute('title', 'Remove from favourites');
      debugger

      var favourites = [];
      favourites = localStorage.getItem('favourites') != ''?JSON.parse(localStorage.getItem('favourites')):[];
      favourites.push(data);
      localStorage.setItem('favourites',JSON.stringify(favourites));
    }
  }


  img.setAttribute('src',src);
  img.setAttribute('title',title);

  div3.appendChild(img);
  return div3;
}

function createSingleCard (data) { // creates main card
  var div = document.createElement('div');
  div.setAttribute('class','card');
  div.appendChild(cardTopSection(data));
  div.appendChild(createFooter(data));
  return div;


}


function getfavoritePages() {
  var data = localStorage.getItem('favourites') != ''?JSON.parse(localStorage.getItem('favourites')): alert('No favorites added');
  document.getElementById('cards-container').innerHTML = '';
  data.forEach(function(card) {
    createCards(card);
  })
}



function checkIfFav(currentCard)  {
  if(localStorage.getItem('favourites') !=''){
    var data = JSON.parse(localStorage.getItem('favourites'));
    var arr = data.filter(function(obj,key) {
      return obj.id == currentCard.id
    })
    return arr;
}
return [];
}
