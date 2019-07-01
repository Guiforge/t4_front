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
            <div class="tags">
              <span
                v-for="(file, index) in dropFiles"
                :key="index"
                class="tag is-primary"
              >
                {{ file.name }}
                <button
                  class="delete is-small"
                  type="button"
                  @click="deleteDropFile(index)"
                ></button>
              </span>
            </div>
          </section>
          <div v-if="dropFiles.length">
            TOTO
          </div>
          <br />
          <b-button type="is-primary" @click="process_files()">
            Upload
          </b-button>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
import encrypt from '../zip-encrypt/encrypt'

export default {
  name: 'Upload',

  data() {
    return {
      dropFiles: [],
    }
  },
  methods: {
    deleteDropFile(index) {
      this.dropFiles.splice(index, 1)
    },
    process_files() {
      encrypt(this.dropFiles)
    },
  },
}
</script>
