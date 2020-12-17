<template>
  <div>
    <el-card class="box-card">
      <b>一级分类</b>
      <el-select
        v-model="categoryId.category1Id"
        placeholder="请选择"
        @change="handleCategory1"
        :disabled="!disableSelect"
      >
        <el-option
          v-for="c1 in categoryList.category1List"
          :key="c1.id"
          :label="c1.name"
          :value="c1.id"
        >
          <!--
          change
            事件
            修改el-select值得时候，会触发change事件
         -->
        </el-option>
      </el-select>

      <b>二级分类</b>
      <el-select
        v-model="categoryId.category2Id"
        placeholder="请选择"
        @change="handleCategory2"
        :disabled="!disableSelect"
      >
        <el-option
          v-for="c2 in categoryList.category2List"
          :key="c2.id"
          :label="c2.name"
          :value="c2.id"
        >
        </el-option>
      </el-select>

      <b>三级分类</b>
      <el-select
        v-model="categoryId.category3Id"
        placeholder="请选择"
        @change="handleCategory3"
        :disabled="!disableSelect"
      >
        <el-option
          v-for="c3 in categoryList.category3List"
          :key="c3.id"
          :label="c3.name"
          :value="c3.id"
        >
        </el-option>
      </el-select>
    </el-card>
  </div>
</template>

<script>
/*
  静态页面
    上下两部分
    上
      卡片
      下拉框
      说明
    下
    渲染数据
      1.挂载成功获取一级分类列表数据
      2.点击了一级分类列表的某一项，然后去请求二级分类列表
      3.点击了三级分类列表，把属性渲染在下面得表格中
    修改属性
      点击修改属性按钮，来到切换入一个新的组件

  vuex管理数据
    1.触发action函数执行
      1.还没有请求到数据前渲染页面的话没有数据，会出现undefined
      2.修改vuex中categoryId的值
      3.获取二级分类列表数据
      4.点击二级分类列表，获取三级分类列表数据
      5.点击三级分类项，获取所有spu信息
*/
import { mapActions, mapState } from "vuex";
export default {
  name: "AttrList",
  computed: {
    ...mapState({
      categoryList: (state) => state.category.categoryList,
      categoryId: (state) => state.category.categoryId,
    }),
  },
  props: ["disableSelect"],
  methods: {
    // 引入action函数
    ...mapActions([
      "getCategory1ListAction",
      "getCategory2ListAction",
      "getCategory3ListAction",
    ]),
    // 点击一级分类列表，获取二级分类列表数据
    async handleCategory1(id) {
      /*
        把一级分类列表中的id传进来
        拿到id发请求
        先把后面得都清空
        如果下面是在添加属性界面的话，要回到属性列表

        1.修改vuex中的数据
          1.把修改vuex中的一级id
          2.每次点击一级分类列表，都需要把二级，三级分类列表清空
      */
      this.getCategory2ListAction(id);
    },
    // 点击二级分类列表，获取三级分类列表数据
    handleCategory2(id) {
      /*
        把二级分类列表中的id传进来
        拿到id发请求
      */
      this.getCategory3ListAction(id);
    },
    // 点击三级分类列表，获取属性信息
    handleCategory3() {
      /*
        1.发送请求
        2.接触添加属性按钮的禁用
        3.把请求到的三级数据传入到父组件

        1.发送请求，获取所有spu数据
      */
      console.log(this.categoryId);
    },
  },
  async mounted() {
    /*
      这里得到的返回值并不是最终需要动态渲染的数据
    */
    this.getCategory1ListAction();
  },
};
</script>
<style>
.box-card {
  margin-bottom: 10px;
  padding: 10px 0;
}
</style>
