(function(){
	
	var scriptPram = document.getElementById('id_script_zoom');
	var nombreArchivo = scriptPram.getAttribute('json-name');
	var width = 860, height = 550;
	
	var x = d3.scale.linear()
    .range([0, width]);

	var y = d3.scale.linear()
    .range([0, height]);
	
	var color = d3.scale.category20();
	
	var svg=d3.select("#chart").append("svg");

	var partition = d3.layout.partition()
		.value(function(d) { return d.size; });
		
	var rect,texto;
	
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
	var nodes;
	var myData;
	d3.json(nombreArchivo, function(error, data) {
		
		
		svg=svg.attr("width", width)
			.attr("height", height)
			.append("g")
		svg.call(tip);
	   nodes = partition.nodes(data);
		rect = svg.selectAll("rect")
			.data(nodes)
			.enter().append("rect")
				.attr("x", function(d) { return x(d.x); })
				.attr("y", function(d) { return y(d.y); })
				.attr("width", function(d) { return Math.abs(x(d.dx)); })
				.attr("height", function(d) { return Math.abs(y(d.dy)); })
				.style("stroke", '#fff')
				.style("fill", function(d) { /*return color((d.children ? d : d.parent).name);*/ return color(d.name); })
				.on("mouseover",function(d){tip.show(d);mouseover(d);})
				.on("mouseout", function(d){tip.hide(d);mouseleave(d)})//tip.hide)
				.on("click", click)
		
		texto=svg.selectAll("text").data(nodes)
			.enter().append("svg:text")
				.attr("x", function(d) { return x(d.x) + x(d.dx/2) ; })
				.attr("y", function(d) { return y(d.y) + y(d.dy/2) ; })
				.attr("dy", ".35em")
				.attr("text-anchor", "middle")
				.style("font-size","11px")
				.style("font-family","Arial, Helvetica")
				.text(function(d) { var cadena=$.fn.textWidth(d.name,"11px")  <= d.dx*width ? d.name : "";return cadena});		
		
		
				
	});
	
	$.fn.textWidth = function(text, font) {
		if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
			$.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
		return $.fn.textWidth.fakeEl.width();
	};
	
	function mouseover(d){
		svg.selectAll("rect")
      .style("opacity", 0.2);
	  var sequenceArray = getAncestors(d);

	  // Then highlight only those that are an ancestor of the current segment.
	  svg.selectAll("rect")
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
		svg.selectAll("rect")
      .style("opacity", 1);
	}
	
	function click(d) {
		
	  x.domain([d.x, d.x + d.dx]);
	  y.domain([d.y, 1]).range([d.y ? 20 : 0, height]);
	  var nameFiltro = d.name;
	  rect.transition()
		  .duration(750)
		  .attr("x", function(d) { return x(d.x); })
		  .attr("y", function(d) { return y(d.y); })
		  .attr("width", function(d) { var w=x(d.x + d.dx) - x(d.x); return w  })
		  .attr("height", function(d) { var h=y(d.y + d.dy) - y(d.y); return h  });
		
		texto.transition(750)
				.attr("x", function(d) { return x(d.x + d.dx/2) ; })
				.attr("y", function(d) { return y(d.y + d.dy/2) ; })
				.attr("dy", ".35em")
				.attr("text-anchor", "middle")
				.style("font-size","11px")
				.style("font-family","Arial, Helvetica")
				.text(function(d) { var w=x(d.x + d.dx) - x(d.x); 
									var cadena= $.fn.textWidth(d.name,"11px")  <= w ? d.name : "";
									return cadena} );				  			

	}
	
	
	
})();
