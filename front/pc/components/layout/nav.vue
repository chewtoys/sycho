<template>
  <nav class="nav">
    <a-menu
      v-model="current"
      mode="horizontal">
      <a-menu-item key="index"><nuxt-link to="/"><a-icon type="home" />赛柯围</nuxt-link></a-menu-item>
      <a-menu-item key="tech" ><nuxt-link to="/tech"><a-icon type="code" />风雨浸</nuxt-link></a-menu-item>
      <!-- <a-menu-item key="tech" ><nuxt-link to="/tech"><a-icon type="desktop" />风雨浸</nuxt-link></a-menu-item> -->
      <a-menu-item key="life" ><nuxt-link to="/life"><a-icon type="coffee" />百感生</nuxt-link></a-menu-item>
      <!-- 寻技斋 -->
      <a-menu-item key="link" ><nuxt-link to="/link"><a-icon type="chrome" />寻技斋</nuxt-link></a-menu-item>
      <a-menu-item key="message" ><nuxt-link to="/message"><a-icon type="message" />观言墙</nuxt-link></a-menu-item>
      <a-menu-item key="about"><nuxt-link to="/about"><a-icon type="user" />独留我</nuxt-link></a-menu-item>
      <!-- disabled -->
      <!-- <a-sub-menu>
        <span 
          slot="title" 
          class="submenu-title-wrapper"
        ><a-icon type="setting" />导航</span>
        <a-menu-item-group title="Item 1">
          <a-menu-item key="setting:1">Option 1</a-menu-item>
          <a-menu-item key="setting:2">Option 2</a-menu-item>
        </a-menu-item-group>
        <a-menu-item-group title="Item 2">
          <a-menu-item key="setting:3">Option 3</a-menu-item>
          <a-menu-item key="setting:4">Option 4</a-menu-item>
        </a-menu-item-group>
      </a-sub-menu> -->
    </a-menu>
  </nav>
</template>

<script>
  export default {
    name: 'Nav',
    data () {
      return { 
        current: ['index'],
      }
    },
    computed: {
    },
    watch: {
      $route(to, from){
        this.current = [to.name] 
      }
    },
    mounted: function () {
      this.current = [this.$route.name] 
    }
  }
</script>

<style lang="less" scoped>
  nav {
    position: relative;
    text-align: center;
    .ant-menu{
      // opacity: .8;
    }
  }
</style>