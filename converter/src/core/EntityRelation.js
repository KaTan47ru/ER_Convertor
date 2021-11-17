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
        this.paper = new dia.Paper({
            el: document.getElementById(id),
            width: 1000,
            height: 1000,
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
        var normalizedTables=[]
        var result ="";
        result+="--Creating tables:\n";
        result+=this.createTablesCode();
        result+="--Adding FK constraints:\n";
        result+=this.createFKCode(normalizedTables)
        result+="--Adding PK constraints:\n";
        result+=this.createPKCode(normalizedTables);
        return result;
    }
    createTablesCode()
    {
        let tablesCode="";
        for( let i in this.tables)
        {
            tablesCode+="CEATE TABLE "+this.tables[i].name+"(\n";
            
            for (var j in this.tables[i].attributes)
            {
                tablesCode+=this.tables[i].attributes[j].name+" "+this.tables[i].attributes[j].type+" "
                if(this.tables[i].attributes[j].nullable!=true)
                    tablesCode+="NOT NULL";
                if(j<this.tables[i].attributes.length-1)
                    tablesCode+=",\n"
                else 
                    tablesCode+="\n"
                
            }
            tablesCode+=");\n";
        }

        return tablesCode;
    }
    createPKCode(normalizedTables)
    {
        let PKcode="";
        for(let i in normalizedTables)
        {
            var keyAttributes=[];
            for(let j in normalizedTables[i].attributes)
            {
                if(normalizedTables[i].attributes[j].iskey==true)
                {
                    keyAttributes.push(normalizedTables[i].attributes[j].name);
                }
            }
            if(keyAttributes.length!=0)
            {
                PKcode+=
                "ALTER TABLE "+normalizedTables[i].name+
                " ADD CONSTRAINT PK_"+normalizedTables[i].name+
                " PRIMARY KEY ("+keyAttributes.join(',')+");\n"
            }
        }
        return PKcode;
    }
    createFKCode(normalizedTables)
    {
        let FKcode="";
        for(let i in this.tables)
        {
            normalizedTables.push({name:this.tables[i].name,attributes:Object.assign([],this.tables[i].attributes)});
        }
        
        // aggregation
        for(let i in this.relations)
        {
            if(this.relations[i].r1 == 'aggregation')
            {
                let elem_1 = normalizedTables.find(item=>item.name==this.relations[i].e1.name);
                let elem_2 = normalizedTables.find(item=>item.name==this.relations[i].e2.name);
                let keyParts=[];
                let nativeKey=[];
                for(let j in elem_2.attributes)
                {
                    if(elem_2.attributes[j].iskey==true)
                    {
                        keyParts.push(elem_2.attributes[j].name+elem_2.attributes[j].name)
                        nativeKey.push(elem_2.attributes[j].name)
                        elem_1.attributes.push(elem_2.attributes[j])
                        FKcode+=
                        "ALTER TABLE "+ this.relations[i].e1.name +
                        " ADD " +elem_2.attributes[j].name+elem_2.attributes[j].name
                        +" "+ elem_2.attributes[j].type+" NOT NULL;\n";
                    }
                }
                FKcode+=
                "ALTER TABLE "+elem_1.name+
                " ADD FOREIGN KEY ("+keyParts.join(',')+
                ") REFERENCES "+this.relations[i].e2.name+"("+nativeKey.join(',')+");\n"
            }
            if(this.relations[i].r2 == 'aggregation')
            {
                let elem_2 = normalizedTables.find(item=>item.name==this.relations[i].e2.name);
                let elem_1 = normalizedTables.find(item=>item.name==this.relations[i].e1.name);
                let keyParts=[];
                let nativeKey=[];
                for(let j in elem_1.attributes)
                {
                    if(elem_1.attributes[j].iskey==true)
                    {
                        keyParts.push(elem_1.attributes[j].name+elem_1.attributes[j].name)
                        nativeKey.push(elem_1.attributes[j].name)
                        elem_2.attributes.push(elem_1.attributes[j])
                        FKcode+=
                        "ALTER TABLE "+ this.relations[i].e2.name +
                        " ADD " +elem_1.attributes[j].name+elem_1.attributes[j].name
                        +" "+ elem_1.attributes[j].type+" NOT NULL;\n";
                    }
                }
                FKcode+=
                "ALTER TABLE "+elem_2.name+
                " ADD FOREIGN KEY ("+keyParts.join(',')+
                ") REFERENCES "+this.relations[i].e1.name+"("+nativeKey.join(',')+");\n"
            }
        }
        // inherritence
        for(let i in this.relations)
        {
            if(this.relations[i].r1 == 'inherritence')
            {
                let elem_2 = normalizedTables.find(item=>item.name==this.relations[i].e2.name);
                let elem_1 = normalizedTables.find(item=>item.name==this.relations[i].e1.name);
                let keyParts=[];
                let nativeKey=[];
                for(let j in elem_1.attributes)
                {
                    if(elem_1.attributes[j].iskey==true)
                    {
                        keyParts.push(elem_1.attributes[j].name+elem_1.attributes[j].name)
                        nativeKey.push(elem_1.attributes[j].name)
                        elem_2.attributes.push(elem_1.attributes[j])
                        FKcode+=
                        "ALTER TABLE "+ this.relations[i].e2.name +
                        " ADD " +elem_1.attributes[j].name+elem_1.attributes[j].name
                        +" "+ elem_1.attributes[j].type+" NOT NULL;\n";
                    }
                }
                FKcode+=
                "ALTER TABLE "+elem_2.name+
                " ADD FOREIGN KEY ("+keyParts.join(',')+
                ") REFERENCES "+this.relations[i].e1.name+"("+nativeKey.join(',')+");\n"
            }
            if(this.relations[i].r2 == 'inherritence')
            {
                let elem_1 = normalizedTables.find(item=>item.name==this.relations[i].e1.name);
                let elem_2 = normalizedTables.find(item=>item.name==this.relations[i].e2.name);
                let keyParts=[];
                let nativeKey=[];
                for(let j in elem_2.attributes)
                {
                    if(elem_2.attributes[j].iskey==true)
                    {
                        keyParts.push(elem_2.attributes[j].name+elem_2.attributes[j].name)
                        nativeKey.push(elem_2.attributes[j].name)
                        elem_1.attributes.push(elem_2.attributes[j])
                        FKcode+=
                        "ALTER TABLE "+ this.relations[i].e1.name +
                        " ADD " +elem_2.attributes[j].name+elem_2.attributes[j].name
                        +" "+ elem_2.attributes[j].type+" NOT NULL;\n";
                    }
                }
                FKcode+=
                "ALTER TABLE "+elem_1.name+
                " ADD FOREIGN KEY ("+keyParts.join(',')+
                ") REFERENCES "+this.relations[i].e2.name+"("+nativeKey.join(',')+");\n"
            }
        }
        // many
        for(let i in this.relations)
        {
            if(this.relations[i].r1 == 'many or zero'||this.relations[i].r2 == 'many or zero')
            {   
                // 1 - M
                if(this.relations[i].r1 == 'one')
                {
                    let elem_2 = normalizedTables.find(item=>item.name==this.relations[i].e2.name);
                    let elem_1 = normalizedTables.find(item=>item.name==this.relations[i].e1.name);
                    let keyParts=[];
                    let nativeKey=[];
                    for(let j in elem_1.attributes)
                    {
                        if(elem_1.attributes[j].iskey==true)
                        {
                            keyParts.push(elem_1.attributes[j].name+elem_1.attributes[j].name)
                            nativeKey.push(elem_1.attributes[j].name)
                            FKcode+=
                            "ALTER TABLE "+ this.relations[i].e2.name +
                            " ADD " +elem_1.attributes[j].name+elem_1.attributes[j].name
                            +" "+ elem_1.attributes[j].type+" NOT NULL;\n";
                        }
                    }
                    FKcode+=
                    "ALTER TABLE "+elem_2.name+
                    " ADD FOREIGN KEY ("+keyParts.join(',')+
                    ") REFERENCES "+this.relations[i].e1.name+"("+nativeKey.join(',')+");\n"
                }
                // M - 1
                else if(this.relations[i].r2 == 'one')
                {
                    let elem_1 = normalizedTables.find(item=>item.name==this.relations[i].e1.name);
                    let elem_2 = normalizedTables.find(item=>item.name==this.relations[i].e2.name);
                    let keyParts=[];
                    let nativeKey=[];
                    for(let j in elem_2.attributes)
                    {
                        if(elem_2.attributes[j].iskey==true)
                        {
                            keyParts.push(elem_2.attributes[j].name+elem_2.attributes[j].name)
                            nativeKey.push(elem_2.attributes[j].name)
                            FKcode+=
                            "ALTER TABLE "+ this.relations[i].e1.name +
                            " ADD " +elem_2.attributes[j].name+elem_2.attributes[j].name
                            +" "+ elem_2.attributes[j].type+" NOT NULL;\n";
                        }
                    }
                    FKcode+=
                    "ALTER TABLE "+elem_1.name+
                    " ADD FOREIGN KEY ("+keyParts.join(',')+
                    ") REFERENCES "+this.relations[i].e2.name+"("+nativeKey.join(',')+");\n"
                }
                // M -M
                else
                {
                    let elem_2 = normalizedTables.find(item=>item.name==this.relations[i].e2.name);
                    let elem_1 = normalizedTables.find(item=>item.name==this.relations[i].e1.name);
                    FKcode+="CREATE TABLE "+elem_1.name+elem_2.name
                    +"(\n);\n";
                    let key1Parts=[];
                    let key2Parts=[];
                    let newAttibutes=[];
                    for(let j in elem_1.attributes)
                    {
                        if(elem_1.attributes[j].iskey==true)
                        {
                            key1Parts.push(elem_1.attributes[j].name)
                            newAttibutes.push(elem_1.attributes[j])
                            FKcode+=
                            "ALTER TABLE "+ elem_1.name+elem_2.name +
                            " ADD " +elem_1.attributes[j].name
                            +" "+ elem_1.attributes[j].type+" NOT NULL;\n";
                        }
                    }
                    for(let j in elem_2.attributes)
                    {
                        if(elem_2.attributes[j].iskey==true)
                        {
                            key2Parts.push(elem_2.attributes[j].name)
                            newAttibutes.push(elem_2.attributes[j])
                            FKcode+=
                            "ALTER TABLE "+ elem_1.name+elem_2.name+
                            " ADD " +elem_2.attributes[j].name
                            +" "+ elem_2.attributes[j].type+" NOT NULL;\n";
                        }
                    }
                    FKcode+=
                    "ALTER TABLE "+elem_1.name+elem_2.name+
                    " ADD FOREIGN KEY ("+key1Parts.join(',')+
                    ") REFERENCES "+this.relations[i].e1.name+"("+key1Parts.join(',')+");\n"
                    FKcode+=
                    "ALTER TABLE "+elem_1.name+elem_2.name+
                    " ADD FOREIGN KEY ("+key2Parts.join(',')+
                    ") REFERENCES "+this.relations[i].e2.name+"("+key2Parts.join(',')+");\n"
                    normalizedTables.push({name: elem_1.name+elem_2.name,attributes: newAttibutes})
                }
            }
            
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