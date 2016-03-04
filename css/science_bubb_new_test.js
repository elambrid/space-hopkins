<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta charset="UTF-8"/>

	<style>

	.node {
	  cursor: pointer;
	}

	.node:hover {
	  stroke: #000;
	  stroke-width: 1.5px;
	}

	.node--leaf {
	  fill: white;
	}

	.label {
	  font: 20px "Helvetica Neue", Helvetica, Arial, sans-serif;
	  text-anchor: middle;
	  text-shadow: 0 1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff, 0 -1px 0 #fff;
	}

	.label,
	.node--root,
	.node--leaf {
	  pointer-events: none;
	}

	body {background:none transparent;
		}
	svg{
    	position:absolute;
    	width:100%;
    	left:25%;
	}

	.root-node {
	  cursor: pointer;
	  fill: #fff;
	  stroke: green;
	  stroke-width: 3.5px;
	}	
	
	</style>
	<body>
	<script src="js/d3.min.js" charset="utf-8"></script>
	<script type="text/javascript">



	function comparator(a, b) {
 		 return a.length - b.length;
		};

	var margin = 20,
	    diameter = 960;

	var color = d3.scale.linear()
	    .domain([-1, 5])
	    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
	    .interpolate(d3.interpolateHcl);

	var pack = d3.layout.pack()
	    .sort(comparator) 	
	    .padding(4)
	    .size([diameter - margin, diameter - margin])
	    .value(function(d) { return d.size; })

	var svg = d3.select("body").append("svg")
	    .attr("width", diameter)
	    .attr("height", diameter)
	  .append("g")
	    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

	d3.json("flare.json", function(error, root) {
		  if (error) throw error;

	var focus = root,
	      nodes = pack.nodes(root),
	      view;


	 var calculateTextFontSize = function(d) {
	  var id = d3.select(this).text();
	  var radius = 0;
	  if (d.fontsize){
	    //if fontsize is already calculated use that.
	    return d.fontsize;
	  }
	  if (!d.computed ) {
	    //if computed not present get & store the getComputedTextLength() of the text field
	    d.computed = this.getComputedTextLength();
	    if(d.computed !== 0){
	      //if computed is not 0 then get the visual radius of DOM
	      var r = d.r;
	      //if radius present in DOM use that
	      if (r) {
		radius = r;
	      }
	      //calculate the font size and store it in object for future
	      d.fontsize = (2 * radius - 8) / d.computed * 24 + "px";
	      return d.fontsize;  
	    }
	  }
	 }



	  var circle = svg.selectAll("circle")
	      .data(nodes)
	    .enter().append("circle")
	      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
	      .style("fill", function(d) { return d.children ? color(d.depth) : null; })
	      .style("fill", function(d) { return d.parent? "color" : "transparent"; })
	      .attr("r", function(d) { return d.r; })
              .attr("id", function(d) {return d.name;})	      	
	      .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });
	



          circle.append("svg:title").text(function(d) {return d.name;})



	   
	  var text = svg.selectAll("text")
	      .data(nodes)
	    .enter().append("text")
	      .attr("class", "label")	
	      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
	      .style("display", function(d) { return d.parent === root ? "inline" : "none"; }) 
	      .text(function(d) {return d.name;})
              .style("font-size", calculateTextFontSize)
              .attr("dy", ".35em");

	  

	  var node = svg.selectAll("circle,text");;
	  



	  d3.select("body")
	      .on("click", function() { zoom(root); });

	  zoomTo([root.x, root.y, root.r * 2 + margin]);

	function zoom(d) {
	  var focus0 = focus;
	  focus = d;

	  var transition = d3.transition()
	    .duration(d3.event.altKey ? 7500 : 750)
	    .tween("zoom", function(d) {
	      var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
	      return function(t) {
		zoomTo(i(t));
	      };
	    });

	  transition.selectAll("text")
	    .filter(function(d) {
	      return d.parent === focus || this.style.display === "inline";
	    })
	    .style("fill-opacity", function(d) {
	      return d.parent === focus ? 1 : 0;
	    })
	    .each("start", function(d) {
	      if (d.parent === focus) this.style.display = "inline";
	    })
	    .each("end", function(d) {
	      if (d.parent !== focus) this.style.display = "none";
	    });
	    setTimeout(function() {
	      d3.selectAll("text").filter(function(d) {
		return d.parent === focus || this.style.display === "inline";
	      }).style("font-size", calculateTextFontSize);
	    }, 500)
	}

	  function zoomTo(v) {
	    var k = diameter / v[2]; view = v;
	    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
	    circle.attr("r", function(d) { return d.r * k; });
	  }

	});




	d3.select(self.frameElement).style("height", diameter + "px");
	</script>
	</body>
</html>
