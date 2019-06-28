<template>
  <div class="box">
    <article class="media">
      <div class="media-content">
        <div class="content" style="text-align: center">
          <h1>Welcome on Super File transfert !</h1>
          <p>
            <b-button type="is-primary">
              <router-link style="color:white" class="btn" to="/upload">
                Upload your files
              </router-link>
            </b-button>
          </p>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
export default {
  /* eslint-disable-next-line */
  name: 'HelloWorld',
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
