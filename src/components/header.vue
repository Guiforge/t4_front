<template>
  <b-navbar id="header">
    <template slot="brand">
      <b-navbar-item
        :to="{ path: '/' }"
        tag="router-link"
        style="max-height: 3.75rem;"
      >
        <img src="../assets/inspector.jpg" style="max-height: 3.75rem;" />
      </b-navbar-item>
    </template>
    <template slot="start">
      <b-navbar-item href="/#/upload">
        Upload your Files !
      </b-navbar-item>
      <b-navbar-item href="/#/files">
        View your files
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
export default {
  /* eslint-disable-next-line */
  name: 'Header',
}
</script>
<style scoped>
#header {
  width: 98%;
  margin: auto;
  /* border-style: solid;
  border-width: thin;
  border-color: gray; */
  margin-bottom: 2em;
  box-shadow: 10px 10px 5px #e6e6e6;
}
</style>
