<template>
  <div class="vueClass">
    <table>
      <caption class="abstract">
      </caption>
      <tr>
        <th>
          Options
        </th>
        <th>
          ER-Diagramm
        </th>
        <th>
          Sql-Script
        </th>
      </tr>
      <tr>
        <td>
          <div v-if="creatingEntity==='yes'">
          <button v-on:click="createEntity" >
            Create entity
          </button>
          </div>
          <div v-else>
            <table>
              <tr>
                <td>
                  <label>Entity name </label>
               
                  <input type="text" v-model="eName">
                </td>
              </tr>
              <tr>
                <table id="attributes">
                  <th>
                    Name
                  </th>
                  <th>
                    Type
                  </th>
                  <th>
                    Is key
                  </th>
                  <th>
                    Nullable
                  </th>

                  <tr v-for="item in rows" v-bind:key="item.id">
                    <td>
                      <input type="text" v-model="item.name">
                    </td>
                    <td>
                      <input type="text" v-model="item.type">
                    </td>
                    <td>
                      <input type="checkbox" v-model="item.iskey">
                    </td>
                    <td>
                      <input type="checkbox" v-model="item.nullable">
                    </td>
                  </tr>
                </table>
                </tr>
            </table>
                <button v-on:click="addRow">Add row</button>
                <button v-on:click="deleteRow">Delete row</button>
                <button v-on:click="commitEntity">Commit</button>  
          </div>
          <div v-if="creatingRelation==='yes'">
          <button v-on:click="createRelation" >
            Create Relation
          </button>
          </div>
          <div v-else>
            <table>
              <th>

              </th>
              <th>
                First entity
              </th>
              <th>
                Second entity
              </th>
              <tr>
                <td></td>
                <td>
                  <select v-model="selected">
                  <option disabled value=""></option>
                  <option>1</option>
                  <option>M</option>
                  <option>Inherritence</option>
                  </select>
                </td>
                <td>
                  <select v-model="selected">
                  <option disabled value=""></option>
                  <option>1</option>
                  <option>M</option>
                  <option>Inherritence</option>
                  </select>
                </td>
              </tr>
            </table>
            <button v-on:click="commitRelation">Commit</button>

          </div>
        </td>
        <td>
          
          <div id="paper">

          </div>
        </td>
        <td>
          <label>{{createdCode}}</label>
          <div id="myClass">

          </div>
        </td>
      </tr>
    </table>
    
  </div>
</template>

