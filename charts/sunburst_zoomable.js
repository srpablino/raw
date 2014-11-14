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

	var width = 860, height = 550, radius = Math.min(width, height) / 2;
	
	var x = d3.scale.linear()
		.range([0, 2 * Math.PI]);
	
	var y = d3.scale.sqrt()
		.range([0, radius]);
	
	var color = d3.scale.category20c();
	
	var svg;

	var chart = raw.chart()
		.title("Sunburst Zoomable")
		.description("Agrupacion circular con zoom por categorias")
		.thumbnail("imgs/zoomable.png")
		.category("Others")
		.model(tree)

	var partition = d3.layout.partition()
		.value(function(d) { return d.size; });

	var arc = d3.svg.arc()
		.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
		.endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
		.innerRadius(function(d) { return Math.max(0, y(d.y)); })
		.outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
		
	var path;
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
		var prueba = d3.nest()
		svg=selection;
		svg=svg.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + width / 2 + "," + (height / 2 ) + ")");
		svg.call(tip);
		path = svg.selectAll("path")
			.data(partition.nodes(data))
			.enter().append("path")
				.attr("d", arc)
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
		path.transition()
			.duration(750)
			.attrTween("d", arcTween(d));
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
