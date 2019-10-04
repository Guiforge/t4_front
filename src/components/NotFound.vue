<template>
  <div class="container">
    <h1>404 Page not found</h1>
    <img :src="randomSrc()" style="width: 100%;" />
  </div>
</template>

<script>
export default {
  /* eslint-disable-next-line */
  name: 'NotFound',
  data() {
    return {
      urls: [
        'https://media.giphy.com/media/3o85xsGXVuYh8lM3EQ/giphy.gif',
        'https://media.giphy.com/media/aFTt8wvDtqKCQ/giphy.gif',
        'https://media.giphy.com/media/wjK3YnjoQf0go/giphy.gif',
        'https://media.giphy.com/media/wjK3YnjoQf0go/giphy.gif',
        'https://media.giphy.com/media/9J7tdYltWyXIY/giphy.gif',
        'https://media.giphy.com/media/xTiN0L7EW5trfOvEk0/giphy.gif',
        'https://media.giphy.com/media/VwoJkTfZAUBSU/giphy.gif',
        'https://media.giphy.com/media/8L0Pky6C83SzkzU55a/giphy.gif',
        'https://media.giphy.com/media/YyKPbc5OOTSQE/giphy.gif',
        'https://media.giphy.com/media/Lny6Rw04nsOOc/giphy.gif',
      ],
    }
  },
  methods: {
    randomSrc() {
      const i = Math.floor(Math.random() * this.urls.length)

      // eslint-disable-next-line security/detect-object-injection
      return this.urls[i]
    },
  },
}
</script>
<style scoped></style>
