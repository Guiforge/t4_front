<template>
  <div class="box">
    <article class="media">
      <div class="media-content">
        <div class="content" style="text-align: center">
          <h1>Welcome on Super File Transfert !</h1>
          <p>
            <router-link style="color:white" class="btn" to="/upload">
              <b-button type="is-primary">
                Upload your files
              </b-button>
            </router-link>
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
