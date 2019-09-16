`<template>
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
      <b-button @click="getMeta">Click Me</b-button>
    </b-collapse>
  </section>
</template>

<script>
/* eslint-disable new-cap */
import Download from '../utils/download'
import Keys from '../zip-encrypt/keys'
// import b64 from '../utils/base64'
// import getUrl from '../utils/getUrl'
import abTools from '../utils/abTools'
import getMeta from '../utils/sendDownload'
import encrypt from '../zip-encrypt/encrypt'

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
      downloadClass: undefined,
      nonce: undefined,
      signNonce: undefined,
      keys: undefined,
      meta: undefined,
    }
  },
  created() {
    this.key64 = this.$router.currentRoute.hash.substr(1)
    this.nonce = Download.getNonce(this.id)
    this.getMeta()
  },
  methods: {
    toastOpen(msg, type) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      this.$toast.open({
        message: msg,
        type,
      })
    },
    toastSuccess(msg) {
      this.toastOpen(msg, 'is-success')
    },
    toastDanger(msg) {
      this.toastOpen(msg, 'is-danger')
    },
    async getKeys() {
      const keys = new Keys(new Uint8Array(abTools.b642b(this.key64)))
      return keys
    },
    async getMeta() {
      const meta = await this.getRemoteData()
      console.log('meta: --', meta)
      await this.decryptMeta(meta)
    },
    async decryptMeta(meta) {
      encrypt.decryptMeta(await this.keys.getKeyMeta(), meta.ivMeta, meta.enc)
      console.log(meta)
    },
    async getRemoteData() {
      this.keys = await this.getKeys()
      // eslint-disable-next-line no-underscore-dangle
      let keySign = await this.keys.getKeyAuth()
      // import Key for sign
      keySign = await crypto.subtle.importKey(
        'raw',
        keySign,
        {
          name: 'HMAC',
          hash: { name: 'SHA-256' },
        },
        false,
        ['sign', 'verify'],
      )
      // Sign Nonce
      this.signNonce = await crypto.subtle.sign(
        'HMAC',
        keySign,
        new Buffer.from(await this.nonce),
      )
      return getMeta(this.id, this.signNonce)
    },
  },
}
</script>
<style scoped></style>
`
