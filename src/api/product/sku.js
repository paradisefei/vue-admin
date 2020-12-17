import request from '@/utils/request'

/*
  平台属性管理
*/
const api_name = '/admin/product'

export default {
  // 获取所有spu的图片
  getSpuImageList(spuId) {
    return request({
      url: `${api_name}/spuImageList/${spuId}`,
      method: 'GET',
    })
  },
}
