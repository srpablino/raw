(function(){

	
	var margin = {top: 20, right: 0, bottom: 0, left: 0},
	    width = 500,
	    height = 500 - margin.top - margin.bottom,
	    formatNumber = d3.format(",d"),
	    transitioning;

	var x = d3.scale.linear()
	    .domain([0, width])
	    .range([0, width]);

	var y = d3.scale.linear()
	    .domain([0, height])
	    .range([0, height]);
	
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
//	var tree = raw.models.tree();
//
	var treemap = d3.layout.treemap()
	    .children(function(d, depth) { return depth ? null : d._children; })
	    .sort(function(a, b) { return a.value - b.value; })
	    .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
	    .round(false);

	
//	
//	model.map(function (data){
//		return data.map(function (d){
//			return {
//				x : +x(d),
//				y : +y(d)
//			}
//		})
//	})

	
	// The Chart

	
	var chart = raw.chart()
        .title('treemap_zoom_intento_3')
		.description(
            "TREEMAP INTENTO 1")
		.thumbnail("imgs/treemap.png")
	    .category('Hierarchies')
		.model(tree)
	// Some options we want to expose to the users
	// For each of them a GUI component will be created
	// Options can be use within the Draw function
	// by simply calling them (i.e. witdh())
	// the current value of the options will be returned

	
	// Drawing function
	// selection represents the d3 selection (svg)
	// data is not the original set of records
	// but the result of the model map function
	chart.draw(function (selection, data){

		// svg size
		var svg=selection;
		var root=data
		svg.attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.bottom + margin.top)
		    .style("margin-left", -margin.left + "px")
		    .style("margin.right", -margin.right + "px")
		    .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		    .style("shape-rendering", "crispEdges");

		var grandparent = svg.append("g")
	    .attr("class", "grandparent");

		grandparent.append("rect")
		    .attr("y", -margin.top)
		    .attr("width", width)
		    .attr("height", margin.top);
		
		grandparent.append("text")
		    .attr("x", 6)
		    .attr("y", 6 - margin.top)
		    .attr("dy", ".75em");
		
		initialize(root);
		accumulate(root);

		alert("root acumulado" + JSON.stringify(root));
		layout(root);
	
		display(root);
		
		function initialize(root) {
		    root.x = root.y = 0;
		    root.dx = width;
		    root.dy = height;
		    root.depth = 0;
		}
		// Aggregate the values for internal nodes. This is normally done by the
		// treemap layout, but not here because of our custom implementation.
		// We also take a snapshot of the original children (_children) to avoid
		// the children being overwritten when when layout is computed.
		function accumulate(d) {
			return (d._children = d.children)
		        ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
		        : d.value;
		}
		
		// Compute the treemap layout recursively such that each group of siblings
		// uses the same size (1×1) rather than the dimensions of the parent cell.
		// This optimizes the layout for the current zoom state. Note that a wrapper
		// object is created for the parent node for each group of siblings so that
		// the parent’s dimensions are not discarded as we recurse. Since each group
		// of sibling was laid out in 1×1, we must rescale to fit using absolute
		// coordinates. This lets us use a viewport to zoom.
		function layout(d) {
			alert("json" + JSON.stringify(d._children));
			if (d._children) {
				treemap.nodes({_children: d._children});
				d._children.forEach(function(c) {					
					c.x = d.x + c.x * d.dx;
					c.y = d.y + c.y * d.dy;
					c.dx *= d.dx;
					c.dy *= d.dy;
					c.parent = d;
					layout(c);
				});
			}
			
		}
		function display(d) {
		    grandparent
		        .datum(d.parent)
		        .on("click", transition)
		      .select("text")
		        .text(name(d));

		    var g1 = svg.insert("g", ".grandparent")
		        .datum(d)
		        .attr("class", "depth");

		    var g = g1.selectAll("g")
		        .data(d._children)
		      .enter().append("g");

		    g.filter(function(d) { return d._children; })
		        .classed("children", true)
		        .on("click", transition);

		    g.selectAll(".child")
		        .data(function(d) { return d._children || [d]; })
		      .enter().append("rect")
		        .attr("class", "child")
		        .call(rect);

		    g.append("rect")
		        .attr("class", "parent")
		        .call(rect)
		      .append("title")
		        .text(function(d) { return formatNumber(d.value); });

		    g.append("text")
		        .attr("dy", ".75em")
		        .text(function(d) { return d.name; })
		        .call(text);

		    function transition(d) {
		      if (transitioning || !d) return;
		      transitioning = true;

		      var g2 = display(d),
		          t1 = g1.transition().duration(750),
		          t2 = g2.transition().duration(750);

		      // Update the domain only after entering new elements.
		      x.domain([d.x, d.x + d.dx]);
		      y.domain([d.y, d.y + d.dy]);

		      // Enable anti-aliasing during the transition.
		      svg.style("shape-rendering", null);

		      // Draw child nodes on top of parent nodes.
		      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

		      // Fade-in entering text.
		      g2.selectAll("text").style("fill-opacity", 0);

		      // Transition to the new view.
		      t1.selectAll("text").call(text).style("fill-opacity", 0);
		      t2.selectAll("text").call(text).style("fill-opacity", 1);
		      t1.selectAll("rect").call(rect);
		      t2.selectAll("rect").call(rect);

		      // Remove the old node when the transition is finished.
		      t1.remove().each("end", function() {
		        svg.style("shape-rendering", "crispEdges");
		        transitioning = false;
		      });
		    }

		    return g;
		  }
		function text(text) {
		    text.attr("x", function(d) { return x(d.x) + 6; })
		        .attr("y", function(d) { return y(d.y) + 6; });
		}

		function rect(rect) {
			rect.attr("x", function(d) { return x(d.x); })
				.attr("y", function(d) { return y(d.y); })
				.attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
				.attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
		}

		function name(d) {
			return d.parent
				? name(d.parent) + "." + d.name
						: d.name;
		}

	})
})();
