<template>
  <section>
    <b-collapse class="card" aria-id="contentIdForA11y3">
      <div
        slot="trigger"
        slot-scope="props"
        class="card-header"
        role="button"
        aria-controls="contentIdForA11y3"
      >
        <p class="card-header-title">
          Download file
        </p>
        <a class="card-header-icon">
          <b-icon :icon="props.open ? 'caret-down' : 'caret-up'"> </b-icon>
        </a>
      </div>
      <div class="card-content">
        <div class="content">
          id: {{ id }}
          <br />
          key: {{ key64 }}
          <br />
        </div>
      </div>
    </b-collapse>
  </section>
</template>

<script>
export default {
  /* eslint-disable-next-line */
  name: 'Download',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      key64: null,
    }
  },
  created() {
    this.key64 = this.$router.currentRoute.hash.substr(1)
  },
}
</script>
<style scoped></style>
