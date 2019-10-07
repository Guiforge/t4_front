`<template>
  <section>
    <div class="card" aria-id="contentIdForA11y3">
      <div slot="trigger" class="card-header">
        <p class="card-header-title">
          Download file
        </p>
      </div>
      <div class="card-content">
        <div class="content">
          <div v-if="isLoading">
            <h2 v-if="progress.status && progress.status !== null">
              {{ progress.status }}
            </h2>
            <h3 v-if="progress.value">({{ progress.value }}%)</h3>
            <progress
              :value="progress.value"
              class="progress is-info"
              max="100"
            ></progress>
          </div>
          <div v-if="meta && !isLoading">
            <div>
              file: files.tar.gz
              <br />
              size: {{ formatSize(meta.sizeZip) }}
            </div>
            <b-button @click="download">Download</b-button>
            <br />
            <br />

            <div v-if="!isLoadingMeta">
              <b-collapse
                :open="false"
                class="card"
                aria-id="contentIdForA11y3"
              >
                <div
                  slot="trigger"
                  slot-scope="props"
                  class="card-header"
                  role="button"
                  aria-controls="contentIdForA11y3"
                >
                  <p class="card-header-title">
                    Number of files : {{ meta.files.filesName.length }}
                  </p>
                  <a class="card-header-icon">
                    <b-icon :icon="props.open ? 'caret-down' : 'caret-up'">
                    </b-icon>
                  </a>
                </div>
                <div class="card-content">
                  <div class="content">
                    <b-taglist>
                      <b-tag
                        v-for="(name, index) in meta.files.filesName"
                        :key="index"
                        type="is-info"
                      >
                        {{ name }}
                      </b-tag>
                    </b-taglist>
                  </div>
                </div>
              </b-collapse>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
/* eslint-disable new-cap */

import formatSizeImp from '../utils/formatSize'
import Download from '../utils/download'
import Keys from '../zip-encrypt/keys'
import abTools from '../utils/abTools'
import sendDownload from '../utils/sendDownload'
import encrypt from '../zip-encrypt/encrypt'
import streamSaver from '../utils/streamsaver'

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
      isLoadingMeta: true,
      key64: null,
      nonce: undefined,
      signNonce: undefined,
      keys: undefined,
      meta: undefined,
      progress: {
        status: 'Initialisation',
        value: undefined,
      },
      isLoading: false,
      fileStream: undefined,
      decipher: undefined,
    }
  },
  beforeRouteLeave(to, from, next) {
    if (!this.isLoading || this.confirmLeave()) {
      next()
    } else {
      // Cancel navigation
      next(false)
    }
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.onBeforeUnload)
  },
  created() {
    window.addEventListener('beforeunload', this.onBeforeUnload)

    this.init()
  },
  methods: {
    async init() {
      try {
        this.key64 = this.$router.currentRoute.hash.substr(1)
        this.nonce = await Download.getNonce(this.id)
        await this.getMeta()
      } catch (error) {
        this.$router.push('/NotFound')
      }
    },
    onBeforeUnload(e) {
      if (this.isLoading && !this.confirmLeave()) {
        // Cancel the event
        e.preventDefault()
        // Chrome requires returnValue to be set
        e.returnValue = ''
      }
    },
    confirmLeave() {
      // eslint-disable-next-line no-alert
      return window.confirm(
        'Do you really want to leave? you have cancel upload',
      )
    },

    // Toast functions
    toastOpen(msg, type) {
      if (this.$buefy.toast) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        this.$buefy.toast.open({
          message: msg,
          type,
        })
      }
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

    // main function
    async download() {
      this.isLoading = true

      this.fileStream = streamSaver.createWriteStream('files.tar.gz', {
        size: this.meta.sizeZip,
      })

      this.decipher = encrypt.createDecipherFile(
        await this.keys.getKeyFile(),
        this.meta.files.ivFiles,
      )

      try {
        this.decipher.setAuthTag(this.meta.authTag)
        await sendDownload.download(
          this.id,
          this.signNonce,
          this.fileStream,
          this.decipher,
          (size) => {
            this.progress.value = ((size / this.meta.sizeZip) * 100).toFixed(2)
            if (this.progress.value === '100.00' && this.isLoading) {
              this.isLoading = false
              this.$router.push('/')
              this.progress.status = 'Finish !!'
            } else {
              this.progress.status = 'downloading ...'
            }
          },
        )
      } catch (error) {
        this.isLoading = false
        this.toastDanger(error)
        this.decipher.once('error', () => {})
        this.decipher.destroy()
        this.fileStream.abort()
        this.$router.push('/expire')
      }
    },

    async getKeys() {
      const keys = new Keys(new Uint8Array(abTools.b642b(this.key64)))
      return keys
    },

    // functions get remote data
    async getMeta() {
      const metaEnc = await this.getRemoteData()
      this.meta = { sizeZip: metaEnc.sizeZip }
      this.meta.files = await this.decryptMeta(metaEnc)
      this.meta.authTag = metaEnc.authTag
      this.isLoadingMeta = false
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
