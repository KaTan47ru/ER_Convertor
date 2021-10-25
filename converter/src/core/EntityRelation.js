import {dia,V,g,shapes} from "jointjs"
export default
class EntityRelation{
    
    constructor(id){
        this.relationType=
        {
            "one":'M 20 0 L 20 20 M 0 10 L 30 10 z',
            "inherritence":'M 0 20 L 20 30 M 20 30 L 20 10 M 20 10 L 0 20 z',
            "aggregation": 'M 0 20 L 20 30 M 20 30 L40 20 M 40 20 L 20 10 M 20 10 L 0 20 z',
            "one or many": 'M -10 -10 L -10 -30 M 0 -20 L -20 -20 M -20 -20 L -40 -10 M -20 -20 L -40 -20 M -20 -20 L -40 -30 z',
            "one or zero": 'M -10 -20 A -10 -10 360 1 1 -30 -20 M -10 -20 A -10 -10 360 1 0 -30 -20 M -30 -20 L -50 -10 M -30 -20 L -50 -20 M -30 -20 L -50 -30 z',
            "many or zero":'M -10 -20 A -10 -10 360 1 1 -30 -20 M -10 -20 A -10 -10 360 1 0 -30 -20 M -30 -20 L -50 -20 M -40 -10 L -40 -30 z',
            "none":''
        };
        this.relations=[];
        this.id = id;
        this.tables=[];
        this.elems=[]
        this.erd = shapes.erd;
        this.graph = new dia.Graph();
        console.log(id)
        this.paper = new dia.Paper({
            el: document.getElementById(id),
            width: 695,
            height: 600,
            model: this.graph,
            linkPinning: false,
            highlighting: false,
            defaultConnectionPoint: function(line, view) {
                var element = view.model;
                return element.getConnectionPoint(line.start) || element.getBBox().center();
            }
        });

        // Custom highlighter - display an outline around each element that fits its shape.

        this.highlighter = V('path', {
            'stroke': '#e9fc03',
            'stroke-width': '2px',
            'fill': 'transparent',
            'pointer-events': 'none'
        });

        // Define a specific highligthing path for every shape.
    
        this.erd.Attribute.prototype.getHighlighterPath = function(w, h) 
        {
            return ['M', 0, h / 2, 'A', w / 2, h / 2, '0 1,0', w, h / 2, 'A', w / 2, h / 2, '0 1,0', 0, h / 2].join(' ');
        };
    
        this.erd.Entity.prototype.getHighlighterPath = function(w, h) 
        {    
            return ['M', w, 0, w, h, 0, h, 0, 0, 'z'].join(' ');
        };
    
        this.erd.Relationship.prototype.getHighlighterPath = function(w) 
        {    
            return ['M', w / 2, 0, w, w / 2, w / 2, w, 0, w / 2, 'z'].join(' ');
        };
    
        this.erd.ISA.prototype.getHighlighterPath = function(w, h) 
        {    
            return ['M', -8, 1, w + 8, 1, w / 2, h + 2, 'z'].join(' ');
        };
    
        // Define a specific connection points for every shape
    
        this.erd.Attribute.prototype.getConnectionPoint = function(referencePoint) 
        {
            // Intersection with an ellipse
            return g.Ellipse.fromRect(this.getBBox()).intersectionWithLineFromCenterToPoint(referencePoint);
        };
    
        this.erd.Entity.prototype.getConnectionPoint = function(referencePoint) 
        {
            // Intersection with a rectangle
            return this.getBBox().intersectionWithLineFromCenterToPoint(referencePoint);
        };
    
        this.erd.Relationship.prototype.getConnectionPoint = function(referencePoint) 
        {
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
    
        this.erd.ISA.prototype.getConnectionPoint = function(referencePoint) 
        {
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
        this.paper.on('cell:highlight', function(cellView) 
        {
            var padding = 5;
            var bbox = cellView.getBBox({ useModelGeometry: true }).inflate(padding);
    
            this.highlighter.translate(bbox.x, bbox.y, { absolute: true });
            this.highlighter.attr('d', cellView.model.getHighlighterPath(bbox.width, bbox.height));
    
            V(this.paper.viewport).append(this.highlighter);
        });

        this.paper.on('cell:unhighlight', function() {
            this.highlighter.remove();
        });
        
        console.log("constructed")


    }

    addEntity(entity)
    {
        this.tables.push({   
            name : entity.name,
            attributes : entity.attributes});
        
        console.log("creating table "+entity.name);
        // Creating new entity for erd
        var tmp = new this.erd.Entity(
            {
                position: { x: 100, y: 200 },
                attrs: {
                        text: {
                            fill: '#ffffff',
                            text: entity.name,
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
            }
        );
        console.log(tmp.id);
        //Creating attributes for entity
        this.graph.addCell(tmp);
        var attributesSet=[];
        for(var i in entity.attributes)
        {
            console.log(entity.attributes[i])
            if(entity.attributes[i].iskey)
            {
                let tmpAttribute = this.addKeyAttribute(entity.attributes[i].name,entity.attributes[i].type);
                this.graph.addCell(tmpAttribute);
                this.addAttributeLink(tmp,tmpAttribute);
                attributesSet.push(tmpAttribute);
            }
            else
            {
                if(entity.attributes[i].nullable)
                {
                    let tmpAttribute = this.addCommonAttribute(entity.attributes[i].name,entity.attributes[i].type);
                    this.graph.addCell(tmpAttribute);
                    this.addAttributeLink(tmp,tmpAttribute);
                    attributesSet.push(tmpAttribute);
                }
                else
                {
                    let tmpAttribute = this.addNotNullAttribute(entity.attributes[i].name,entity.attributes[i].type);
                    this.graph.addCell(tmpAttribute);
                    this.addAttributeLink(tmp,tmpAttribute);
                    attributesSet.push(tmpAttribute);
                }
            }
        }
        
        this.elems.push({name:entity.name,object:tmp,attributes:attributesSet})
    }
   
    addRelation(entity1,entity2,label1,label2)
    {
        var elem1 = this.elems.find(item=>item.name==entity1);
        var elem2 = this.elems.find(item=>item.name==entity2);
        if(elem1==-1||elem2==-1)
            return 0;
        console.log(elem1.object,elem2.object)
        this.addEntityLink(elem1.object,elem2.object,label1,label2);
        this.relations.push(
            {
                e1: this.tables.find(item=>item.name=entity1),
                e2: this.tables.find(item=>item.name=entity2),
                r1: label1,
                r2: label2
            }
        )
        return 1;

        

    }
    addAttributeLink(att1,att2)
    {
        var myLink = new dia.Link({
           
            source: { id: att1.id },
            target: { id: att2.id },
            
        });
        console.log("link")
        console.log(myLink);
        
        return myLink.addTo(this.graph);
    }
    addEntityLink(att1,att2,label1,label2)
    {
        
        console.log(label1,label2)
        var myLink = new dia.Link({
           
            source: { id: att1.id },
            target: { id: att2.id },
            
        });
        console.log(this.relationType[label1],this.relationType[label2])
        myLink.attr(
        {
            '.connection': { stroke: 'white' },
            '.marker-source': { stroke: 'white', d: this.relationType[label1] },
            '.marker-target': { stroke: 'white', d: this.relationType[label2]}
        });
        return myLink.addTo(this.graph);
    }
    addKeyAttribute(name, type)
    {
        var keyAttribute = new this.erd.Key(
            {
                position: { x: 10, y: 90 },
                attrs: {
                    text: {
                        fill: '#ffffff',
                        text: name+":"+type,
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

            }
        );
        return keyAttribute;
    }

    addNotNullAttribute(name,type)
    {
        var notNullAttribute = new this.erd.Normal(
            {
                position: { x: 75, y: 30 },
                attrs: {
                    text: {
                        fill: '#ffffff',
                        text: name+":"+type,
                        letterSpacing: 0,
                        style: { textShadow: '1px 0 1px #333333' }
                    },
                    '.outer': {
                        fill: '#8000ff',
                        stroke: '#8000ff',
                        filter: { name: 'dropShadow',  args: { dx: 0, dy: 2, blur: 2, color: '#222138' }}
                    }
                }
            }
        );
        return notNullAttribute;
    }

    addCommonAttribute(name,type)
    {
        var commonAttribute = new this.erd.Normal(
            {
                position: { x: 75, y: 30 },
                attrs: {
                    text: {
                        fill: '#ffffff',
                        text: name+":"+type,
                        letterSpacing: 0,
                        style: { textShadow: '1px 0 1px #333333' }
                    },
                    '.outer': {
                        fill: '#fe8550',
                        stroke: '#fe854f',
                        filter: { name: 'dropShadow',  args: { dx: 0, dy: 2, blur: 2, color: '#222138' }}
                    }
                }
            }
        );
        return commonAttribute;
    }

    deleteEntity(entity)
    {
        var elem = this.elems.find(item=>item.name==entity);
        if(elem==-1)
            return 0;
        console.log(elem)
        console.log("brfore")
        console.log(this.elems.length)
        this.graph.removeCells(elem.object)
        this.graph.removeCells(elem.attributes)
        this.elems.splice(this.elems.indexOf(elem),1)

    }
    
    generateCode()
    {
        console.log(this.relations)
        var result ="";
        for( var i in this.tables)
        {
            result+="CEATE TABLE "+this.tables[i].name+"(\n";
            console.log("elems")
            console.log(this.tables[i].attributes)
            for (var j in this.tables[i].attributes)
            {
                result+=this.tables[i].attributes[j].name+" "+this.tables[i].attributes[j].type+" "
                if(this.tables[i].attributes[j].nullable==true)
                    result+=",\n";
                else
                    result+="NOT NULL,\n";
            }
            result+=");\n";
        }
        return result;
    }

    getTables(){
        let result=[];
        for(var i in this.elems){
            result.push(this.elems[i].name);
        }
        return result;
    }
    

    
}