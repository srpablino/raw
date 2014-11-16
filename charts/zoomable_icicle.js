(function(){
	
	var tree = raw.model();

    var hierarchy = tree.dimension('Jerarquias')
       .title('Jerarquias')
       .description("Jerarquias para agrupar los datos")
       .required(1)
       .multiple(true);

    var size = tree.dimension('Medida')
       .title('Medida')
       .description("Campo por el que se va a totalizar")
       .accessor(function (d){ return +d; })
       .types(Number)


    /*var color = tree.dimension('color')
       .title('Color')

    var label = tree.dimension('label')
       .title('Label')
       .multiple(true)*/

    tree.map(function (data){
		var root = { children : [] };
		root.name="";
		root.class="_total_ ";
		data.forEach(function (d){
			if (!hierarchy()) return root;
			var leaf = seek(root, hierarchy(d), hierarchy());
			if(leaf === false || !leaf) return;
			if (!leaf.size) leaf.size = 0;
			leaf.size += size() ? +size(d) : 1;
			//leaf.color = color(d);
			//leaf.label = label(d);
			delete leaf.children;
      });
      
	  	
      return root;
    })
	
    function seek(root, path, classes) {
      if (path.length < 1) return false;
	  //console.log("resultado del path "+ JSON.stringify(path));
      if (!root.children) root.children = [];
      var p = root.children.filter(function (d){ return d.name == path[0]; })[0];
	  //console.log("lo que hay en p "+ JSON.stringify(p));	
      if (!p) {
        if( /\S/.test(path[0]) ) {
		  
          p = { name: path[0], class:root.class +" --> "+path[0], children:[]};  
          root.children.push(p);
        } else p = root;
      }
      if (path.length == 1) return p;
      else return seek(p, path.slice(1), classes.slice(1));
    }

	var width = 860, height = 550;
	
	var x = d3.scale.linear()
    .range([0, width]);

	var y = d3.scale.linear()
    .range([0, height]);
	
	var color = d3.scale.category20();
	
	var svg;

	var chart = raw.chart()
		.title("Zoomable Icicle")
		.description("Agrupacion icicle con zoom por categorias")
		.thumbnail("imgs/zoomable_icicle.png")
		.category("Zoomable")
		.model(tree)

	var partition = d3.layout.partition()
		.value(function(d) { return d.size; });
		
	var rect;
	
	var tip= d3.tip()
		.attr('class', 'd3-tip')
		.style("opacity", 1)
		.offset([-5, 0])
		.html(function(d) {
			var name = d.name;
		var porcen = d.parent ? (d.value/d.parent.value) * 100 : 100;
		porcen=redondeo2decimales(porcen);
		var padre = d.parent ? " sobre  &nbsp"+d.parent.class+" " : '';
			return "<p><strong>Grupo: &nbsp</strong> <span style='color:black'>" + d.class + "</span></p>" + 
					"<p> <strong>Cantidad: &nbsp</strong> <span style='color:black'>" + format_number(d.value) + "</span></p>" + 
					//"<p> <strong>Porcentaje"+padre+":</strong> <span style='color:black'>" + porcen + "%</span></p>" ;
					"<p> <strong>Porcentaje"+padre+":</strong> "+ porcen +"%" ;
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
	
	chart.draw(function (selection, data){
		svg=selection;
		svg=svg.attr("width", width)
			.attr("height", height)
			.append("g")
		svg.call(tip);
		rect = svg.selectAll("rect")
			.data(partition.nodes(data))
			.enter().append("rect")
				.attr("x", function(d) { return x(d.x); })
				.attr("y", function(d) { return y(d.y); })
				.attr("width", function(d) { return Math.abs(x(d.dx)); })
				.attr("height", function(d) { return Math.abs(y(d.dy)); })
				.style("stroke", '#fff')
				.style("fill", function(d) { /*return color((d.children ? d : d.parent).name);*/ return color(d.name); })
				.on("mouseover",function(d){tip.show(d);mouseover(d);})
				.on("mouseout", function(d){tip.hide(d);mouseleave(d)})//tip.hide)
				.on("click", click);
	});
	function mouseover(d){
		svg.selectAll("path")
      .style("opacity", 0.2);
	  var sequenceArray = getAncestors(d);

	  // Then highlight only those that are an ancestor of the current segment.
	  svg.selectAll("path")
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
		svg.selectAll("path")
      .style("opacity", 1);
	}
	
	function click(d) {
	  x.domain([d.x, d.x + d.dx]);
	  y.domain([d.y, 1]).range([d.y ? 20 : 0, height]);

	  rect.transition()
		  .duration(750)
		  .attr("x", function(d) { return x(d.x); })
		  .attr("y", function(d) { return y(d.y); })
		  .attr("width", function(d) { var w=x(d.x + d.dx) - x(d.x); console.log("width: "+w);return w  })
		  .attr("height", function(d) { var h=y(d.y + d.dy) - y(d.y); console.log("height: "+h);return h  });
}
	
})();
