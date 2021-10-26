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
            "many or zero": 'M -10 -20 A -10 -10 360 1 1 -30 -20 M -10 -20 A -10 -10 360 1 0 -30 -20 M -30 -20 L -50 -10 M -30 -20 L -50 -20 M -30 -20 L -50 -30 z',
            "one or zero":'M -10 -20 A -10 -10 360 1 1 -30 -20 M -10 -20 A -10 -10 360 1 0 -30 -20 M -30 -20 L -50 -20 M -40 -10 L -40 -30 z',
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
        
        


    }

    addEntity(entity)
    {
        this.tables.push({   
            name : entity.name,
            attributes : entity.attributes});
            
        var tmp = new this.erd.Entity(
            {
                position: { x: 100, y: 200 },
                attrs: {
                        text: {
                            fill: '#909090',
                            text: entity.name,
                            letterSpacing: 0,
                        },
                        '.outer': {
                            fill: '#1C2329',
                            stroke: '#FA8525',
                             },
                        '.inner': {
                            fill: '#FA8525',
                            stroke: 'none',
                            }
                }
            }
        );
        
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

        this.addEntityLink(elem1.object,elem2.object,label1,label2);

        this.relations.push(
            {
                e1: this.tables.find(item=>item.name==entity1),
                e2: this.tables.find(item=>item.name==entity2),
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
        
        var myLink = new dia.Link({
           
            source: { id: att1.id },
            target: { id: att2.id },
            
        });
        
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
                        fill: '#909090',
                        text: "PK: "+name+":"+type,
                        letterSpacing: 0,
                    },
                    '.outer': {
                        fill: '#1C2329',
                        stroke: '#FA8525',
                        
                    },
                    '.inner': {
                        fill: '#FA8525',
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
                        fill: '#909090',
                        text: name+":"+type+" •",
                        letterSpacing: 0,
                    },
                    '.outer': {
                        fill: '#1C2329',
                        stroke: '#FA8525',
                        
                    },
                    '.inner': {
                        fill: '#FA8525',
                        stroke: 'none'
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
                        fill: '#909090',
                        text: name+":"+type+" о",
                        letterSpacing: 0,
                    },
                    '.outer': {
                        fill: '#1C2329',
                        stroke: '#FA8525',
                        
                    },
                    '.inner': {
                        fill: '#FA8525',
                        stroke: 'none'
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
        this.graph.removeCells(elem.object);
        this.graph.removeCells(elem.attributes);
        this.elems.splice(this.elems.indexOf(elem),1);

    }
    
    generateCode()
    {
        console.log(this.relations)
        var result ="";
        result+="--Creating tables:\n";
        result+=this.createTablesCode();
        result+="--Adding PK constraints:\n";
        result+=this.createPKCode();
        result+="--Adding FK constraints:\n";
        result+=this.createFKCode()
        
        return result;
    }
    createTablesCode(){
        let tablesCode="";
        for( let i in this.tables)
        {
            tablesCode+="CEATE TABLE "+this.tables[i].name+"(\n";
            
            for (var j in this.tables[i].attributes)
            {
                tablesCode+=this.tables[i].attributes[j].name+" "+this.tables[i].attributes[j].type+" "
                if(this.tables[i].attributes[j].nullable==true)
                    tablesCode+=",\n";
                else
                    tablesCode+="NOT NULL,\n";
            }
            tablesCode+=");\n";
        }

        return tablesCode;
    }
    createPKCode()
    {
        let PKcode="";
        for(let i in this.tables)
        {
            var keyAttributes=[];
            for(let j in this.tables[i].attributes)
            {
                if(this.tables[i].attributes[j].iskey==true)
                {
                    keyAttributes.push(this.tables[i].attributes[j].name);
                }
            }
            if(keyAttributes.length!=0)
            {
                PKcode+=
                "ALTER TABLE "+this.tables[i].name+
                " ADD CONSTRAINT PK_"+this.tables[i].name+
                " PRIMARY KEY ("+keyAttributes.join(',')+");\n"
            }
        }
        return PKcode;
    }
    createFKCode()
    {
        let FKcode="";
        for(let i in this.relations)
        {
            let usedR2FK=[]
            let usedR1FK=[]
            //inherritence
            if(this.relations[i].r1=='inherritence')
            {
                let r1PK=[];
                let r2FK=[];
                for(let j in this.relations[i].e1.attributes)
                {
                    if(this.relations[i].e1.attributes[j].iskey==true)
                    {
                        r1PK.push(this.relations[i].e1.attributes[j].name);
                    }
                    for(let k in this.relations[i].e2.attributes)
                    {
                        if( this.relations[i].e1.attributes[j].type==this.relations[i].e2.attributes[k].type
                            && usedR2FK.find(item=>item==this.relations[i].e2.attributes[k].name==-1))
                            {
                                r2FK.push(this.relations[i].e2.attributes[k].name);
                                usedR2FK.push(this.relations[i].e2.attributes[k].name)
                            }
                    }
                }

                FKcode+="ALTER TABLE "+this.relations[i].r2.name+
                        " ADD FOREIGN KEY ( "+r2FK.join(',')+") "+
                        "REFERENCES "+this.relations[i].r1.name+
                        " ("+r1PK.join(',')+") NOT NULL;\n";
                continue;
            }
            if(this.relations[i].r2=='inherritence')
            {
                let r2PK=[];
                let r1FK=[];
                for(let j in this.relations[i].e2.attributes)
                {
                    if(this.relations[i].e2.attributes[j].iskey==true)
                    {
                        r2PK.push(this.relations[i].e2.attributes[j].name);
                    }
                    for(let k in this.relations[i].e1.attributes)
                    {
                        if( this.relations[i].e2.attributes[j].type==this.relations[i].e1.attributes[k].type
                            && usedR1FK.find(item=>item==this.relations[i].e1.attributes[k].name==-1))
                            {
                                r1FK.push(this.relations[i].e1.attributes[k].name);
                                usedR1FK.push(this.relations[i].e1.attributes[k].name)
                            }
                    }
                }

                FKcode+="ALTER TABLE "+this.relations[i].r1.name+
                        " ADD FOREIGN KEY ( "+r1FK.join(',')+") "+
                        "REFERENCES "+this.relations[i].r2.name+
                        " ("+r2PK.join(',')+") NOT NULL;\n";
                continue;
            }
            //aggregation

            //many*-many*
            if((this.relations[i].r1=='many or zero'||this.relations[i].r1=='one or many')
                &&(this.relations[i].r2=='many or zero'||this.relations[i].r2=='one or many'))
            {
                    console.log("ostanovilsya tut")
            }
            //many-or-zero-one
            if(this.relations[i].r1=='many or zero')
            {
                let r1PK=[];
                let r2FK=[];
                for(let j in this.relations[i].e1.attributes)
                {
                    if(this.relations[i].e1.attributes[j].iskey==true)
                    {
                        r1PK.push(this.relations[i].e1.attributes[j].name);
                    }
                    for(let k in this.relations[i].e2.attributes)
                    {
                        if( this.relations[i].e1.attributes[j].type==this.relations[i].e2.attributes[k].type
                            && usedR2FK.find(item=>item==this.relations[i].e2.attributes[k].name==-1))
                            {
                                r2FK.push(this.relations[i].e2.attributes[k].name);
                                usedR2FK.push(this.relations[i].e2.attributes[k].name)
                            }
                    }
                }
                FKcode+="ALTER TABLE "+this.relations[i].r2.name+
                        " ADD FOREIGN KEY ( "+r2FK.join(',')+") "+
                        "REFERENCES "+this.relations[i].r1.name+
                        " ("+r1PK.join(',')+");\n";
            }
            if(this.relations[i].r2=='many or zero')
            {
                let r2PK=[];
                let r1FK=[];
                for(let j in this.relations[i].e2.attributes)
                {
                    if(this.relations[i].e2.attributes[j].iskey==true)
                    {
                        r2PK.push(this.relations[i].e2.attributes[j].name);
                    }
                    for(let k in this.relations[i].e1.attributes)
                    {
                        if( this.relations[i].e2.attributes[j].type==this.relations[i].e1.attributes[k].type
                            && usedR1FK.find(item=>item==this.relations[i].e1.attributes[k].name==-1))
                            {
                                r1FK.push(this.relations[i].e1.attributes[k].name);
                                usedR1FK.push(this.relations[i].e1.attributes[k].name)
                            }
                    }
                }

                FKcode+="ALTER TABLE "+this.relations[i].r1.name+
                        " ADD FOREIGN KEY ( "+r1FK.join(',')+") "+
                        "REFERENCES "+this.relations[i].r2.name+
                        " ("+r2PK.join(',')+");\n";
            }
            //many-one
            if(this.relations[i].r1=='one or many')
            {
                let r1PK=[];
                let r2FK=[];
                for(let j in this.relations[i].e1.attributes)
                {
                    if(this.relations[i].e1.attributes[j].iskey==true)
                    {
                        r1PK.push(this.relations[i].e1.attributes[j].name);
                    }
                    for(let k in this.relations[i].e2.attributes)
                    {
                        if( this.relations[i].e1.attributes[j].type==this.relations[i].e2.attributes[k].type
                            && usedR2FK.find(item=>item==this.relations[i].e2.attributes[k].name==-1))
                            {
                                r2FK.push(this.relations[i].e2.attributes[k].name);
                                usedR2FK.push(this.relations[i].e2.attributes[k].name)
                            }
                    }
                }
                FKcode+="ALTER TABLE "+this.relations[i].r2.name+
                        " ADD FOREIGN KEY ( "+r2FK.join(',')+") "+
                        "REFERENCES "+this.relations[i].r1.name+
                        " ("+r1PK.join(',')+") NOT NULL;\n";
            }
            if(this.relations[i].r2=='one or many')
            {
                let r2PK=[];
                let r1FK=[];
                for(let j in this.relations[i].e2.attributes)
                {
                    if(this.relations[i].e2.attributes[j].iskey==true)
                    {
                        r2PK.push(this.relations[i].e2.attributes[j].name);
                    }
                    for(let k in this.relations[i].e1.attributes)
                    {
                        if( this.relations[i].e2.attributes[j].type==this.relations[i].e1.attributes[k].type
                            && usedR1FK.find(item=>item==this.relations[i].e1.attributes[k].name==-1))
                            {
                                r1FK.push(this.relations[i].e1.attributes[k].name);
                                usedR1FK.push(this.relations[i].e1.attributes[k].name)
                            }
                    }
                }

                FKcode+="ALTER TABLE "+this.relations[i].r1.name+
                        " ADD FOREIGN KEY ( "+r1FK.join(',')+") "+
                        "REFERENCES "+this.relations[i].r2.name+
                        " ("+r2PK.join(',')+") NOT NULL;\n";
            }

            // {var elem = this.elems.find(item=>item.name==entity);
            //     e1: this.tables.find(item=>item.name==entity1),
            //     e2: this.tables.find(item=>item.name==entity2),
            //     r1: label1,
            //     r2: label2
            //             // }
            //             ALTER TABLE Orders
            // ADD FOREIGN KEY (PersonID) REFERENCES Persons(PersonID);
        }
        return FKcode;
    }
    getTables(){
        let result=[];
        for(var i in this.elems){
            result.push(this.elems[i].name);
        }
        return result;
    }
    

    
}