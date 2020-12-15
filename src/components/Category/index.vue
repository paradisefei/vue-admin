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
*/
export default {
  name: "AttrList",
  data() {
    return {
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
    };
  },
  props: ["disableSelect"],
  methods: {
    // 点击一级分类列表，获取二级分类列表数据
    async handleCategory1(id) {
      /*
        把一级分类列表中的id传进来
        拿到id发请求
        先把后面得都清空
        如果下面是在添加属性界面的话，要回到属性列表
      */
      this.categoryId.category2Id = "";
      this.categoryId.category3Id = "";
      this.categoryList.category3List = [];
      this.$bus.$emit("fromCategory", [], {});
      const res = await this.$API.attr.getCategory2List(id);
      if (res.code === 200) {
        this.categoryList.category2List = res.data;
      } else {
        this.$message.error("数据获取失败");
      }
    },
    // 点击二级分类列表，获取三级分类列表数据
    async handleCategory2(id) {
      /*
        把二级分类列表中的id传进来
        拿到id发请求
      */
      this.categoryId.category3Id = "";
      this.$bus.$emit("fromCategory", [], {});
      const res = await this.$API.attr.getCategory3List(id);
      if (res.code === 200) {
        this.categoryList.category3List = res.data;
      } else {
        this.$message.error("数据获取失败");
      }
    },
    // 点击三级分类列表，获取属性信息
    async handleCategory3() {
      /*
        1.发送请求
        2.接触添加属性按钮的禁用
        3.把请求到的三级数据传入到父组件
      */
      const res = await this.$API.attr.getAttrInfoList(this.categoryId);
      if (res.code === 200) {
        this.$bus.$emit("fromCategory", res.data, this.categoryId);
        this.$bus.$emit("deliverCategoryId", this.categoryId);
      } else {
        this.$message.error("数据获取失败");
      }
    },
  },
  async mounted() {
    /*
      这里得到的返回值并不是最终需要动态渲染的数据
    */
    this.$bus.$emit("fromCategory", [], {});
    const res = await this.$API.attr.getCategory1List();
    if (res.code === 200) {
      this.$message.success("一级分类列表数据获取成功");
      this.categoryList.category1List = res.data;
    } else {
      this.$message.error("数据获取失败");
    }
  },
};
</script>
<style>
.box-card {
  margin-bottom: 10px;
  padding: 10px 0;
}
</style>
