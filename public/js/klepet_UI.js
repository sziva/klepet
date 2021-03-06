function divElementEnostavniTekst(sporocilo) {
  var jeSmesko = sporocilo.indexOf('http://sandbox.lavbic.net/teaching/OIS/gradivo/') > -1;

  var jeSlika = sporocilo.indexOf('<img')> -1; //DODANO!!
  if (jeSmesko && jeSlika) { //SPREMENJENO!!
     return $('<div style="font-weight: bold"></div>').html(sporocilo); 
  }else if (jeSmesko){
    sporocilo = sporocilo.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace('&lt;img', '<img').replace('png\' /&gt;', 'png\' />');
    return $('<div style="font-weight: bold"></div>').html(sporocilo);
  }
   
  var jeVideo = sporocilo.indexOf('<iframe') > -1;
  
 if (jeVideo){
    return $('<div style="font-weight: bold"></div>').html(sporocilo);
  }
    return $('<div style="font-weight: bold;"></div>').text(sporocilo);
  }

  function divElementHtmlTekst(sporocilo) {
    return $('<div></div>').html('<i>' + sporocilo + '</i>');
}

function procesirajVnosUporabnika(klepetApp, socket) {  
  var sporocilo = $('#poslji-sporocilo').val();
<<<<<<< HEAD
  var regExp = new RegExp(/https?:\/\/[^ ]*\.(?:jpg|png|gif)/gi); 
  slike = '';
  var povezava = sporocilo.match(regExp);
  if(povezava){
    for(var i = 0; i < povezava.length; i++){
      slike += '<br><img style="width:200px;margin-left:20px;" src="'+ povezava[i]+'"><br>';
    }
    sporocilo += slike;
  }
=======
  sporocilo = dodajVideo (sporocilo);
>>>>>>> youtube
  sporocilo = dodajSmeske(sporocilo);
  var sistemskoSporocilo;

  if (sporocilo.charAt(0) == '/') {
    sistemskoSporocilo = klepetApp.procesirajUkaz(sporocilo);
    if (sistemskoSporocilo) {
      $('#sporocila').append(divElementHtmlTekst(sistemskoSporocilo));
    }
  } else {
    sporocilo = filtirirajVulgarneBesede(sporocilo);
    klepetApp.posljiSporocilo(trenutniKanal, sporocilo);
    $('#sporocila').append(divElementEnostavniTekst(sporocilo));
    $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));
  }

  $('#poslji-sporocilo').val('');
}

var socket = io.connect();
var trenutniVzdevek = "", trenutniKanal = "";

var vulgarneBesede = [];
$.get('/swearWords.txt', function(podatki) {
  vulgarneBesede = podatki.split('\r\n');
});

function filtirirajVulgarneBesede(vhod) {
  for (var i in vulgarneBesede) {
    vhod = vhod.replace(new RegExp('\\b' + vulgarneBesede[i] + '\\b', 'gi'), function() {
      var zamenjava = "";
      for (var j=0; j < vulgarneBesede[i].length; j++)
        zamenjava = zamenjava + "*";
      return zamenjava;
    });
  }
  return vhod;
}

$(document).ready(function() {
  var klepetApp = new Klepet(socket);

  socket.on('vzdevekSpremembaOdgovor', function(rezultat) {
    var sporocilo;
    if (rezultat.uspesno) {
      trenutniVzdevek = rezultat.vzdevek;
      $('#kanal').text(trenutniVzdevek + " @ " + trenutniKanal);
      sporocilo = 'Prijavljen si kot ' + rezultat.vzdevek + '.';
    } else {
      sporocilo = rezultat.sporocilo;
    }
    $('#sporocila').append(divElementHtmlTekst(sporocilo));
  });

  socket.on('pridruzitevOdgovor', function(rezultat) {
    trenutniKanal = rezultat.kanal;
    $('#kanal').text(trenutniVzdevek + " @ " + trenutniKanal);
    $('#sporocila').append(divElementHtmlTekst('Sprememba kanala.'));
  });

  socket.on('sporocilo', function (sporocilo) {
    var novElement = divElementEnostavniTekst(sporocilo.besedilo);
    $('#sporocila').append(novElement);
  });
  
  socket.on('kanali', function(kanali) {
    $('#seznam-kanalov').empty();

    for(var kanal in kanali) {
      kanal = kanal.substring(1, kanal.length);
      if (kanal != '') {
        $('#seznam-kanalov').append(divElementEnostavniTekst(kanal));
      }
    }

    $('#seznam-kanalov div').click(function() {
      klepetApp.procesirajUkaz('/pridruzitev ' + $(this).text());
      $('#poslji-sporocilo').focus();
    });
  });

  socket.on('uporabniki', function(uporabniki) {
    $('#seznam-uporabnikov').empty();
    for (var i=0; i < uporabniki.length; i++) {
      $('#seznam-uporabnikov').append(divElementEnostavniTekst(uporabniki[i]));
    }
    
    $('seznam-uporabnikov div').click(function() {
      $('#poslji-sporocilo').val("/zasebno \"" + $(this).text() + "\"");
      $('#poslji-sporocilo').focus();
    });
  });

  setInterval(function() {
    socket.emit('kanali');
    socket.emit('uporabniki', {kanal: trenutniKanal});
  }, 1000);
  
  socket.on('dregljaj', function(dregljaj) {  
     // var aliZatresem = dregljaj.dregljaj;  
     // if (aliZatresem) {  
       $('#vsebina').jrumble();  
       $('#vsebina').trigger('startRumble');  
       setTimeout(function() {  
         $('#vsebina').trigger('stopRumble');  
       }, 1500);  
     }  
   });

  $('#poslji-sporocilo').focus();

  $('#poslji-obrazec').submit(function() {
    procesirajVnosUporabnika(klepetApp, socket);
    return false;
  });
  
  
});

function dodajSmeske(vhodnoBesedilo) {
  var preslikovalnaTabela = {
    ";)": "wink.png",
    ":)": "smiley.png",
    "(y)": "like.png",
    ":*": "kiss.png",
    ":(": "sad.png"
  }
  for (var smesko in preslikovalnaTabela) {
    vhodnoBesedilo = vhodnoBesedilo.replace(smesko,
      "<img src='http://sandbox.lavbic.net/teaching/OIS/gradivo/" +
      preslikovalnaTabela[smesko] + "' />");
  }
  return vhodnoBesedilo;
}

function dodajVideo(sporocilo){
 var regExp = new RegExp(/https?:\/\/www\.youtube\.com\/watch\?v=[^ ]*/gi);
 video = '';
  var povezavaNaVideo = sporocilo.match(regExp);
  if(povezavaNaVideo){
    for(var i = 0; i <povezavaNaVideo.length; i++){
      video += '<br><iframe src="https://www.youtube.com/embed/' + povezavaNaVideo[i].split('watch?v=')[1] + '" style="width:200px;height:150px;margin-left:20px;" allowfullscreen></iframe><br>';
    }
    var sporocilo += video;
  }
  return sporocilo;
} 
