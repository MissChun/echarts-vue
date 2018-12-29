const api = {
  getCarriesFuild: {
    url: '/freight/loadbase',
    method: 'get',
    desc: '获取承运商',
    param: {

    }
  },
  getdrawLineData: {
    url: '/freight/loadfreight',
    method: 'get',
    desc: '获取图表数据',
    param: {

    }
  },
  getMapData: {
    url: '/station_waybill/getswaybillinfo',
    method: 'get',
    desc: '获取站点订单分析数据',
    param: {

    }
  },
  getCompany: {
    url: '/station_waybill/loadcompany',
    method: 'get',
    desc: '默认加载所有有订单的贸易公司',
    param: {

    }
  },
  getFluid: {
    url: '/station_waybill/loadallfliud',
    method: 'get',
    desc: '获取液厂列表',
    param: {

    }
  },
  getCarrierList: {
    url: '/station_waybill/loadcoocompany',
    method: 'get',
    desc: '获取承运商列表',
    param: {

    }
  },
  getCarrierOrder: {
    url: '/station_waybill/loadcoocompanyinfo',
    method: 'get',
    desc: '获取承运商运单数据',
    param: {

    }
  },
  getFluidBill: {
    url: '/station_waybill/loadfliudfreight',
    method: 'get',
    desc: '获取某个液厂运费',
    param: {

    }
  },
  getWaybillOfFluid: {
    url: '/station_waybill/waybillofstationandfluid',
    method: 'get',
    desc: '获取某个液厂运费',
    param: {

    }
  },
  loadlist: {
    url: '/bigdata/api/v1/loadlist',
    method: 'GET',
    desc: "加载所有液厂和站点",
    param: {

    }
  },
  loadAllTrip: {
    url: '/bigdata/api/v1/loadAllTrip',
    method: 'GET',
    desc: "加载",
    param: {

    }
  },

}
export default api;
