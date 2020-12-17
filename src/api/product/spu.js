import request from '@/utils/request'

/*
  平台属性管理
*/
const api_name = '/admin/product'

export default {
  // 获取spu基本信息
  getAllSpuInfoList({ current, size, category3Id }) {
    return request({
      url: `${api_name}/${current}/${size}`,
      method: 'GET',
      params: {
        category3Id,
      }
    })
  },
  // 获取所有品牌
  getAllTrademarkList() {
    return request({
      url: `${api_name}/baseTrademark/getTrademarkList`,
      method: 'GET',
    })
  },
  // 获取所有spu的图片
  getSpuImageList(spuId) {
    return request({
      url: `${api_name}/spuImageList/${spuId}`,
      method: 'GET',
    })
  },
  // 获取销售属性
  getSpuSaleAttrList(spuId) {
    return request({
      url: `${api_name}/spuSaleAttrList/${spuId}`,
      method: 'GET',
    })
  },
  // 获取基础销售属性列表
  getBaseSaleAttrList() {
    return request({
      url: `${api_name}/baseSaleAttrList`,
      method: 'GET',
    })
  },
  // 保存
  saveSpuInfo(data) {
    // console.log(data);
    return request({
      url: `${api_name}/saveSpuInfo`,
      method: 'POST',
      data,
    })
  },
  // 更新
  updateSpuInfo(data) {
    // console.log(data);
    return request({
      url: `${api_name}/updateSpuInfo`,
      method: 'POST',
      data,
    })
  },
}
