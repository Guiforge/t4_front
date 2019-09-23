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
          <div v-if="meta">
            <div>
              file: file.zip
              <br />
              size: {{ formatSize(meta.sizeZip) }}
            </div>
            <b-button @click="download">Download</b-button>
          </div>
        </div>
      </div>
    </b-collapse>
  </section>
</template>

<script>
/* eslint-disable new-cap */
// import stream from 'readable-stream'

import formatSizeImp from '../utils/formatSize'
import Download from '../utils/download'
import Keys from '../zip-encrypt/keys'
import abTools from '../utils/abTools'
import sendDownload from '../utils/sendDownload'
import encrypt from '../zip-encrypt/encrypt'
import streamSaver from '../utils/streamsaver'

// import base64 from '../utils/base64'
// import getUrl from '../utils/getUrl'

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
    const toto = async () => {
      try {
        this.key64 = this.$router.currentRoute.hash.substr(1)
        this.nonce = await Download.getNonce(this.id)
        await this.getMeta()
      } catch (error) {
        if (error === 401) {
          this.toastDanger('File not Found')
        }
        this.$router.push('/NotFound')
      }
    }
    toto()
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
    formatSize(byte) {
      return formatSizeImp(byte, 10)
    },
    async download() {
      const fileStream = streamSaver.createWriteStream('filename.zip', {
        size: this.sizeZip,
      })
      const decipher = encrypt.createDecipherFile(
        await this.keys.getKeyFile(),
        this.meta.files.ivFiles,
      )
      try {
        decipher.setAuthTag(this.meta.authTag)
        await sendDownload.download(
          this.id,
          this.signNonce,
          fileStream,
          decipher,
        )
      } catch (error) {
        fileStream.abort()
        this.toastDanger(error)
      }
    },
    async getKeys() {
      const keys = new Keys(new Uint8Array(abTools.b642b(this.key64)))
      return keys
    },
    async getMeta() {
      const metaEnc = await this.getRemoteData()
      this.meta = { sizeZip: metaEnc.sizeZip }
      this.meta.files = await this.decryptMeta(metaEnc)
      this.meta.authTag = metaEnc.authTag
    },
    async decryptMeta(meta) {
      return encrypt.decryptMeta(
        await this.keys.getKeyMeta(),
        meta.ivMeta,
        meta.enc,
      )
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
      return sendDownload.getMeta(this.id, this.signNonce)
    },
  },
}
</script>
<style scoped></style>
`
