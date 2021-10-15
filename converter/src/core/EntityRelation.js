import {dia,V,g,shapes} from "jointjs"
export default
class EntityRelation{
    
    constructor(id){
        this.id = id
        this.tables=[]
    }
    addEntity(entity)
    {
        this.tables.push({   
            name : entity.name,
            attributes : entity.attributes})
        
    }
    addKeyAttribute()
    {

    }
    addNotNULLAttribute()
    {

    }
    addCommonAttribute()
    {

    }
    render()
    {
        
        var erd = shapes.erd;
        var graph = new dia.Graph();
        var paper = new dia.Paper({
            el: document.getElementById(this.id),
            width: 695,
            height: 600,
            model: graph,
            linkPinning: false,
            highlighting: false,
            defaultConnectionPoint: function(line, view) {
                var element = view.model;
                return element.getConnectionPoint(line.start) || element.getBBox().center();
            }
        });
    
    // Custom highlighter - display an outline around each element that fits its shape.
    
        var highlighter = V('path', {
            'stroke': '#e9fc03',
            'stroke-width': '2px',
            'fill': 'transparent',
            'pointer-events': 'none'
        });
    
    // Define a specific highligthing path for every shape.
    
    erd.Attribute.prototype.getHighlighterPath = function(w, h) {
    
        return ['M', 0, h / 2, 'A', w / 2, h / 2, '0 1,0', w, h / 2, 'A', w / 2, h / 2, '0 1,0', 0, h / 2].join(' ');
    };
    
    erd.Entity.prototype.getHighlighterPath = function(w, h) {
    
        return ['M', w, 0, w, h, 0, h, 0, 0, 'z'].join(' ');
    };
    
    erd.Relationship.prototype.getHighlighterPath = function(w) {
    
        return ['M', w / 2, 0, w, w / 2, w / 2, w, 0, w / 2, 'z'].join(' ');
    };
    
    erd.ISA.prototype.getHighlighterPath = function(w, h) {
    
        return ['M', -8, 1, w + 8, 1, w / 2, h + 2, 'z'].join(' ');
    };
    
    // Define a specific connection points for every shape
    
    erd.Attribute.prototype.getConnectionPoint = function(referencePoint) {
        // Intersection with an ellipse
        return g.Ellipse.fromRect(this.getBBox()).intersectionWithLineFromCenterToPoint(referencePoint);
    };
    
    erd.Entity.prototype.getConnectionPoint = function(referencePoint) {
        // Intersection with a rectangle
        return this.getBBox().intersectionWithLineFromCenterToPoint(referencePoint);
    };
    
    erd.Relationship.prototype.getConnectionPoint = function(referencePoint) {
        // Intersection with a rhomb
        var bbox = this.getBBox();
        var line = new g.Line(bbox.center(), referencePoint);
        return (
            line.intersection(new g.Line(bbox.topMiddle(), bbox.leftMiddle())) ||
            line.intersection(new g.Line(bbox.leftMiddle(), bbox.bottomMiddle())) ||
            line.intersection(new g.Line(bbox.bottomMiddle(), bbox.rightMiddle())) ||
            line.intersection(new g.Line(bbox.rightMiddle(), bbox.topMiddle()))
        );
    };
    
    erd.ISA.prototype.getConnectionPoint = function(referencePoint) {
        // Intersection with a triangle
        var bbox = this.getBBox();
        var line = new g.Line(bbox.center(), referencePoint);
        return (
            line.intersection(new g.Line(bbox.origin(), bbox.topRight())) ||
            line.intersection(new g.Line(bbox.origin(), bbox.bottomMiddle())) ||
            line.intersection(new g.Line(bbox.topRight(), bbox.bottomMiddle()))
        );
    };
    
    // Bind custom ones.
    paper.on('cell:highlight', function(cellView) {
    
        var padding = 5;
        var bbox = cellView.getBBox({ useModelGeometry: true }).inflate(padding);
    
        highlighter.translate(bbox.x, bbox.y, { absolute: true });
        highlighter.attr('d', cellView.model.getHighlighterPath(bbox.width, bbox.height));
    
        V(paper.viewport).append(highlighter);
    });
    /*var createLink = function(elm1, elm2) {
    
        var myLink = new erd.Line({
            markup: [
                '<path class="connection" stroke="black" d="M 0 0 0 0"/>',
                '<path class="connection-wrap" d="M 0 0 0 0"/>',
                '<g class="labels"/>',
                '<g class="marker-vertices"/>',
                '<g class="marker-arrowheads"/>'
            ].join(''),
            source: { id: elm1.id },
            target: { id: elm2.id }
        });
    
        return myLink.addTo(graph);
    };*/
    paper.on('cell:unhighlight', function() {
    
        highlighter.remove();
    });
    var employee = new erd.Entity({

        position: { x: 100, y: 200 },
        attrs: {
            text: {
                fill: '#ffffff',
                text: 'Employee',
                letterSpacing: 0,
                style: { textShadow: '1px 0 1px #333333' }
            },
            '.outer': {
                fill: '#31d0c6',
                stroke: 'none',
                filter: { name: 'dropShadow',  args: { dx: 0.5, dy: 2, blur: 2, color: '#333333' }}
            },
            '.inner': {
                fill: '#31d0c6',
                stroke: 'none',
                filter: { name: 'dropShadow',  args: { dx: 0.5, dy: 2, blur: 2, color: '#333333' }}
            }
        }
    });
    graph.addCells([employee])
     // console.log(this.tables)
    // Create shapes
    /*for(var i in this.tables)
    {
      console.log(this.tables[i])
      var tmp = new erd.Entity(
        {
    
        position: { x: 100, y: 200 },
        attrs: {
            text: {
                fill: '#ffffff',
                text: this.tables[i].name,
                letterSpacing: 0,
                style: { textShadow: '1px 0 1px #333333' }
            },
            '.outer': {
                fill: '#31d0c6',
                stroke: 'none',
                filter: { name: 'dropShadow',  args: { dx: 0.5, dy: 2, blur: 2, color: '#333333' }}
            },
            '.inner': {
                fill: '#31d0c6',
                stroke: 'none',
                filter: { name: 'dropShadow',  args: { dx: 0.5, dy: 2, blur: 2, color: '#333333' }}
            }
        }})
        graph.addCell(tmp)
      for( var j in this.tables[i].attributes)
      {
        var att
        console.log(this.tables[i].attributes[j])
        if(this.tables[i].attributes[j].iskey==true)
        {
          att= new erd.Key({
    
        position: { x: 10, y: 90 },
        attrs: {
            text: {
                fill: '#ffffff',
                text: this.tables[i].attributes[j].name+":"+this.tables[i].attributes[j].type,
                letterSpacing: 0,
                style: { textShadow: '1px 0 1px #333333' }
            },
            '.outer': {
                fill: '#feb662',
                stroke: 'none',
                filter: { name: 'dropShadow',  args: { dx: 0, dy: 2, blur: 2, color: '#222138' }}
            },
            '.inner': {
                fill: '#feb662',
                stroke: 'none'
            }
        }
    })
        }
        else
        {
          if(this.tables[i].attributes[j].nullable==true)
          {
            att = new erd.Normal(
              {
                position: { x: 75, y: 30 },
                attrs: {
                  text: {
                  fill: '#ffffff',
                  text: this.tables[i].attributes[j].name+":"+this.tables[i].attributes[j].type,
                  letterSpacing: 0,
                  style: { textShadow: '1px 0 1px #333333' }
              },
              '.outer': {
                fill: '#fe8550',
                stroke: '#fe854f',
                filter: { name: 'dropShadow',  args: { dx: 0, dy: 2, blur: 2, color: '#222138' }}
            }
          }
          })
        }
        else
        {
            att = new erd.Normal(
              {
                position: { x: 75, y: 30 },
                attrs: {
                  text: {
                  fill: '#ffffff',
                  text: this.tables[i].attributes[j].name+":"+this.tables[i].attributes[j].type,
                  letterSpacing: 0,
                  style: { textShadow: '1px 0 1px #333333' }
              },
              '.outer': {
                fill: '#8000ff',
                stroke: '#8000ff',
                filter: { name: 'dropShadow',  args: { dx: 0, dy: 2, blur: 2, color: '#222138' }}
            }
          }
          })
        }
      }
        graph.addCell(att)
        createLink(tmp,att)
        
      }
    }*/
    console.log(this.id,"rendered")
    for( var i in this.tables)
    console.log("entity+")
        console.log(this.tables[i])
        console.log("entity+")
    }
}