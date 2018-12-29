<template>
  <div>
    <div class="tab-screen overview">
      <el-form class="search-filters-form" label-width="80px" :model="searchFilters" status-icon>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="液厂:">
              <el-select style="width:100%" v-model="searchFilters.fluid" multiple clearable placeholder="请选择">
                <el-option v-for="(item,key) in fluidSelectList" :key="key" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="站点:">
              <el-select style="width:100%" v-model="searchFilters.site" multiple clearable placeholder="请选择">
                <el-option v-for="(item,key) in siteSelectList" :key="key" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <el-button type="primary" :isDisabled="searchBtn.loading" :isLoading="searchBtn.loading" @click="startSearch">搜索</el-button>
          </el-col>
        </el-row>
      </el-form>
      <div class="map-loading" v-loading="pageLoading"></div>
    </div>
    <div id="overview-container" class="overview-container"></div>
  </div>
</template>
<script>
export default {
  name: 'standardOverview',
  data() {
    return {
      map: '',
      layer: '',
      pageLoading: '',
      resultsData: '',
      infoWin: '',
      tableDom: '',
      fluidList: [],
      fluidLayer: '',
      siteList: [],
      siteLayer: '',
      searchFilters: {
        fluid: '',
        site: '',
      },
      fluidSelectList: [],
      siteSelectList: [],
      searchBtn: {
        loading: false,
      }

    }
  },
  methods: {
    getFluidAndSiteList() {

      this.$$http('loadlist').then(results => {
        if (results.data && results.data.code == 0) {
          this.fluidSelectList = results.data.data.fluids;
          this.siteSelectList = results.data.data.stations;
        }
      })

    },

    initMap() {
      this.map = Loca.create('overview-container', {
        mapStyle: 'amap://styles/midnight',
        zoom: 4
      });

      this.layer = Loca.visualLayer({
        // 配置 selectStyle 前先开启事件开关，否则无法触发鼠标事件。
        eventSupport: true,
        container: this.map,
        blendMode: 'lighter',
        type: 'line',
        shape: 'line',
        fitView: true,
      });

      this.fluidLayer = Loca.visualLayer({
        container: this.map,
        blendMode: 'lighter',
        type: 'point',
        shape: 'circle'
      });

      this.siteLayer = Loca.visualLayer({
        container: this.map,
        blendMode: 'lighter',
        type: 'point',
        shape: 'circle'
      });

      this.fluidLayer.setOptions({
        style: {
          // 默认半径单位为像素
          radius: 2,
          fill: '#0606f5',
          lineWidth: 0.5,
          stroke: '#0606f5',
          opacity: 1,
        }
      });

      this.siteLayer.setOptions({
        style: {
          // 默认半径单位为像素
          radius: 1,
          fill: '#f90d4f',
          lineWidth: 1,
          stroke: '#f90d4f',
          opacity: 0.8,
        }
      });

      this.layer.on('mousemove', (ev) => {
        // 事件类型
        const rawData = ev.rawData;
        const routeName = `${rawData.fluid_name}-${rawData.station_name}`;
        const fluidAddress = rawData.fluid_address;
        const stationName = rawData.station_name;
        const originalEvent = ev.originalEvent;

        this.openInfoWin(this.map.getMap(), originalEvent, {
          '路线': routeName,
          '液厂位置': fluidAddress,
          '站点位置': stationName,
        });

      });

      this.layer.on('mouseleave', (ev) => {
        this.closeInfoWin();
      });

      this.layer.on('click', (ev) => {
        // 事件类型
        const rowData = ev.rawData;

        /*this.$router.push({
          path: "/dataAnalysis/routeManage/routePlaybackOfStandard",
          query: { fluidName: rowData.fluid_name, siteName: rowData.station_name, planId: rowData.planid }
        });*/
        /*window.open(`/#/dataAnalysis/routeManage/routePlaybackOfStandard?fluidName=${rowData.fluid_name}&siteName=${rowData.station_name}&planId=${rowData.planid}`);*/

      });

      this.layer.setOptions({
        style: {
          lineWidth: 1,
          curveness: 0.2,
          stroke: 'rgba(49, 80, 189, 0.3)'
        },
        // 样式改变条件为 mouseenter 及 mouseleave，没有设置的属性会继承 style 中的配置
        selectStyle: {
          lineWidth: 3,
          stroke: 'rgba(49, 80, 189, 0.8)'
        }
      });

    },
    openInfoWin(map, event, content) {
      if (!this.infoWin) {
        this.infoWin = new AMap.InfoWindow({
          isCustom: true, //使用自定义窗体
          offset: new AMap.Pixel(130, 100)
        });
      }

      var x = event.offsetX;
      var y = event.offsetY;
      var lngLat = map.containerToLngLat(new AMap.Pixel(x, y));

      if (!this.tableDom) {
        let infoDom = document.createElement('div');
        infoDom.className = 'overview-info';
        this.tableDom = document.createElement('table');
        infoDom.appendChild(this.tableDom);
        this.infoWin.setContent(infoDom);
      }

      var trStr = '';

      for (var name in content) {
        var val = content[name];
        trStr +=
          '<tr>' +
          '<td style="color:#fff;font-size:14px;"> ' + name + '</td>' +
          '<td>&nbsp;</td>' +
          '<td style="color:#fff;font-size:14px;">' + val + '</td>' +
          '</tr>'
      }

      this.tableDom.innerHTML = trStr;
      this.infoWin.open(map, lngLat);
    },

    closeInfoWin() {
      if (this.infoWin) {
        this.infoWin.close();
      }
    },
    getData() {
      return new Promise((resolve, reject) => {
        this.pageLoading = true;

        this.fluidList = [];
        this.siteList = [];

        this.$$http('loadAllTrip', {
          fluid_name: this.searchFilters.fluid,
          station_name: this.searchFilters.site,
        }).then(results => {
          this.resultsData = results.data.data;
          if (!this.resultsData.length) {
            this.$message.success('无路线');
          }
          this.resultsData = this.resultsData.map(item => {
            this.fluidList.push({
              line: item.coord.line[0],
            });
            this.siteList.push({
              line: item.coord.line[1],
            });
            return item.coord;
          })
          resolve(results);
        }).catch(err => {
          this.pageLoading = false;
          reject(err);
        })
      })
    },
    renderLayer() {
      this.layer.setData(this.resultsData, {
        lnglat: 'line'
      });
      this.fluidLayer.setData(this.fluidList, {
        lnglat: 'line'
      });
      this.siteLayer.setData(this.siteList, {
        lnglat: 'line'
      });
      if (this.searchFilters.fluid.length || this.searchFilters.site.length) {
        this.layer.setOptions({
          style: {
            lineWidth: 2,
            curveness: 0.2,
            stroke: 'rgba(49, 80, 189, 0.3)'
          },
          // 样式改变条件为 mouseenter 及 mouseleave，没有设置的属性会继承 style 中的配置
          selectStyle: {
            lineWidth: 4,
            stroke: 'rgba(49, 80, 189, 1)'
          }
        });
      } else {
        this.layer.setOptions({
          style: {
            lineWidth: 1,
            curveness: 0.2,
            stroke: function(data) {
              if (data.value.distance <= 500) {
                return 'rgba(49, 80, 189, 0.3)'
              } else {
                return 'rgba(235, 18, 18, 0.3)'
              }
            }
          },
          // 样式改变条件为 mouseenter 及 mouseleave，没有设置的属性会继承 style 中的配置
          selectStyle: {
            lineWidth: 3,
            stroke: 'rgba(49, 80, 189, 0.8)'
          }
        });
      }
      this.layer.render();
      this.fluidLayer.render();
      this.siteLayer.render();

    },
    startSearch() {
      this.searchBtn.loading = true;
      this.getData().then(() => {
        this.pageLoading = false;
        this.renderLayer();
        this.searchBtn.loading = false;
      })
    },
  },
  created() {
    this.getFluidAndSiteList();
    this.getData().then(() => {
      setTimeout(() => {
        this.pageLoading = false;
        this.initMap();
        this.renderLayer();
      }, 500)
    });
  }
}

</script>
<style scoped>
#overview-container {
  width: 100%;
  height: 800px;
}

.overview {
  .el-select {
    width: 100%;
  }
}

.nav-tab .tab-screen {
  padding: 10px 20px;
  border: 1px solid #e4e7ed;
  border-top: 0;
  background: #fff;
}

.map-loading {
  position: relative;
  top: 20px;
}

</style>
