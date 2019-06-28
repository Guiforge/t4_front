<template>
  <div class="box" style="margin:2em">
    <article class="media">
      <div class="media-content">
        <div class="content" style="text-align: center">
          <h1>Uploads your files!</h1>
          <vue-dropzone
            id="dropZone"
            ref="MyDropZone"
            :options="dropzoneOptions"
            :use-custom-slot="true"
            @vdropzone-file-added="process_files"
          >
            <div class="dropzone-custom-content">
              <h3 class="dropzone-custom-title">
                Drag and drop to upload content!
              </h3>
              <div class="subtitle">
                ...or click to select a file from your computer
              </div>
            </div>
          </vue-dropzone>
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
    process_files(test) {
      console.log(test)
      const drop = this.$refs.MyDropZone
      encrypt(drop.getQueuedFiles()[0])
      console.log(drop.getUploadingFiles(), drop.getQueuedFiles())
      // drop.processQueue()
    },
  },
}
</script>
