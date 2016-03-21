// Global - number of wiki cards displayed
var numWikiCards = 9;

$(document).ready(function() {
  document.getElementsByTagName("body")[0].style.visibility = "visible";

  //initialize wiki cards to null
  var arr = [];
  for (var i = 0; i < numWikiCards; i++) {
    arr[i] = null;
  }
  setWikiCards(arr);
});

// Initialize Masonry grid
$('.grid').masonry({
  itemSelector: '.grid-item',
  fitWidth: true
});

// Initialize autocomplete
$("#searchBox").autocomplete({
  select: function(event, ui) {
    functionOnChange();
  }
});

var $grid = $('.grid').masonry({
  fitWidth: true
});

function functionOnInput() {
  getSearchSuggestions(document.getElementById("searchBox").value);
}

function functionOnChange() {
  resetWikiCards();
  getSearchResults(document.getElementById("searchBox").value);
}

$("#randomizeButton").click(function() {
  resetWikiCards();
  clearSearchBox();
  getRandomResults();
})

function resetWikiCards() {
  for (var i = 0; i < numWikiCards; i++) {
    $("#title0" + i).html("");
    $("#card0" + i).html("");
    $("#link0" + i).html("");
    document.getElementById("link0" + i).setAttribute("href", "");
    document.getElementById("img0" + i).setAttribute("src", "");
    document.getElementById("img0" + i).setAttribute("alt", "");
  }
}

function clearSearchBox() {
  $("#searchBox")[0].value = "";
}

function getSearchSuggestions(input) {
  var numSuggestions = 4;
  
  $.getJSON("https://en.wikipedia.org/w/api.php?action=opensearch&suggest=true&format=json&search=" + input + "&limit=" + numSuggestions + "&namespace=0&callback=?", function(data) {
    dropdownSuggestions(data, numSuggestions);
  });
}

function dropdownSuggestions(wikiObj, numSuggestions) {
  var suggestions = [];

  for (var i = 0; i < numSuggestions; i++) {
    suggestions[i] = wikiObj[1][i];
  }
  $("#searchBox").autocomplete({
    source: suggestions
  });
  $("#searchBox").on("select", function(event, ui) {});
}

function getSearchResults(searchStr) {
  $.getJSON("https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + searchStr + "&limit=" + numWikiCards + "&namespace=0&callback=?", function(data) {
    var myArr = [];

    for (var i = 0; i < numWikiCards; i++) {
      myArr[i] = data[1][i];
    }
    setWikiCards(myArr);
  });
}

function getRandomResults() {
  $.getJSON("https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnlimit=" + numWikiCards + "&rnnamespace=0&callback=?", function(data) {
    var myArr = [];

    for (var i = 0; i < numWikiCards; i++) {
      myArr[i] = data.query.random[i].title;
    }
    setWikiCards(myArr);
  });
}

function setWikiCards(thisArr) {
  for (var i = 0; i < thisArr.length; i++) {
    if (!thisArr[i]) {
      $("#wikiCard0" + i).hide();
    } else {
      displayWikiCards(thisArr, i);
      $("#wikiCard0" + i).show();
      document.getElementById("img0" + i).setAttribute("alt", "loading image...");
      getImages(thisArr, i);
    }
  }
}

function displayWikiCards(myArr, index) {
  $.getJSON("https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + myArr[index] + "&limit=1&namespace=0&callback=?", function(data) {
    $("#title0" + index).html(data[1]);
    $("#card0" + index).html(data[2]);
    $("#link0" + index).html(data[3]);
    document.getElementById("link0" + index).setAttribute("href", data[3]);
    $grid.masonry();
  });
}

function getImages(myArr, index) {
  $.getJSON("https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=original|thumbnail&pithumbsize=100px&pilimit=1&titles=" + myArr[index] + "&callback=?", function(data) {
    var wikiStr = JSON.stringify(data);
    var n = wikiStr.search('"original":');

    if (n === -1) {
      document.getElementById("img0" + index).setAttribute("src", "");
      $("#img0" + index).hide();
      return;
    }
    var start = wikiStr.indexOf('"http') + 1;
    var end = wikiStr.indexOf('"', start);
    var length = end - start;
    var imageURL = "";

    if (start <= 1) {
      imageURL = "";
      $("#img0" + index).hide();
    } else {
      imageURL = wikiStr.substr(start, length);
      $("#img0" + index).show();
    }
    document.getElementById("img0" + index).setAttribute("src", imageURL);
    $grid.masonry();
  });
}