<template>
  <div>
    <div v-if="isShowAddSku">
      <Category :disableSelect="isShowAddSpu"></Category>

      <AllSpu v-if="isShowAddSpu" @fromAS="fromAS_EachSpuInfo"> </AllSpu>

      <EachSpu
        v-else
        :eachSpuInfoProps="eachSpuInfo"
        @cancelSave="cancelSave"
      ></EachSpu>
    </div>
    <AddSku v-else :eachSpuInfoProps="eachSpuInfo"></AddSku>
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
  6.显示添加sku组件时其它组件都隐藏
  7.使用vuex管理categoryId和categoryList的数据
    1.在Category组件中请求的时候就把id和list的数据保存到vuex中
*/
import Vue from "vue";
import Category from "@/components/Category";
import AllSpu from "./allSpu";
import EachSpu from "./eachSpu";
import AddSku from "./addSku";

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
      isShowAddSku: true,
      // isShowAddSku: false,
    };
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
    // 修改isShowAddSpu的值，切换组件
    toggleAddSPU(boolean) {
      this.isShowAddSpu = boolean;
    },
    // 修改isShowAddSku的值，切换组件
    toggleAddSKU(boolean) {
      this.isShowAddSku = boolean;
    },
  },
  components: {
    Category,
    AllSpu,
    EachSpu,
    AddSku,
  },
  mounted() {
    // 绑定一个修改isShowAddSpu值的函数
    this.$bus.$on("toggleAddSPU", this.toggleAddSPU);
    // 绑定一个修改isShowAddSpu值的函数
    this.$bus.$on("toggleAddSKU", this.toggleAddSKU);
  },
  beforeDestroy() {
    this.$bus.$off("toggleAddSPU", this.toggleAddSPU);
    this.$bus.$off("toggleAddSKU", this.toggleAddSKU);
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
