<template>
  <div>
    <el-form class="search-filters-form" label-width="80px" :model="searchFilters" status-icon>
        <el-row :gutter="20" type="flex" justify="center">
          <el-col :span="6">
           <el-form-item label="承运商:">
              <el-select v-model="searchFilters.carriesID" @change="startSearch" placeholder="请选择">
                <el-option v-for="(item,key) in carriesSelect" :key="key" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="液厂:">
              <el-select v-model="searchFilters.fulidID" @change="startSearch" placeholder="请选择">
                <el-option v-for="(item,key) in fulidSelect" :key="key" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
    </el-form>
    <el-row> 
      <el-col :span="20" :offset="2" v-for="(echarItem,key,index) in echarData" :id="'eachrLine'+index" style="height:500px;margin-top:50px;"></el-col>
    </el-row>
  </div>

</template>
<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      echarData:{},
      myChart:[],
      searchFilters:{
        carriesID:"",
        fulidID:""
      },
      carriesSelect:[],
      fulidSelect:[]
    }
  },

  mounted(){
    
  },

  methods: {
    startSearch:function(){
      this.echarData={};
      this.getdrawLineData();
    },
    handleEcharData:function(){
      let num=0;
      this.myChart=[];
      for(let carries in this.echarData){
        let dom = document.getElementById('eachrLine'+num);
        this.myChart[num] = this.$echarts.init(dom);
        let opt=this.getOpt(this.echarData[carries],carries);
        this.myChart[num].setOption(opt);
        num++;
      }
    },
    getOpt:function(carriesItem,title){
      let seriesData=[];
      let xarry=[];
      let legend=[];
      for(let item in carriesItem){
        if(item=='xarry'){
          xarry=carriesItem[item];
        }else{
          let optSe={};
          optSe={
            name:item,
            type:'line',
            stack: '',
            data:carriesItem[item]
          }
          legend.push(item);
          seriesData.push(optSe);
        }
      }
      let obj = {
        toolbox: {
            show: true,
            feature: {
                
            }
        },
        grid: {
          left: '3%',
          right: '3%',
          bottom: '3%',
          containLabel: true
        },
        title: {
          text: title
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xarry
        },
        // legend:{
        //   data:legend,
        //   y:'bottom',
        //   x:"left",
        //   itemWidth:20,
        // },
        yAxis: {
          type: 'value',
        },
        series:seriesData 
      }
      return obj;
    },
    getdrawLineData:function(){
      this.$$http("getdrawLineData",{carrier_name:this.searchFilters.carriesID,fluid_name:this.searchFilters.fulidID}).then(results=>{
        if(results.data.code==0){
          this.echarData=results.data.msg;
          setTimeout(()=>{
            this.handleEcharData();
          },100)
        }
      });
      // let echarData={
      //     "code": 0,
      //     "msg": {
      //       "如东_廊坊市嘉运物流有限公司": {
      //         "如东_廊坊市嘉运物流有限公司_新奥集团股份有限公司": [
      //           "0",
      //           "150.0",
      //           "179.0",
      //           "85.0",
      //           "82.0",
      //           "75.0",
      //           "73.0",
      //           "140.0",
      //           "70.0"
      //         ],
      //         "如东运物流有限公司_新奥集团股份有限公司": [
      //           "0",
      //           "10.0",
      //           "220.0",
      //           "69.0",
      //           "45.0",
      //           "275.0",
      //           "73.0",
      //           "250.0",
      //           "900.0"
      //         ],
      //         "公司_新奥集团股份运物流有限公司_新奥集团股份有限公司有限公司": [
      //           "0",
      //           "150.0",
      //           "179.0",
      //           "85.0",
      //           "182.0",
      //           "175.0",
      //           "73.0",
      //           "160.0",
      //           "250.0"
      //         ],
      //         "公司_新奥集团股份运有限公司_新奥集团股份有限公司有限公司": [
      //           "0",
      //           "150.0",
      //           "179.0",
      //           "85.0",
      //           "182.0",
      //           "175.0",
      //           "73.0",
      //           "160.0",
      //           "250.0"
      //         ],
      //         xAxisData:['0','100','200','300','400','500','600','700','900']
      //       },
      //       "如东_龙口市胜通物流有限公司": {
      //         "如东_龙口市胜通物流有限公司_龙口胜通能源有限公司": [
      //           "0",
      //           "130.0",
      //           "90.0",
      //           "80.0",
      //           "75.0",
      //           "73.0",
      //           "70.0",
      //           "69.0",
      //           "138.0",
      //           "65.99999999999999",
      //           "330.0"
      //         ],
      //         xAxisData:['0','100','200','300','400','500','600','700','900','1000','1500']
      //       },
      //       "刘测测": {
      //         "刘测": [
      //           "0",
      //           "130.0",
      //           "90.0",
      //           "80.0",
      //           "75.0",
      //           "73.0",
      //           "70.0",
      //           "69.0",
      //           "138.0",
      //           "65.99999999999999",
      //           "330.0"
      //         ],
      //         xAxisData:['0','100','200','300','400','500','600','700','900','1000','1500']
      //       }
      //     }
      //   }
        
      },
      getData:function(){
        let getCarriesFuild=this.$$http('getCarriesFuild', {});
        Promise.all([getCarriesFuild]).then(results => {
          if(results[0].data.code==0){
            this.carriesSelect=['全部'].concat(results[0].data.msg.carrier);
            this.fulidSelect=['全部'].concat(results[0].data.msg.fluid);
            this.searchFilters.carriesID="龙口市胜通物流有限公司";
            this.getdrawLineData();
          }
        });
        
      }
  },
  created(){
    this.getData();
    
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