<script>
//import Entity from './views/Entity.vue'
import {dia,V,g,shapes} from "jointjs"
import EntityRelation from "../src/core/EntityRelation"
export default {
 // components: { Entity },
  
  name: 'App',
  //mounted() {
  //},
  data:()=>
  (   
    {
      erDiagramm: new EntityRelation("myClass"),
      tables:
      [
       
      ],
      createdCode:"",
      eName:"sadasd",
      creatingEntity:"yes",
      creatingRelation:"yes",
      rows: [{id:1,name:"",type:"",iskey:"",nullable:""},]
    }
  ),
  methods:
  {
    createEntity: function()
    {
      this.erDiagramm.render()
      this.creatingEntity="no"
    },
    createRelation: function()
    {
      this.creatingRelation="no"
    }
    ,
    commitRelation: function()
    {
      this.creatingRelation="yes"
    },
    commitEntity: function()
    {
      var tmp = {
          name:this.eName,
          attributes:
          []
        }
      for(var i in this.rows){
        console.log(this.rows[i])
        var row ={
              name:this.rows[i].name,
              type:this.rows[i].type,
              iskey:this.rows[i].iskey,
              nullable: this.rows[i].nullable
              }
        tmp.attributes.push(row)
      }
      this.erDiagramm.addEntity(tmp)
      this.tables.push(tmp)
      this.creatingEntity="yes"
      console.log(this.tables)
      //this.render()
    },
    addRow: function()
    {
      this.rows.push({id:this.rows.length})
    },
    deleteRow: function()
    {
      this.rows.pop()
    },
    render: function()
    {
        
    var erd = shapes.erd;

var graph = new dia.Graph();

var paper = new dia.Paper({
    el: document.getElementById('paper'),
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
var createLink = function(elm1, elm2) {

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
};
paper.on('cell:unhighlight', function() {

    highlighter.remove();
});
  console.log(this.tables)
// Create shapes
for(var i in this.tables)
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
}
/*var employee = new erd.Entity({

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

var wage = new erd.WeakEntity({

    position: { x: 530, y: 200 },
    attrs: {
        text: {
            fill: '#ffffff',
            text: 'Wage',
            letterSpacing: 0,
            style: { textShadow: '1px 0 1px #333333' }
        },
        '.inner': {
            fill: '#31d0c6',
            stroke: 'none',
            points: '155,5 155,55 5,55 5,5'
        },
        '.outer': {
            fill: 'none',
            stroke: '#31d0c6',
            points: '160,0 160,60 0,60 0,0',
            filter: { name: 'dropShadow',  args: { dx: 0.5, dy: 2, blur: 2, color: '#333333' }}
        }
    }
});

var paid = new erd.IdentifyingRelationship({

    position: { x: 350, y: 190 },
    attrs: {
        text: {
            fill: '#ffffff',
            text: 'Gets paid',
            letterSpacing: 0,
            style: { textShadow: '1px 0 1px #333333' }
        },
        '.inner': {
            fill: '#7c68fd',
            stroke: 'none'
        },
        '.outer': {
            fill: 'none',
            stroke: '#7c68fd',
            filter: { name: 'dropShadow',  args: { dx: 0, dy: 2, blur: 1, color: '#333333' }}
        }
    }
});

var isa = new erd.ISA({

    position: { x: 125, y: 300 },
    attrs: {
        text: {
            text: 'ISA',
            fill: '#ffffff',
            letterSpacing: 0,
            style: { 'text-shadow': '1px 0 1px #333333' }
        },
        polygon: {
            fill: '#fdb664',
            stroke: 'none',
            filter: { name: 'dropShadow',  args: { dx: 0, dy: 2, blur: 1, color: '#333333' }}
        }
    }
});

var number = new erd.Key({

    position: { x: 10, y: 90 },
    attrs: {
        text: {
            fill: '#ffffff',
            text: 'Number',
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
});

var employeeName = new erd.Normal({

    position: { x: 75, y: 30 },
    attrs: {
        text: {
            fill: '#ffffff',
            text: 'Name',
            letterSpacing: 0,
            style: { textShadow: '1px 0 1px #333333' }
        },
        '.outer': {
            fill: '#fe8550',
            stroke: '#fe854f',
            filter: { name: 'dropShadow',  args: { dx: 0, dy: 2, blur: 2, color: '#222138' }}
        }
    }
});

var skills = new erd.Multivalued({

    position: { x: 150, y: 90 },
    attrs: {
        text: {
            fill: '#ffffff',
            text: 'Skills',
            letterSpacing: 0,
            style: { 'text-shadow': '1px 0px 1px #333333' }
        },
        '.inner': {
            fill: '#fe8550',
            stroke: 'none',
            rx: 43,
            ry: 21

        },
        '.outer': {
            fill: '#464a65',
            stroke: '#fe8550',
            filter: { name: 'dropShadow',  args: { dx: 0, dy: 2, blur: 2, color: '#222138' }}
        }
    }
});

var amount = new erd.Derived({

    position: { x: 440, y: 80 },
    attrs: {
        text: {
            fill: '#ffffff',
            text: 'Amount',
            letterSpacing: 0,
            style: { textShadow: '1px 0 1px #333333' }
        },
        '.inner': {
            fill: '#fca079',
            stroke: 'none',
            display: 'block'
        },
        '.outer': {
            fill: '#464a65',
            stroke: '#fe854f',
            'stroke-dasharray': '3,1',
            filter: { name: 'dropShadow',  args: { dx: 0, dy: 2, blur: 2, color: '#222138' }}
        }
    }
});

var uses = new erd.Relationship({

    position: { x: 300, y: 390 },
    attrs: {
        text: {
            fill: '#ffffff',
            text: 'Uses',
            letterSpacing: 0,
            style: { textShadow: '1px 0 1px #333333' }
        },
        '.outer': {
            fill: '#797d9a',
            stroke: 'none',
            filter: { name: 'dropShadow',  args: { dx: 0, dy: 2, blur: 1, color: '#333333' }}
        }
    }
});

// Create new shapes by cloning

var salesman = employee.clone().translate(0, 200).attr('text/text', 'Salesman');

var date = employeeName.clone().position(585, 80).attr('text/text', 'Date');

var car = employee.clone().position(430, 400).attr('text/text', 'Company car');

var plate = number.clone().position(405, 500).attr('text/text', 'Plate');


// Helpers
*/

/*
var createLabel = function(txt) {
    return {
        labels: [{
            position: -20,
            attrs: {
                text: { dy: -8, text: txt, fill: '#ffffff' },
                rect: { fill: 'none' }
            }
        }]
    };
};

// Add shapes to the graph

//graph.addCells([employee, salesman, wage, paid, isa, number, employeeName, skills, amount, date, plate, car, uses]);

createLink(employee, paid).set(createLabel('1'));
createLink(employee, number);
createLink(employee, employeeName);
createLink(employee, skills);
createLink(employee, isa);
createLink(isa, salesman);
createLink(salesman, uses).set(createLabel('0..1'));
createLink(car, uses).set(createLabel('1..1'));
createLink(car, plate);
createLink(wage, paid).set(createLabel('N'));
createLink(wage, amount);
createLink(wage, date);
*/this.convertSQL()
console.log("created")
    },
  convertSQL: function()
  {
    var code=""
    for(var i in this.tables)
    {
      console.log(this.tables[i])
      code+="CREATE TABLE "+this.tables[i].name+" (\n"
      for(var j in this.tables[i].attributes){
        console.log(this.tables[i].attributes)
        code+=this.tables[i][j][0].name
        code+=this.tables[i][j].type
        this.tables[i][j].iskey?code+=" PRIMARY KEY,\n":this.tables[i][j].nullable?code+=',\n':code+=" NOT NULL,\n";

      }
    }
    this.createdCode=code
  }
  },
  
}
</script>
   
<style>
  @import "./styles/App.css";
  @import "./styles/ER.css";
</style>
