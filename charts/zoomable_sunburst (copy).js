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
		.thumbnail("imgs/zoomable_sunburst.png")
		.category("Zoomable")
		.model(tree)

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
	function getAncestors(node) {
	  var camino = [];
	  var current = node;
	  while (current.parent) {
		camino.unshift(current);
		current = current.parent;
	  }
	  return camino;
	}
	
	chart.draw(function (selection, data){
		
		
		svg=selection;
		
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
		
		texto=g.append("text")
				.style("font-size",11)
				.attr("x", function(d) {/*var sAngle=Math.max(0, Math.min(2 * Math.PI, x(d.x)));
										var eAngle=Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
										var dAngle = (eAngle - sAngle)/2;  */
										return 50	 })
				.attr("dy", function(d) { return 30   })
		
		texto.append("textPath")
				.attr("xlink:href",function(d,i){return "#s"+i})
				.text(function(d,i) {
									var sAngle=Math.max(0, Math.min(2 * Math.PI, x(d.x)));
									var eAngle=Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
									var dAngle = (eAngle - sAngle)*180; 
									var textoSize = $.fn.textWidth(d.name,"11px");	
									console.log("textosize "+textoSize+" dANgle "+dAngle); 
									return  textoSize <= dAngle ? d.name: ""; })
				//.text(function(d,i) { return x(d.dx)/(d.y+d.dy/2) >= Math.PI/2.5 ? d.name: ""; })
	
		//click(nodes[0]);	  
	});
	
	$.fn.textWidth = function(text, font) {
		if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
			$.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
		return $.fn.textWidth.fakeEl.width();
	};
	
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
			
			/*texto.style("opacity",1);
			
			console.log("valor "+d.class.split(" --> ")[dp])
			
			texto.style("opacity",function(d){return parent.parent ? 
															(d.class.split(" --> ")[dp] == parent.name & x(d.dx)/(d.y+d.dy/2) >= Math.PI/2.5 ? 1 : 0)
															: x(d.dx)/(d.y+d.dy/2) >= Math.PI/3 ? 1 : 0 })
			*/
			texto
				.text(function(d,i) {
									var sAngle=Math.max(0, Math.min(2 * Math.PI, x(d.x)));
									var eAngle=Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
									var dAngle = (eAngle - sAngle)*180; 
									var textoSize = $.fn.textWidth(d.name,"11px");	
									console.log("textosize "+textoSize+" dANgle "+dAngle); 
									return  textoSize <= dAngle ? d.name: ""; })
		
			
		}
	
	function computeTextRotation(d) {
	  return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180 ;
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
