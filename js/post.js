var jsonData;
var nombreArchivo;
var nombreGrafico;
var categoriaGrafico;
var nombreHash;


function botonExportar(){
  //alert( "nombr grafi" + nombreGrafico + categoriaGrafico );
  $("#div_parseo").css('display','block');
 
  
  if (categoriaGrafico.localeCompare("zoomable")==0){
	 // alert(new Date().getTime().toString());
	  nombreHash=CryptoJS.MD5(new Date().getTime().toString());
	  //nombreHash='prueba'
	  postData();
  }
}

function postData(){
	
	
	
	$.ajax({
	  type: "POST",
	  url: "http://opendata.pol.una.py/raw_uploader/"+nombreHash+'.json',
	  data: jsonData,
	  success: setearSource()
	});	
}

function setearSource(){
		// tiene que cambiar el source
		$("#source").val(
		'<script src="http://d3js.org/d3.v3.min.js"></script>'+
		'<script src="http://opendata.pol.una.py/raw/export/lib/index.js"></script>'+
		'<script src="http://opendata.pol.una.py/raw/export/lib/jquery.min.js"></script>'+
		'<div id="chart"> </div>'+
		'<script id="id_script_zoom" src="http://opendata.pol.una.py/raw/export/charts/'+nombreGrafico+'.js" json-name="http://opendata.pol.una.py/raw/export/data/'+nombreHash+'.json" ></script>');
	   
}

