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
                    PK
                  </th>
                  <th>
                    NULL
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
                  <select v-model="entity1">
                  <option v-for="table in tables" v-bind:key="table">
                  {{table}}
                  </option>
                  </select>
                </td>
                <td>
                  <select v-model="entity2">
                  <option v-for="table in tables" v-bind:key="table">
                  {{table}}
                  </option>
                  </select>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <select v-model="relation1">
                  <option disabled value=""></option>
                  <option>none</option>
                  <option>one</option>
                  <option>inherritence</option>
                  <option>aggregation</option>
                  <option>one or many</option>
                  <option>many or zero</option>
                  </select>
                </td>
                <td>
                  <select v-model="relation2">
                  <option disabled value=""></option>
                  <option>none</option>
                  <option>one</option>
                  <option>inherritence</option>
                  <option>aggregation</option>
                  <option>one or many</option>
                  <option>many or zero</option>
                  </select>
                </td>
              </tr>
            </table>
            <button v-on:click="commitRelation">Commit</button>

          </div>
          <div v-if="deletingEntity==='yes'">
           <button v-on:click="deleteEntity" >
            Delete Entity
          </button>
          </div>
          <div v-else>
            <table>
              <th>
                Select entity
              </th>
              <tr>
                <td>
                  <select v-model="delEntity">
                  <option v-for="table in tables" v-bind:key="table">
                  {{table}}
                  </option>
                  </select>
                </td>
              </tr>
            </table>
            <button v-on:click="commitDelEntity">Commit</button>
          </div>
          
        </td>
        <td>
          
          <div id="paper">

          </div>
        </td>
        <td>
          <table>
            <tr>
              <td>
                <button v-on:click="generateCode" >
                Generate SQL code
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <p style="white-space: pre-line;">
                  {{ createdCode }}
                </p>
              </td>
            </tr>
          </table>
          
          
         
        </td>
      </tr>
    </table>
    
  </div>
</template>

<script>
//import Entity from './views/Entity.vue'
import EntityRelation from "../src/core/EntityRelation"
export default {
 // components: { Entity },
  
  name: 'App',
  //mounted() {
  //},
  data:()=>
  (   
    {
      delEntity:"",
      tables:[],
      entity1:"",
      entity2:"",
      relation1:"",
      relation2:"",
      createdCode:"",
      eName:"sadasd",
      creatingEntity:"yes",
      creatingRelation:"yes",
      deletingEntity:"yes",
      rows: [{id:1,name:"",type:"",iskey:"",nullable:""},]
    }
  ),
  methods:
  {
    generateCode: function()
    {
      this.createdCode=this.erDiagramm.generateCode();
    },
    deleteEntity: function(){
      this.deletingEntity="no"
    },
    createEntity: function()
    {
      this.creatingEntity="no"
    },
    createRelation: function()
    {
      this.creatingRelation="no"
    }
    ,
    commitDelRelation: function()
    {
       this.deletingRelation="yes"
    },
    commitRelation: function()
    {
      this.erDiagramm.addRelation(this.entity1,this.entity2,this.relation1,this.relation2);
      this.creatingRelation="yes"
    },
    commitDelEntity: function()
    {
      this.erDiagramm.deleteEntity(this.delEntity)
      this.tables=this.erDiagramm.getTables()
      this.deletingEntity="yes"
    },
    commitEntity: function()
    {
      var tmp = 
      {
        name:this.eName,
        attributes:[]
      }

      for(var i in this.rows)
      {
        console.log(this.rows[i])
        var row =
        {
          name:this.rows[i].name,
          type:this.rows[i].type,
          iskey:this.rows[i].iskey,
          nullable: this.rows[i].nullable,
          fk: this.rows[i].fk
        }
        tmp.attributes.push(row)
      }

      this.erDiagramm.addEntity(tmp)
      this.tables=this.erDiagramm.getTables()
      this.creatingEntity="yes"
    },

    addRow: function()
    {
      this.rows.push({id:this.rows.length})
    },

    deleteRow: function()
    {
      this.rows.pop()
    },
  },
  mounted(){
    this.erDiagramm= new EntityRelation("paper");
  }
}
</script>
   
<style>
  @import "./styles/App.css";
  @import "./styles/ER.css";
</style>
