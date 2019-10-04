<template>
  <div id="app">
    <Header />
    <router-view />
    <br />
    <br />
    <br />
    <Footer />
  </div>
</template>

<script>
import Footer from './components/footer.vue'
import Header from './components/header.vue'

export default {
  name: 'App',
  components: {
    Footer,
    Header,
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
