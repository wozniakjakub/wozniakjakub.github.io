$(document).ready(function () {
  let mymap = L.map("mymap", { center: [48.48, 31.88], zoom: 6 });

  let adresOSM = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  );
  // dodanie własnych danych
  let mojeDane = L.tileLayer.wms("http://127.0.0.1:8080/geoserver/prge/wms", {
    layers: "prge:województwa",
    format: "image/png",
    transparent: "true",
    version: "1.1.1",
  });

  // obsługa warstw
  let baseMaps = {
    "dane z OSM": adresOSM,
    "moje dane": mojeDane,
  };
  L.control.layers(baseMaps).addTo(mymap);
  mymap.addLayer(adresOSM);

    // okodowanie guzika który ma zamykać modal
  $(".button_close_modal").click(() => {
    $(".modalBox_edit").hide();
  });

  // obsługa modala do dodawania
  //okodowanie onclicka na mapie
  let lat;
  let lng;
  mymap.on('click',(event)=>{
    console.log(event.latlng);
    lat = event.latlng.lat;
    lng = event.latlng.lng;
    $("#object_lat").val(lat);
    $("#object_lng").val(lng);
  });

  // okodowanie guzika który ma otwierać modala
  $("#button_open_modal").click(() => {
    console.log("klikniete");
    $(".modalBox").show();
  });
  // okodowanie guzika który ma zamykać modal
  $(".button_close_modal").click(() => {
    $(".modalBox").hide();
  });
// okodowanie dodania do listy w pamięci
  $("#data_save").click((event) => {
    event.preventDefault();
    console.log($("#object_id").val()); // przechwycić zawartość jakiegoś input w js w jquery
    dane.push({
      id: $("#object_id").val(),
      date: $("#object_date").val(),
      latitude: $("#object_lat").val(),
      longitude: $("#object_lng").val(),
      location: $("#object_location").val(),
      description: $("#object_description").val(),
      sources: [
        {
          id: $("#object_sources_id").val(),
          path: $("#object_sources_path").val(),
          description: $("#object_sources_description").val(),
        },
      ],
    });
    console.log(dane);
    //$(".modalBox").hide();
    $("#modal_do_wprowadzania_danych").empty();
    $("#modal_do_wprowadzania_danych").append(`<h2>Dane wprowadzono</h2>`);
  });

  // lokalizacja
  mymap.locate({setView:true, maxZoom:10});

  function nazwaFunkcji(param){
    return parametr+2;
  }

  function onLocationFound(e){
    let radius = e.accuracy /2;
    L.marker(e.latlng)
      .addTo(mymap)
      .bindPopup(`Znajdujesz sie w promieniu ${radius} metrów w od tego punktu`
      )
      .openPopup();
    L.circle(e.latlng,radius).addTo(mymap);
  }
  function onLocationError(e){
    alert(e.message);
  }
  mymap.on('locationerror', onLocationError);
  mymap.on('locationfound', onLocationFound);

  let layer_group;
  let filtered = [];
  // generowanie listy wszystkich dat
  // (chodzi tylko o te unikalne czyli tak żeby się nie powtarzały)
  let daty = [...new Set(dane.map((item) => item.date))]; //TUTAJ ZMIANA KOSMETYCZNA (->jeżeli return jest w jednej linijce to wtedy daje się bez return za to w nawiasach okrągłych)

  let raw_marker_list = [];
  // generowanie listy na podstawie surowych danych
  for (let item in dane) {
    $("#lista").append(
      // generowanie listy
      `<div class='item'>
        <span class='grubas'>${dane[item].date}</span>
        <div><span class='grubas'>Location: </span>${dane[item].location}</div>
        <div><span class='grubas'>Description: </span>${dane[item].description}<div>
        <a href='#' class='link_open_modal' id=${dane[item].id}>Click for more</a>
       </div>`
    );
    
    // generowanie markerów
    raw_marker_list.push(
      L.circle([dane[item].latitude, dane[item].longitude]).bindPopup(
        `${dane[item].description}`
      )
    );
  }
let zmienna_na_THIS;
 // obsługa modala do edycji
 $('.link_open_modal').click(function(){
  $('.modalBox_edit').show();
  console.log(this.id);
  zmienna_na_THIS = this.id;
  // filtorniwa z danych z którego uzyskujemy tablie z danymi, które chcemy edytować
  wynik_filtrowania_do_edycji = 
  dane.filter(function(item){
    return item.id==zmienna_na_THIS;
  });
  // to jest wpisanie przefiltrowanych danych do modala (formularz)
  $('#object_id_edit').val(wynik_filtrowania_do_edycji[0].id);
  $('#object_date_edit').val(wynik_filtrowania_do_edycji[0].date);
  $('#object_lat_edit').val(wynik_filtrowania_do_edycji[0].latitude);
  $('#object_lng_edit').val(wynik_filtrowania_do_edycji[0].longitude);
  $('#object_location_edit').val(wynik_filtrowania_do_edycji[0].location);
  $('#object_description_edit').val(wynik_filtrowania_do_edycji[0].description);
  $('#object_sources_id_edit').val(wynik_filtrowania_do_edycji[0].sources[0].id);
  $('#object_sources_path_edit').val(wynik_filtrowania_do_edycji[0].sources[0].path);
  $('#object_sources_description_edit').val(wynik_filtrowania_do_edycji[0].sources[0].description);
  
// nadpisywanie danych w zmiennej dane
$('#save_edits').click(function(event){
  event.preventDefault();
  dane.forEach((item)=>{
    if (item.id == zmienna_na_THIS){
      item.id = $('#object_id_edit').val();
      item.date = $('#object_date_edit').val();
      item.latitude = $('#object_lat_edit').val();
      item.longitude = $('#object_lng_edit').val();
      item.location = $('#object_location_edit').val();
      item.description = $('#object_description_edit').val();
      item.sources = $('#object_sources_id_edit').val();
     }
    });
    console.log(dane);
  });
});


  layer_group?.removeFrom(mymap);
  layer_group = L.layerGroup(raw_marker_list);
  layer_group.addTo(mymap);
  // koniec generowania listy na podstawie danych

  // Generowanie listy z wyfiltrowanych danych
  // najpierw obsługa slidera
  $("#myRange").replaceWith(
    `<input type="range" min="1" max=${daty.length} value="10" class="slider" id="myRange"/>`
  );

  //poniżej obsługa zdarzenia gdy slider ulegnie zmianie

  $("#myRange").change((event) => {
    // filtrowanie danych z warunkiem daty
    filtered = dane.filter(function (pojedyncza_dana) {
      return pojedyncza_dana.date == daty[event.target.value];
    });
    let marker_list = [];
    // petla przez dane przefiltrowane
    $("#lista").empty(); // opróżnienie listy
    for (let item in filtered) {
      $("#lista").append(
        // generowanie listy
        `<div class='item'>
            <span class='grubas'>${filtered[item].date}</span>
            <div><span class='grubas'>Location: </span>${filtered[item].location}</div>
            <div><span class='grubas'>Description: </span>${filtered[item].description}<div>
            <a href='#'>Click for more</a>
         </div>`
      );
      // generowanie markerów
      marker_list.push(
        L.circle([filtered[item].latitude, filtered[item].longitude]).bindPopup(
          `${filtered[item].description}`
        )
      );
    } //tu się kończy pętla generująca element listy oraz listę marerów z filtrowanych danych
    layer_group?.removeFrom(mymap);
    layer_group = L.layerGroup(marker_list);
    layer_group.addTo(mymap);
  }); // koniec Generowanie listy z wyfiltrowanych danych
});
