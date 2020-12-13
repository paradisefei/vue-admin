<template>
  <div>
    <el-card class="box-card">
      <b>一级分类</b>
      <el-select
        v-model="categoryId.category1Id"
        placeholder="请选择"
        @change="handleCategory1"
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

    <el-card class="box-card" v-show="isShowModify">
      <el-button
        type="primary"
        icon="el-icon-plus"
        :disabled="isAddAttr"
        @click="addAttr"
        >添加属性</el-button
      >
      <el-table :data="attrInfoList" border class="elButton">
        <el-table-column type="index" label="序号" width="100" align="center">
        </el-table-column>
        <el-table-column prop="attrName" label="属性名称" width="150">
        </el-table-column>
        <!--
          整个表格使用attrInfoList的数据，是一个数组，这个数组中的每一项都是一个个的对象，并且对象中的属性名是相同的，每一个对象中的数据会渲染占一行
          这个prop属性就是指在一行中，渲染在该列的属性的名称
         -->
        <el-table-column prop="attrValueList" label="属性值列表">
          <template v-slot="{ row }">
            <el-tag
              v-for="attrValue in row.attrValueList"
              :key="attrValue.id"
              >{{ attrValue.valueName }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template v-slot="{ row }">
            <el-tooltip
              popper-class="atooltip"
              effect="light"
              content="修改属性"
              placement="bottom"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="modifyAttr(row.id, row.attrName)"
              ></el-button>
            </el-tooltip>

            <el-tooltip
              effect="light"
              content="删除属性"
              placement="bottom"
              popper-class="atooltip"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click.native="delAttr(row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 点击修改属性时切换的卡片 -->
    <el-card class="box-card" v-show="!isShowModify">
      <el-form label="姓名：">
        属性名：<el-input
          v-model="attrNameText"
          placeholder="请输入内容"
          size="mini"
          style="width: 280px; margin-bottom: 20px"
        ></el-input>
      </el-form>
      <!--
        1.点击添加属性,在表格中添加一个新行，就是在attrValueList在添加一个对象
       -->
      <el-button type="primary" icon="el-icon-plus" @click="addNewAttr"
        >添加属性值</el-button
      >
      <el-table :data="attrValueList" border class="elButton">
        <el-table-column type="index" label="序号" width="150" align="center">
        </el-table-column>
        <el-table-column prop="valueName" label="属性值名称">
          <!--
            1.一开始是不可编辑的模式，点击一下就变成了可编辑的模式了
            2.定义变量，确定元素的显示隐藏
            3.给div绑定点击事件，修改显示隐藏
              1.一点，所有都变成了可编辑模式，我只想要我点击的这个变成可编辑模式
                1.被点击的这个获取到焦点，获取到焦点的才变成可编辑模式，没获取到焦点的就不变成可编辑模式
                2.点击div，这个div获得焦点，但它立马就隐藏了，对应的文本框显示了，而且要让这个文本框获取焦点
                3.给每一个属性值都添加一个是否可编辑的标识，这样就可以实现只修改某一个为可编辑模式的了
                4.这个属性并不是后台返回回来的，而是在点击之后给当前对象加上去的，并且是响应式的
                5.el-input获取焦点
                  1.调用方法
                  2.调用方法前应该要获取元素
                    nextTick
                  3.鼠标抬起失去焦点
                    失去焦点时需要判断是否有内容
                6.element中的native
                7.我修改属性的时候，输入不了内容
                  1.没有收集数据
                8.这里的value值不能直接绑定原数据上的
           -->
          <template v-slot="{ row, $index }">
            <el-input
              size="mini"
              v-if="row.edit"
              ref="input"
              @blur="loseFocus(row, $index)"
              @keyup.enter.native="loseFocus(row, $index)"
              v-model="row.valueName"
            />
            <div v-else @click="toEditable(row, row.valueName, row.attrId)">
              {{ row.valueName }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="{ row }">
            <el-tooltip
              effect="light"
              content="删除属性"
              placement="bottom"
              popper-class="atooltip"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click.native="delAttrValue(row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--
        1.点击取消，回到前一个组件
        2.点击保存，发送请求
       -->
      <el-button type="primary" @click="saveModify">保存</el-button>
      <el-button @click.native="cancelModify">取消</el-button>
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
import Vue from "vue";
import { tooltip } from "element-ui";
Vue.use(tooltip);
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
      // 属性信息
      attrInfoList: [],
      attrId: "",
      attrValueList: [],
      // 添加属性按钮
      attrValue: {},
      // 是否禁用添加属性按钮
      isAddAttr: true,
      // 点击修改属性
      isShowModify: true,
      // 属性名输入框
      attrNameText: "",
      // 属性值名称文本框
      valueNameText: "",
    };
  },
  methods: {
    // 点击删除属性
    async delAttr(row) {
      await this.$API.attr.deleteAttr(row.id);
      const res = await this.$API.attr.getAttrInfoList(this.categoryId);
      if (res.code === 200) {
        this.$message.success("成功");
        this.attrInfoList = res.data;
      } else {
        this.$message.error("数据获取失败");
      }
    },
    // 点击删除属性值
    delAttrValue(row) {
      /*
        1.先更新用户界面，最后发请求
      */
      this.attrValueList = this.attrValueList.filter(
        (attrValueObj) => attrValueObj.id !== row.id
      );
    },
    // 点击添加属性(不是属性值，而是属性)
    addAttr() {
      this.attrNameText = "";
      this.attrValueList = [];
      this.isShowModify = false;
    },
    // 点击保存按钮
    async saveModify() {
      /*
        1.发送成功，回到所有属性界面
        2.attr中有id是更新，没有id是保存
        3.先拿到被修改的那个属性，解构，然后把属性名和属性值放进来
        4.根据id在属性列表中找到要被修改的那个属性
        5.把每个属性中的edit属性删掉
      */
      this.attrValueList.forEach((attrValueObj) => {
        if (attrValueObj.hasOwnProperty("edit")) {
          delete attrValueObj.edit;
        }
      });
      this.attrValue = {
        attrName: this.attrNameText,
        attrValueList: this.attrValueList,
        categoryId: this.categoryId.category3Id, // 当前第3级分类ID
        categoryLevel: 3, // 分类级别
        id: this.attrId,
      };
      const res1 = await this.$API.attr.saveAttrInfo(this.attrValue);
      if (res1.code === 200) {
        this.$message.success("保存成功");
        this.isShowModify = true;
      } else {
        this.$message.error("数据获取失败");
      }

      const res2 = await this.$API.attr.getAttrInfoList(this.categoryId);
      if (res2.code === 200) {
        this.attrInfoList = res2.data;
      } else {
        this.$message.error("数据获取失败");
      }
    },
    // 点击取消按钮
    cancelModify() {
      /*
        1.所有被改了的内容要还原成改动之前的
          1.由于数据是重新获取的，所以不需要考虑再次进入时内容会变
        2.回到第一个组件
      */
      //  this.attrValueList =
      this.isShowModify = true;
    },
    // 失去焦点时
    loseFocus(row, index) {
      /*
        1.如果valueName为空，则将该条属性值从属性值列表中删除
        2.失去焦点，变成不可编辑
        3.失去焦点时，把文本框的内容赋给到
      */
      if (!row.valueName) {
        this.attrValueList.splice(index, 1);
        return;
      }
      row.edit = false;
    },
    // 在有属性名的组件中添加属性
    addNewAttr() {
      /*
        1.点击，在attrValueList中添加一条数据
          1.添加进去时是没有valueName的，此时div空，无法点击，所以还要同时传入edit属性，并且获得焦点
          2.并且此时失去焦点时不能变成不可编辑模式
      */
      this.attrValueList.push({ edit: true });
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    // 点击切换编辑模式
    toEditable(row, valueName, attrId) {
      /*
        1.在row身上添加一个edit属性，并且是响应式的
        2.变成文本框是获取焦点
        3.失去焦点时，修改edit的值
        4.进入编辑模式时，文本框的内容和原本的文本内容相同
        5.收集属性id
      */
      this.attrId = attrId;
      this.$set(row, "edit", true);
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
      this.valueNameText = valueName;
    },
    // 点击修改属性
    async modifyAttr(id, name) {
      /*
        1.把属性名放入文本框中，属性值列表展示在表格中。
          1.发送请求，获取属性值列表
          2.拿到属性id
        2.点击valueName这个框时，变成可编辑的模式
      */
      this.attrId = id;
      this.isShowModify = false;
      this.attrNameText = name;
      const res = await this.$API.attr.getAttrValueList(id);
      if (res.code === 200) {
        this.$message.success("数据获取成功");
        this.attrValueList = res.data;
      } else {
        this.$message.error("数据获取失败");
      }
    },
    // 点击一级分类列表，获取二级分类列表数据
    async handleCategory1(id) {
      /*
        把一级分类列表中的id传进来
        拿到id发请求
        先把后面得都清空
      */
      this.categoryId.category2Id = "";
      this.categoryId.category3Id = "";
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
        发送请求
        接触添加属性按钮的禁用
      */
      this.isAddAttr = false;
      const res = await this.$API.attr.getAttrInfoList(this.categoryId);
      if (res.code === 200) {
        this.attrInfoList = res.data;
      } else {
        this.$message.error("数据获取失败");
      }
    },
  },
  async mounted() {
    /*
      这里得到的返回值并不是最终需要动态渲染的数据
    */
    const res = await this.$API.attr.getCategory1List();
    if (res.code === 200) {
      this.$message.success("数据获取成功");
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
.elButton {
  width: 100%;
  margin: 20px 0;
}
.atooltip {
  padding: 3px !important;
}
</style>
