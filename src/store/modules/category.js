import { Message } from "element-ui";
import attr from "@/api/product/attr.js";

/*
  1.页面挂载成功时，请求一级分类列表数据
    1.categoryId
*/
const state = {
  categoryList: {
    // 一级分类列表的数据
    category1List: [],
    category2List: [],
    category3List: [],
  },
  categoryId: {
    // 一级分类某项得id
    category1Id: "",
    category2Id: "",
    category3Id: "",
  },
}
const getters = {

}
const actions = {
  // 请求一级分类列表数据
  async getCategory1ListAction({ commit }) {
    /*
      1.引入请求API
    */
    const res = await attr.getCategory1List();
    // console.log(res);
    if (res.code === 200) {
      // console.log(Message);
      // Message.success("一级分类列表数据获取成功");
      commit("GET_CATEGORY1_LIST", res.data);
    } else {
      Message.error("一级分类列表数据获取失败");
    }

  },
  // 请求二级分类列表数据
  async getCategory2ListAction({ commit }, id) {
    /*
      1.引入请求API
    */
    const res = await attr.getCategory2List(id);
    if (res.code === 200) {
      // console.log(Message);
      // Message.success("二级分类列表数据获取成功");
      commit("GET_CATEGORY2_LIST", res.data);
    } else {
      Message.error("二级分类列表数据获取失败");
    }
  },
  // 请求三级分类列表数据
  async getCategory3ListAction({ commit }, id) {
    /*
      1.引入请求API
    */
    const res = await attr.getCategory3List(id);
    if (res.code === 200) {
      // console.log(Message);
      // Message.success("二级分类列表数据获取成功");
      commit("GET_CATEGORY3_LIST", res.data);
    } else {
      Message.error("三级分类列表数据获取失败");
    }
  },

}
const mutations = {
  /*
    1.请求到一级分类列表后，改变state的值
      1.引入到category组件去展示
  */
  GET_CATEGORY1_LIST(state, category1List) {
    state.categoryList.category1List = category1List;
  },
  // 请求到二级分类列表数据后，修改state中的值
  GET_CATEGORY2_LIST(state, category2List) {
    state.categoryList.category2List = category2List;
    // console.log(state.categoryId);
    // state.categoryId.category1Id = id;

    state.categoryId.category2Id = "";
    state.categoryId.category3Id = "";
    state.categoryList.category3List = [];
  },
  // 请求到三级分类列表数据后，修改state中的值
  GET_CATEGORY3_LIST(state, category3List) {
    state.categoryList.category3List = category3List;
    // console.log(state.categoryId);
    // state.categoryId.category2Id = id;

    state.categoryId.category3Id = "";
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
}
