<template>
  <div class="box" style="margin:2em">
    <article class="media">
      <div class="media-content">
        <div class="content" style="text-align: center">
          <h1>Uploads your files!</h1>
          <!-- <vue-dropzone
            id="dropZone"
            ref="MyDropZone"
            :options="dropzoneOptions"
            :use-custom-slot="true"
            @vdropzone-file-added="toto"
          >
            <div class="dropzone-custom-content">
              <h3 class="dropzone-custom-title">
                Drag and drop to upload content!
              </h3>
              <div class="subtitle">
                ...or click to select a file from your computer
              </div>
            </div>
          </vue-dropzone> -->
          <div class="file has-name is-fullwidth">
            <label class="file-label">
              <input
                ref="inputFile"
                class="file-input"
                type="file"
                @change="toto"
              />
              <span class="file-cta">
                <span class="file-icon">
                  <i class="fas fa-upload"></i>
                </span>
                <span class="file-label">
                  Choose a file…
                </span>
              </span>
              <span class="file-name">
                {{ toto() }}
              </span>
            </label>
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
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import encrypt from '../zip-encrypt/encrypt'

export default {
  name: 'Upload',
  components: {
    vueDropzone: vue2Dropzone,
  },
  data() {
    return {
      dropzoneOptions: {
        maxFiles: 1,
        url: '/fake',
        thumbnailWidth: 150,
        maxFilesize: 0.5,
        addRemoveLinks: true,
        uploadMultiple: true,
        autoProcessQueue: false,
      },
    }
  },
  methods: {
    process_files() {
      const drop = this.$refs.MyDropZone
      encrypt(drop.getQueuedFiles())
      // drop.processQueue()
    },
    toto() {
      /* eslint-disable */
      let ret = "choose file"
      const inp = this.$refs.inputFile
      if (inp && inp.files) {
        console.log(inp.files);
        for (let i = 0; i < inp.files.length; i++) {
          ret += inp.files[i].name;
          
        }
        console.log(ret);
      }
      return ret
    },
  },
}
</script>
