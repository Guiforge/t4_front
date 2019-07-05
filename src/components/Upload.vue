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
                <div class="field">
                  <b-switch>remove meta data</b-switch>
                </div>
                <b-field label="Number of days">
                  <b-numberinput
                    v-model="option.day"
                    min="1"
                    max="10"
                    controls-rounded
                  >
                  </b-numberinput>
                </b-field>
                <b-field label="Number of Download">
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
            <b-button type="is-primary" @click="zip_files()">
              Upload
            </b-button>
          </section>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
import zipFiles from '../zip-encrypt/zip'
import formatSizeImp from '../utils/formatSize'
import encrypt from '../zip-encrypt/encrypt'

export default {
  name: 'Upload',

  data() {
    return {
      option: {
        download: 1,
        day: 1,
      },
      dropFiles: [],
      zipGlob: null,
    }
  },
  methods: {
    deleteDropFile(index) {
      this.dropFiles.splice(index, 1)
    },
    formatSize(byte) {
      return formatSizeImp(byte, 10)
    },
    zip_files() {
      zipFiles(this.dropFiles)
        .then((zip) => {
          this.zipGlob = zip
          console.log('Bravo vous avez un super zip')
        })
        .catch((err) => {
          console.log(err)
        })
      encrypt(this.dropFiles)
    },
  },
}
</script>
