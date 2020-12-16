<template>
  <div>
    <Category :disableSelect="isShowAddSpu"></Category>

    <AllSpu v-if="isShowAddSpu" @fromAS="fromAS_EachSpuInfo"> </AllSpu>

    <EachSpu
      v-else
      :eachSpuInfoProps="eachSpuInfo"
      @cancelSave="cancelSave"
      :categoryId="categoryId"
    ></EachSpu>
  </div>
</template>

<script>
/*
  1.渲染
    1.三级分类下拉框复用
    2.添加SPU
    3.分页器
  2.获取数据
    1.定义api
      1.获取spu基本信息
        1.获取所有spu信息渲染在table中
      2.这个三级分类下的所有spu
      3.获取到三级列表的id时进行spu信息的获取
  3.点击修改SPU
  4.拆分组件
    1.显示所有SPU的组件
  5.绑定自定义事件接收从AllSpu组件中过来的eachSpuInfo信息
*/
import Vue from "vue";
import Category from "@/components/Category";
import AllSpu from "./allSpu";
import EachSpu from "./eachSpu";
import { tooltip } from "element-ui";
Vue.use(tooltip);
export default {
  name: "SpuList",
  data() {
    return {
      categoryId: {
        // 一级分类某项得id
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
      eachSpuInfo: {
        spuName: "",
        description: "",
      },
      attrInfoList: [],
      // 销售属性中选择的某个属性
      checkSpuAttrValue: "",
      isShowAddSpu: true,
    };
  },
  computed: {
    // 两个组件间切换显示隐藏
    // isShowAddSpu() {
    //   /*
    //     1.如果eachSpuInfo身上有id了，说明点击了修改属性，所以这里使用计算属性
    //   */
    //   return !this.eachSpuInfo.id;
    // },
  },
  methods: {
    // 定义自定义事件获取从allSpu中传来的eachSpuInfo数据
    fromAS_EachSpuInfo(row) {
      this.eachSpuInfo = { ...row };
    },
    // 取消保存
    cancelSave(eachSpuInfo, categoryId) {
      /*
        1.从eachSpu传过来数据，让allSpu组件挂载
        2.触发全局事件总线上请求数据的方法
      */
      this.eachSpuInfo = eachSpuInfo;
      this.$nextTick(() => {
        /*
          1.在这里触发获取所有spu信息的方法
            1.这个方法在allSpu中绑定，需要传入的参数就是3个Id
            2.那我就需要把3个Id的对象传过来
            3.categoryId的对象只在allSpu中有，那我可以在那里绑定一个方法把categoryId传出来
              1.eachSpu需要categoryId，所以在eachSpu中绑定，在allSpu中触发
        */
        this.$bus.$emit("fromCategory", eachSpuInfo, categoryId);
      });
    },
    deliverCategoryId(categoryId) {
      this.categoryId = categoryId;
    },
    // 修改isShowAddSpu的值，切换组件
    toggle(boolean) {
      this.isShowAddSpu = boolean;
    }
  },
  components: {
    Category,
    AllSpu,
    EachSpu,
  },
  mounted() {
    // 绑定事件传递categoryId
    // 当点击了三级分类列表时，触发该事件把数据传过来
    this.$bus.$on("deliverCategoryId", this.deliverCategoryId);
    // 绑定一个修改isShowAddSpu值的函数
    this.$bus.$on("toggle", this.toggle);
  },
  beforeDestroy() {
    this.$bus.$off("deliverCategoryId", this.deliverCategoryId);
    this.$bus.$off("toggle", this.toggle);
  },
};
</script>

<style scoped>
.elButton {
  width: 100%;
  margin: 20px 0;
}
.pagination {
  text-align: center;
}
/deep/.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
