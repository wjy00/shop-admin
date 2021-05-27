<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary"
                     @click="addDialogVisible= true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList"
                border
                stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <!-- 渲染一级权限 -->
            <el-row class="bdbottom vcenter"
                    v-for="item1 in scope.row.children"
                    :key="item1.id">
              <el-col :span="5">
                <el-tag type="primary"
                        closable
                        @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套，渲染二级权限 -->
                <el-row class="bdtop vcenter"
                        v-for="item2 in item1.children"
                        :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success"
                            closable
                            @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 通过for循环嵌套，渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning"
                            v-for="item3 in item2.children"
                            :key="item3.id"
                            closable
                            @close="removeRightById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列    -->
        <el-table-column type="index"
                         label="#"></el-table-column>
        <el-table-column label="角色名称"
                         prop="roleName"></el-table-column>
        <el-table-column label="角色描述"
                         prop="roleDesc"></el-table-column>
        <el-table-column label="操作"
                         width="300px">
          <template v-slot="scope">
            <el-button type="primary"
                       icon="el-icon-search"
                       size="mini"
                       @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini"
                       @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning"
                       icon="el-icon-setting"
                       size="mini"
                       @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加角色的对话框 -->
      <el-dialog title="添加角色"
                 :visible.sync="addDialogVisible"
                 width="50%"
                 @close="addDialogClose">
        <!-- 内容主题区域 -->
        <el-form :model="addForm"
                 :rules="rules"
                 ref="rolesListRef"
                 label-width="100px">
          <el-form-item label="角色名称"
                        prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述"
                        prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑角色的对话框 -->
      <el-dialog title="编辑角色"
                 :visible.sync="editDialogVisible"
                 width="50%"
                 @close="editDialogClose">
        <!-- 内容主题区域 -->
        <el-form :model="editForm"
                 :rules="rules"
                 ref="editFormRef"
                 label-width="100px">
          <el-form-item label="角色名称"
                        prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述"
                        prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="editRoles">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限"
               :visible.sync="setRightDialogVisible"
               width="50%"
               @close="setRightDialogClosed">
      <!-- 内容主题区域 -->
      <!-- 树形控件 -->
      <el-tree :data="rightsList"
               :props="treeProps"
               show-checkbox
               node-key="id"
               default-expand-all
               :default-checked-keys="defKeys"
               ref="treeRef"></el-tree>
      <!-- 底部区域 -->
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: 'Roles',
  components: {},
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 添加用户表单数据
      addForm: {},
      // 编辑用户表单数据
      editForm: {},
      // 所有权限的数据
      rightsList: [],

      // 控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 控制编辑角色对话框的显示与隐藏
      editDialogVisible: false,
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,

      // 添加表单的验证规则对象
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          { required: false, message: '请输入角色描述', trigger: 'blur' },
        ],
      },

      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
    }
  },

  created() {
    this.getRolesList()
  },

  methods: {
    // 获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200)
        return this.$message.error('获取角色列表失败')
      this.rolesList = res.data
      // console.log(this.rolesList)
    },

    // 监听添加角色对话框的关闭事件
    addDialogClose() {
      this.$refs.rolesListRef.resetFields()
    },
    // 点击确定按钮,添加新角色
    addRoles() {
      // 提交请求前，表单预验证
      this.$refs.rolesListRef.validate(async (valid) => {
        // 表单预校验失败
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        // 隐藏添加用户对话框
        this.addDialogVisible = false
        this.getRolesList()
      })
    },

    // 点击编辑按钮,根据id查询角色
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200)
        return this.$message.error('查询角色信息失败！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听编辑角色对话框的关闭事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定按钮,表单预验证后修改角色
    editRoles() {
      this.$refs.editFormRef.validate(async (valid) => {
        // console.log(valid)
        // 表单预校验失败
        if (!valid) return
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('更新角色信息失败！')
        }
        // 隐藏编辑角色对话框
        this.editDialogVisible = false
        this.$message.success('更新角色信息成功！')
        this.getRolesList()
      })
    },

    // 点击删除按钮,删除角色
    async removeRoleById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
      this.$message.success('删除用户成功！')
      this.getRolesList()
    },

    // 根据ID删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示 删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 点击确定 返回值为：confirm
      // 点击取消 返回值为： cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消权限删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      role.children = res.data
      //   不建议使用
      // this.getRolesList()
    },

    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.defKeys = []
      this.roleId = role.id
      // 获取角色的所有权限
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      //   获取权限树
      this.rightsList = res.data
      // console.log(res)

      //   递归获取三级节点的id
      this.getLeafkeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    // 通过递归 获取角色下三级权限的 id, 并保存到defKeys数组
    getLeafkeys(node, arr) {
      // 没有children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => this.getLeafkeys(item, arr))
    },
    // 权限对话框关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },

    // 点击为角色分配权限
    async allotRights(roleId) {
      // 获得当前选中和半选中的Id
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      // join() 方法用于把数组中的所有元素放入一个字符串
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功!')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdbottom {
  border-bottom: 1px solid #eee;
  &:nth-child(1) {
    border-top: 1px solid #eee;
  }
}

.bdtop {
  border-top: 1px solid #eee;
  &:nth-child(1) {
    border-top: none;
  }
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>