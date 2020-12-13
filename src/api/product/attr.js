import request from '@/utils/request'

/*
  平台属性管理
*/
const api_name = '/admin/product'

export default {
  // 获取一级分类列表数据
  getCategory1List() {
    return request({
      url: `${api_name}/getCategory1`,
      method: 'GET',
    })
  },
  // 获取二级分类列表数据
  getCategory2List(id) {
    return request({
      url: `${api_name}/getCategory2/${id}`,
      method: 'GET',
    })
  },
  // 获取三级分类列表数据
  getCategory3List(id) {
    return request({
      url: `${api_name}/getCategory3/${id}`,
      method: 'GET',
    })
  },
  // 获取属性信息列表
  getAttrInfoList({ category1Id, category2Id, category3Id }) {
    return request({
      url: `${api_name}/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,
      method: 'GET',
    })
  },
  // 获取属性值列表
  getAttrValueList(attrId) {
    return request({
      url: `${api_name}/getAttrValueList/${attrId}`,
      method: 'GET',
    })
  },
  // 保存对属性的修改
  saveAttrInfo(data) {
    return request({
      url: `${api_name}/saveAttrInfo`,
      method: 'POST',
      data,
    })
  },
  // 删除某个属性
  deleteAttr(attrId) {
    return request({
      url: `${api_name}/deleteAttr/${attrId}`,
      method: 'DELETE',
    })
  },
}
