import request from '@/utils/request'

/*
  品牌管理相关数据
    1.获取所有品牌数据列表
*/
const api_name = '/admin/product/baseTrademark'

export default {
  /*
    所有品牌数据
  */
  getPageList() {
    return request({
      url: `${api_name}/getTrademarkList`,
      method: 'GET',
    })
  },
  // 请求某一页的数据
  getOneOfPage(page, limit) {
    return request({
      url: `${api_name}/${page}/${limit}`,
      method: 'GET',
    })
  },
  // 添加trademark
  addTrademark(data) {
     /*
        需要参数数据
          logoUrl
          tmName
     */
    return request({
      url: `${api_name}/save`,
      method: 'POST',
      data
    })
  },
}
