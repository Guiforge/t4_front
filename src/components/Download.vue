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
      <b-button @click="getMeta">Click Me</b-button>
    </b-collapse>
  </section>
</template>

<script>
import Download from '../utils/download'
import Keys from '../zip-encrypt/keys'
import b64 from '../utils/base64'
import getUrl from '../utils/getUrl'

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
      const keyStr = await b64.decode(this.key64)
      const keyArray = new Uint8Array(keyStr.split(','))
      const keys = await new Keys(keyArray)
      return keys
    },
    async getMeta() {
      const metaEnc = await this.getRemoteData()
      await this.decryptMeta(metaEnc)
    },
    async decryptMeta(metaEnc) {
      console.log(metaEnc)
      const truc = await crypto.subtle.decrypt(
        'AES-GCM',
        await this.keys.getKeyFile(),
        new Uint8Array(metaEnc),
      )
      console.log(truc)
    },
    async getRemoteData() {
      this.keys = await this.getKeys()
      const keySign = await this.keys.getKeySign()
      this.signNonce = await crypto.subtle.sign(
        'HMAC',
        keySign,
        // eslint-disable-next-line new-cap
        new Buffer.from(await this.nonce),
      )
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.onerror = (err) => {
          reject(`Error: ${err.target.status}`)
        }
        xhr.onload = (ev) => {
          if (ev.target.status === 200) {
            resolve(ev.target.response)
          } else {
            reject(ev.target.status)
          }
        }
        xhr.open('POST', getUrl.getMeta(this.id), true)
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
        xhr.send(
          JSON.stringify({
            // eslint-disable-next-line new-cap
            signNonce: new Buffer.from(this.signNonce),
          }),
        )
      })
    },
  },
}
</script>
<style scoped></style>
