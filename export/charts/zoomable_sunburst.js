(function(){
	var scriptPram = document.getElementById('id_script_zoom');
	var nombreArchivo = scriptPram.getAttribute('json-name');
	var nombreGrafico = "zoomable_sunburst.js"
	var width = 860, height = 550, radius = Math.min(width, height) / 2;
	
	var x = d3.scale.linear()
		.range([0, 2 * Math.PI]);
	
	var y = d3.scale.sqrt()
		.range([0, radius]);
	
	var color = d3.scale.category20c();
	
	var svg=d3.select("#chart").append("svg");

	

	var partition = d3.layout.partition()
		.value(function(d) { return d.size; });

	var arc = d3.svg.arc()
		.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
		.endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
		.innerRadius(function(d) { return Math.max(0, y(d.y)); })
		.outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
	var g;
	var path;
	var tip= d3.tip()
		.attr('class', 'd3-tip')
		.style("opacity", 1)
		.offset([-5, 0])
		.style("line-height",1)
		.style("font-weight","bold")
		.style("padding","12px")
		.style("background","rgba(0, 0, 0, 0.8)")
		.style("color","#fff")
		.style("border-radius","2px")
		.html(function(d) {
			var name = d.name;
		var porcen = d.parent ? (d.value/d.parent.value) * 100 : 100;
		porcen=redondeo2decimales(porcen);
		var padre = d.parent ? " sobre  &nbsp"+d.parent.class+" " : '';
			return "<p style=\"color:white\"><strong>Grupo: &nbsp</strong> <span >" + d.class + "</span></p>" + 
					"<p style=\"color:white\"> <strong>Cantidad: &nbsp</strong> <span >" + format_number(d.value) + "</span></p>" + 
					"<p style=\"color:white\"> <strong>Porcentaje"+padre+":</strong> "+ porcen +"%" ;
		});
	
	function format_number(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	/**
	 * Redondeo de numeros
	 */
	function redondeo2decimales(numero) {
		var flotante = parseFloat(numero);
		var resultado = Math.round(flotante*100)/100;
		return resultado;
}


	var texto;
	var nodes;	
	
	d3.json(nombreArchivo, function(error, data) {
		
		
		
		nodes=partition.nodes(data);
		
		svg=svg.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + width / 2 + "," + (height / 2 ) + ")");

		g = svg.selectAll("g")
			.data(nodes)
			.enter().append("g");	

		g.call(tip);
		
		path = g.append("path")
				.attr("d", arc)
				.attr("id", function(d,i){return "s"+i})
				.style("stroke", '#fff')
				.style("fill", function(d) { /*return color((d.children ? d : d.parent).name);*/ return color(d.name); })
				.on("mouseover",function(d){tip.show(d);mouseover(d);})
				.on("mouseout", function(d){tip.hide(d);mouseleave(d)})
				.on("click", click);
			    
			  
	});
	
	function computeTextRotation(d) {
	  return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180 ;
	}
	
	function mouseover(d){
		g.selectAll("path")
      .style("opacity", 0.2);
	  var sequenceArray = getAncestors(d);

	  // Then highlight only those that are an ancestor of the current segment.
	  g.selectAll("path")
		  .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
	}
	
	function getAncestors(node) {
	  var camino = [];
	  var current = node;
	  while (current.parent) {
		camino.unshift(current);
		current = current.parent;
	  }
	  return camino;
	}

	function mouseleave(d){
		g.selectAll("path")
      .style("opacity", 1);
	}
	
	function click(d) {
		var parent = d;
		var dp = parent.depth;
		path.transition()
			.duration(750)
			.attrTween("d", arcTween(d))
		texto.style("opacity",1);
		
		console.log("valor "+d.class.split(" --> ")[dp])
		
      
	}
	
	d3.select(self.frameElement).style("height", height + "px");
	
	// Interpolate the scales!
	function arcTween(d) {
		var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
		yd = d3.interpolate(y.domain(), [d.y, 1]),
		yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
		return function(d, i) {
			return i
				? function(t) { return arc(d); }
				: function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
		};
	}
	
})();
