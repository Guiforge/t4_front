<template>
  <div class="box" style="margin:2em">
    <article class="media">
      <div class="media-content">
        <div class="content" style="text-align: center">
          <h1>Uploads your files!</h1>
          <section>
            <b-field>
              <b-upload v-model="dropFiles" multiple drag-drop>
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
                        @click="deleteDropFile(index)"
                      >
                      </b-button>
                    </b-tag>
                  </div>
                </div>
              </div>
            </section>
            <div v-if="dropFiles.length" class="container">
              <div class="notification">
                <!-- <div class="field">
                  <b-switch>remove meta data</b-switch>
                </div> -->
                <b-field label="Number of days">
                  <b-numberinput
                    v-model="option.day"
                    min="1"
                    max="10"
                    controls-rounded
                  >
                  </b-numberinput>
                </b-field>
                <b-field label="Number of Upload">
                  <b-numberinput
                    v-model="option.Upload"
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
      isLoading: false,
      option: {
        Upload: 1,
        day: 1,
      },
      dropFiles: [],
      zipGlob: null,
    }
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
          this.zipGlob = zip
            .generateAsync({
              name: 'hello.zip',
              type: 'arraybuffer',
              compression: 'DEFLATE',
              compressionOptions: {
                level: 9,
              },
            })
            .then((zipfile) => {
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
                .then(() => {
                  this.isLoading = false
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
      // encrypt(this.dropFiles)
    },
  },
}
</script>
