<template>
  <el-card class="box-card">
    <el-button
      type="primary"
      icon="el-icon-plus"
      :disabled="isDisableAddSpu"
      @click="addSPU"
      >添加SPU</el-button
    >
    <el-table :data="allSpuInfoList" border class="elButton">
      <el-table-column type="index" label="序号" width="100" align="center">
      </el-table-column>
      <el-table-column prop="spuName" label="SPU名称"> </el-table-column>
      <!--
          整个表格使用attrInfoList的数据，是一个数组，这个数组中的每一项都是一个个的对象，并且对象中的属性名是相同的，每一个对象中的数据会渲染占一行
          这个prop属性就是指在一行中，渲染在该列的属性的名称
         -->
      <el-table-column prop="description" label="SPU描述"> </el-table-column>
      <el-table-column label="操作">
        <template v-slot="{ row }">
          <el-tooltip
            popper-class="atooltip"
            effect="light"
            content="添加SPU"
            placement="bottom"
          >
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="mini"
            ></el-button>
          </el-tooltip>
          <el-tooltip
            popper-class="atooltip"
            effect="light"
            content="修改SPU"
            placement="bottom"
          >
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="modifySpu(row)"
            ></el-button>
          </el-tooltip>
          <el-tooltip
            popper-class="atooltip"
            effect="light"
            content="查看所有SKU"
            placement="bottom"
          >
            <el-button
              type="primary"
              icon="el-icon-info"
              size="mini"
            ></el-button>
          </el-tooltip>

          <el-popconfirm title="确定删除吗">
            <el-button
              type="danger"
              icon="el-icon-delete"
              slot="reference"
              size="mini"
            ></el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      class="pagination"
      :page-sizes="[3, 6, 9]"
      :page-size="size"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="current"
      layout="prev, pager, next, jumper, sizes, total"
      :total="total"
    >
    </el-pagination>
  </el-card>
</template>

<script>
/*
  1.渲染所有SPU数据的组件
  2.要渲染就得先拿到数据，数据是在选择了category3时获取到的，兄弟之间的传数据，使用全局事件总线
  3.绑定事件
  4.修改属性
    1.点击修改属性，渲染eachSpuInfo组件，在这里使用v-if，使用v-if会有写在和挂载的过程，使用v-show就一直是挂载的，那既然是有卸载的就不能直接传数据了，而需要把数据放到父组件中
    2.要把这一行的信息传到eachSpuInfo组件中
*/
export default {
  name: "AllSpu",
  data() {
    return {
      allSpuInfoList: [],
      categoryId: {
        // 一级分类某项得id
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
      size: 3,
      current: 1,
      total: 0,
      eachSpuInfo: {
        spuName: "",
        description: "",
      },
    };
  },
  computed: {
    // 是否禁用添加SPU按钮
    isDisableAddSpu() {
      return !this.categoryId.category3Id;
    },
  },
  methods: {
    // 点击添加SPU
    addSPU() {
      /*
        1.要显示eachSpu组件，点击修改isShowAddSpu的值
        2.eachSpu组件置为空
       */
      this.$emit("fromAS", {});
      this.$bus.$emit("toggle", false);
    },
    //　点击修改spu
    async modifySpu(row) {
      /*
        1.来到修改组件
        2.显示spu名称
          1.改行能获取到的数据有
            1.名称
            2.描述
          2.要请求的数据有
            1.品牌
            2.图片
            3.销售属性
        3.给eachSpuInfo对象上的属性赋值
        4.分别进行请求，获取到要请求的数据来进行渲染
          1.获取品牌
          2.获取图片
          3.获取销售属性
      */
      // this.isShowAddSpu = false;
      this.$emit("fromAS", row);
      this.$bus.$emit("toggle", false);
    },
    handleSizeChange(size) {
      this.myGetAllSpuInfoList({
        current: 1,
        size,
        category3Id: this.categoryId.category3Id,
      });
    },
    handleCurrentChange(current) {
      this.myGetAllSpuInfoList({
        current,
        size: this.size,
        category3Id: this.categoryId.category3Id,
      });
    },
    async myGetAllSpuInfoList({ current, size, category3Id }) {
      const res = await this.$API.spu.getAllSpuInfoList({
        current,
        size,
        category3Id,
      });
      if (res.code === 200) {
        this.$message.success("allSpuInfoList获取成功");
        this.allSpuInfoList = res.data.records;
        this.total = res.data.total;
        this.current = res.data.current;
        this.size = res.data.size;
      } else {
        this.$message.error("数据获取失败");
      }
    },
    fromCategory(allSpuInfoList, categoryId) {
      // category获取到三级列表id时，触发事件
      /*
        1.获取到所有的spu列表数据
        2.触发时会传入两个数据
        3.还要把id都传过来
        4.获取到数据把数据渲染到组件中
        5.获取到和分页器相关的数据
        6.获取到三级分类数据时，接触按钮禁用
      */
      this.allSpuInfoList = allSpuInfoList;
      if (!Object.keys(categoryId).length) return;
      const { current, size } = this;
      this.categoryId = categoryId;
      const category3Id = categoryId.category3Id;
      this.myGetAllSpuInfoList({
        current,
        size,
        category3Id,
      });
    },
  },
  mounted() {
    // 绑定事件
    this.$bus.$on("fromCategory", this.fromCategory);
  },
  beforeDestroy() {
    this.$bus.$off("fromCategory", this.fromCategory);
  },
};
</script>
<style>
.elButton {
  width: 100%;
  margin: 20px 0;
}
</style>
