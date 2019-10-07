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
html {
  background-image: url('https://d2v9y0dukr6mq2.cloudfront.net/video/thumbnail/JETFf6K/simple-background-diamond-s-color-4k_vhlemocxvl__F0000.png');
}
</style>
