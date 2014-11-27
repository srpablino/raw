'use strict';

angular.module('raw', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  'raw.filters',
  'raw.services',
  'raw.directives',
  'raw.controllers',
  'mgcrea.ngStrap',
  'ui',
  'colorpicker.module'
])

.config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/main.html', controller: 'RawCtrl'});
  $routeProvider.otherwise({redirectTo: '/'});
  $locationProvider.html5Mode(true);
}]);


var ayuda = 1;
setup_intro();

function setup_intro() {
	console.log('entro a setup_intro');
	var stepsListado = [
			{
				intro : "Bienvenido a esta visualización interactiva para el Visualizador de Datos Abiertos.</br></br>Este tutorial te guiará paso a paso para crear una visualización.\
      </br></br>Haz click en siguiente para comenzar."
			},
			{
				element : '#id-insertar-datasets',
				intro : "Ingrese los datos sobre los cuales desea generar el grafico. Puede copiar/pegar los datos, arrastrar un archivo hasta aquí.",
				position : "top"
			},
			{
				element : '#id-elija-datasets',
				intro : "O elija uno de los datasets de muestra. ",
				position : 'right'
			},
			{
				element : document.querySelector('#id-elija-datasets'),
				intro : "El tutorial de ayuda esperará que ingrese el dataset.",
				position : "center"
			} /*
				 * , { element: document.querySelector('#lista_filter label'),
				 * intro: "Filtra los resultados de acuerdo a los valores de
				 * cualquier campo.", position: "left" }, { element:
				 * document.querySelectorAll('.column-filter')[0], intro: "O
				 * filtra de acuerdo a los valores de una columna en
				 * particular.", }, { element: '#lista_info', intro: "Aquí
				 * puedes ver un resumen de los resultados de tu búsqueda.",
				 * position: "right" }, { element: '#lista_paginate', intro: "Si
				 * los resultados son muchos, desplázate entre las páginas de la
				 * tabla.", position: "left" }, { element:
				 * '#download-button-bar', intro: "Descarga los resultados
				 * filtrados en JSON o CSV.", position: "top" }, { element:
				 * '#tab-descargas', intro: "O descarga todos los datos en
				 * formato Excel, CSV y JSON.", position: "right" }, { element:
				 * '#tab-mapa', intro: "Por último, ¿ya visitaste la sección del
				 * mapa interactivo? <br></br> \ Visualizador <a
				 * href=\"http://usablica.github.com/intro.js/\"introjs </a>
				 * Copyright (C) 2012. ", position: "right" },
				 */
	];

	var stepsListado2 = [
			{
				element : '#id_exito_show',
				intro : "Se verificó que el dataset es válido.",
				position : "top"
			},
			{
				element : '#elija_grafico_div_id',
				intro : "Aquí debe seleccionar un gráfico",
				position : "top"
			},
			{
				element : '#mapping',
				intro : "En esta sección debe realizar el mapeo de los datos del CSV con las columnas las cuales desea general el gráfico",
				position : 'top'
			},
			{
				element : '#seccion_visualizacion_id',
				intro : "En esta sección se genera el gráfico",
				position : 'top'
			},
			{
				element : '#seccion_exportar_id',
				intro : "Aquí se generan las opciones de exportación: descargar y código HTML",
				position : 'top'
			},
			{
				
				intro : "Fin del tutorial.",
				position : 'top'
			}
	];
	$('#start-tour').click(function() {

		console.log('click en ayuda');
		var steps;
		steps = stepsListado;
		introJs().setOptions({
			doneLabel : 'Salir',
			nextLabel : 'Siguiente &rarr;',
			prevLabel : '&larr; Anterior',
			skipLabel : 'Salir',
			steps : steps
		}).start();
		$("#continuar_tutorial").click(function() {
			
			$('#continuar_tutorial').hide();
			introJs().setOptions({
				doneLabel : 'Salir',
				nextLabel : 'Siguiente &rarr;',
				prevLabel : '&larr; Anterior',
				skipLabel : 'Salir',
				steps : stepsListado2
			}).start();
		});
		$('#continuar_tutorial').show();
	});

}
