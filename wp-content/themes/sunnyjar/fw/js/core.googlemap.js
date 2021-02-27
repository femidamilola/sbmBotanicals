function sunnyjar_googlemap_init(dom_obj, coords) {
	"use strict";
	if (typeof SUNNYJAR_STORAGE['googlemap_init_obj'] == 'undefined') sunnyjar_googlemap_init_styles();
	SUNNYJAR_STORAGE['googlemap_init_obj'].geocoder = '';
	try {
		var id = dom_obj.id;
		SUNNYJAR_STORAGE['googlemap_init_obj'][id] = {
			dom: dom_obj,
			markers: coords.markers,
			geocoder_request: false,
			opt: {
				zoom: coords.zoom,
				center: null,
				scrollwheel: false,
				scaleControl: false,
				disableDefaultUI: false,
				panControl: true,
				zoomControl: true, //zoom
				mapTypeControl: false,
				streetViewControl: false,
				overviewMapControl: false,
				styles: SUNNYJAR_STORAGE['googlemap_styles'][coords.style ? coords.style : 'default'],
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
		};
		
		sunnyjar_googlemap_create(id);

	} catch (e) {
		
		//dcl(SUNNYJAR_STORAGE['strings']['googlemap_not_avail']);

	};
}

function sunnyjar_googlemap_create(id) {
	"use strict";

	// Create map
	SUNNYJAR_STORAGE['googlemap_init_obj'][id].map = new google.maps.Map(SUNNYJAR_STORAGE['googlemap_init_obj'][id].dom, SUNNYJAR_STORAGE['googlemap_init_obj'][id].opt);

	// Add markers
	for (var i in SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers)
		SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].inited = false;
	sunnyjar_googlemap_add_markers(id);
	
	// Add resize listener
	jQuery(window).resize(function() {
		if (SUNNYJAR_STORAGE['googlemap_init_obj'][id].map)
			SUNNYJAR_STORAGE['googlemap_init_obj'][id].map.setCenter(SUNNYJAR_STORAGE['googlemap_init_obj'][id].opt.center);
	});
}

function sunnyjar_googlemap_add_markers(id) {
	"use strict";
	for (var i in SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers) {
		
		if (SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].inited) continue;
		
		if (SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].latlng == '') {
			
			if (SUNNYJAR_STORAGE['googlemap_init_obj'][id].geocoder_request!==false) continue;
			
			if (SUNNYJAR_STORAGE['googlemap_init_obj'].geocoder == '') SUNNYJAR_STORAGE['googlemap_init_obj'].geocoder = new google.maps.Geocoder();
			SUNNYJAR_STORAGE['googlemap_init_obj'][id].geocoder_request = i;
			SUNNYJAR_STORAGE['googlemap_init_obj'].geocoder.geocode({address: SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].address}, function(results, status) {
				"use strict";
				if (status == google.maps.GeocoderStatus.OK) {
					var idx = SUNNYJAR_STORAGE['googlemap_init_obj'][id].geocoder_request;
					if (results[0].geometry.location.lat && results[0].geometry.location.lng) {
						SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = '' + results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
					} else {
						SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = results[0].geometry.location.toString().replace(/\(\)/g, '');
					}
					SUNNYJAR_STORAGE['googlemap_init_obj'][id].geocoder_request = false;
					setTimeout(function() { 
						sunnyjar_googlemap_add_markers(id); 
						}, 200);
				} else
					dcl(SUNNYJAR_STORAGE['strings']['geocode_error'] + ' ' + status);
			});
		
		} else {
			
			// Prepare marker object
			var latlngStr = SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].latlng.split(',');
			var markerInit = {
				map: SUNNYJAR_STORAGE['googlemap_init_obj'][id].map,
				position: new google.maps.LatLng(latlngStr[0], latlngStr[1]),
				clickable: SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].description!=''
			};
			if (SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].point) markerInit.icon = SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].point;
			if (SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].title) markerInit.title = SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].title;
			SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].marker = new google.maps.Marker(markerInit);
			
			// Set Map center
			if (SUNNYJAR_STORAGE['googlemap_init_obj'][id].opt.center == null) {
				SUNNYJAR_STORAGE['googlemap_init_obj'][id].opt.center = markerInit.position;
				SUNNYJAR_STORAGE['googlemap_init_obj'][id].map.setCenter(SUNNYJAR_STORAGE['googlemap_init_obj'][id].opt.center);				
			}
			
			// Add description window
			if (SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].description!='') {
				SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].infowindow = new google.maps.InfoWindow({
					content: SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].description
				});
				google.maps.event.addListener(SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].marker, "click", function(e) {
					var latlng = e.latLng.toString().replace("(", '').replace(")", "").replace(" ", "");
					for (var i in SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers) {
						if (latlng == SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].latlng) {
							SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].infowindow.open(
								SUNNYJAR_STORAGE['googlemap_init_obj'][id].map,
								SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].marker
							);
							break;
						}
					}
				});
			}
			
			SUNNYJAR_STORAGE['googlemap_init_obj'][id].markers[i].inited = true;
		}
	}
}

function sunnyjar_googlemap_refresh() {
	"use strict";
	for (id in SUNNYJAR_STORAGE['googlemap_init_obj']) {
		sunnyjar_googlemap_create(id);
	}
}

function sunnyjar_googlemap_init_styles() {
	// Init Google map
	SUNNYJAR_STORAGE['googlemap_init_obj'] = {};
	SUNNYJAR_STORAGE['googlemap_styles'] = {
		'default': []
	};
	if (window.sunnyjar_theme_googlemap_styles!==undefined)
		SUNNYJAR_STORAGE['googlemap_styles'] = sunnyjar_theme_googlemap_styles(SUNNYJAR_STORAGE['googlemap_styles']);
}