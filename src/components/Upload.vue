<template>
  <div class="box" style="margin:2em">
    <!-- Display Step-->
    <section>
      <b-steps :has-navigation="false" v-model="step" size="is-large">
        <b-step-item label="Import Files" icon="file-import"></b-step-item>
        <b-step-item label="Upload" icon="upload"></b-step-item>
        <b-step-item label="Share it" icon="paper-plane"></b-step-item>
      </b-steps>
    </section>

    <!-- Step 2 share  -->
    <b-collapse v-if="url !== null" class="card" aria-id="contentIdForA11y3">
      <div
        slot="trigger"
        slot-scope="props"
        class="card-header"
        role="button"
        aria-controls="contentIdForA11y3"
      >
        <h2 class="card-header-title">
          Your super Download Url !
        </h2>
        <a class="card-header-icon">
          <b-icon :icon="props.open ? 'caret-down' : 'caret-up'"> </b-icon>
        </a>
      </div>
      <div class="card-content">
        <div class="content">
          <p>
            This url will expire in
            <strong>{{ option.download }}</strong> downloads or in
            <strong>{{ option.day }}</strong> days
          </p>
          <b-field>
            <p class="control">
              <span class="button is-static">URL:</span>
            </p>
            <b-input
              id="to-copy"
              :value="url"
              class="is-rounded"
              type="text"
              readonly
              expanded
            ></b-input>
          </b-field>
          <b-field>
            <button class="button is-primary" @click="toCopyUrl()">
              Copy Url
            </button>
          </b-field>
        </div>
      </div>
    </b-collapse>

    <!-- Step One -->
    <article v-else class="media">
      <div class="media-content">
        <div class="content" style="text-align: center">
          <h1>Uploads your files!</h1>
          <section>
            <b-field>
              <b-upload
                v-model="dropFiles"
                multiple
                drag-drop
                @input="changeStep(true)"
              >
                <section class="section">
                  <div class="content has-text-centered">
                    <p>
                      <b-icon icon="upload" size="is-large"> </b-icon>
                    </p>
                    <p>Drop your files here or click to upload</p>
                  </div>
                </section>
              </b-upload>
            </b-field>
            <section>
              <div v-if="dropFiles.length" class="container">
                <div class="notification">
                  <div class="tags">
                    <b-tag
                      v-for="(file, index) in dropFiles"
                      :key="index"
                      type="is-info"
                      size="is-large"
                    >
                      <strong>{{ file.name }}</strong>
                      <small> {{ formatSize(file.size) }}</small>
                      <b-button
                        size="is-small"
                        class="delete"
                        delete
                        @click="
                          deleteDropFile(index)
                          changeStep(false)
                        "
                      >
                      </b-button>
                    </b-tag>
                  </div>
                </div>
              </div>
            </section>
            <div v-if="dropFiles.length" class="container">
              <div class="notification">
                <b-field label="Number of days">
                  <b-numberinput
                    v-model="option.day"
                    min="1"
                    max="10"
                    controls-rounded
                  >
                  </b-numberinput>
                </b-field>
                <b-field label="Number of download">
                  <b-numberinput
                    v-model="option.download"
                    min="1"
                    max="10"
                    controls-rounded
                  >
                  </b-numberinput>
                </b-field>
              </div>
            </div>
            <br />
            <b-button type="is-primary" @click="process()">
              Upload
            </b-button>
          </section>
        </div>
      </div>
    </article>

    <b-loading
      :is-full-page="true"
      :active.sync="isLoading"
      :can-cancel="true"
    ></b-loading>
  </div>
</template>

<script>
import zipFiles from '../zip-encrypt/zip'
import formatSizeImp from '../utils/formatSize'
import KeysConstruct from '../zip-encrypt/keys'
import EncryptConstruct from '../zip-encrypt/encrypt'
import { Sender } from '../utils/sendUpload'

export default {
  name: 'Upload',

  data() {
    return {
      step: 0,
      url: null,
      isLoading: false,
      option: {
        download: 1,
        day: 1,
      },
      dropFiles: [],
    }
  },
  methods: {
    changeStep(isAdd) {
      if (isAdd) {
        this.step = this.step ? this.step : this.step + 1
      } else {
        this.step = this.dropFiles.length ? this.step : this.step - 1
      }
    },
    toCopyUrl() {
      const toCopy = document.getElementById('to-copy')
      toCopy.select()
      document.execCommand('copy')
      this.toastSuccess('Url Copied !')
      return false
    },
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
    deleteDropFile(index) {
      this.dropFiles.splice(index, 1)
    },
    formatSize(byte) {
      return formatSizeImp(byte, 10)
    },
    process() {
      this.isLoading = true
      zipFiles(this.dropFiles)
        .then((zip) => {
          zip
            .generateAsync({
              name: 'Zip.zip',
              type: 'arraybuffer',
              compression: 'DEFLATE',
              compressionOptions: {
                level: 9,
              },
            })
            .then((zipfile) => {
              this.step = 2
              this.toastSuccess('whe have zip all file with super encryption')
              const keys = new KeysConstruct()
              const encrypt = new EncryptConstruct(
                keys,
                { filesName: this.dropFiles },
                zipfile,
              )
              const sender = new Sender(keys, encrypt, this.option)
              sender
                .send()
                .then((url) => {
                  this.isLoading = false
                  this.url = `${url}#${keys.getSecret()}`
                  this.toastSuccess('It is send')
                })
                .catch(() => {
                  this.isLoading = false
                  this.toastDanger('Send fail')
                })
            })
        })
        .catch((fileName) => {
          this.toastDanger(`Error in ${fileName}`)
        })
    },
  },
}
</script>
