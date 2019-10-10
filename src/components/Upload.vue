<template>
  <div class="box" style="margin:2em">
    <!-- Display Step-->
    <section>
      <b-steps :has-navigation="false" v-model="step" style="overflow: auto;">
        <b-step-item label="Import Files" icon="file-import"></b-step-item>
        <b-step-item label="Upload" icon="upload"></b-step-item>
        <b-step-item label="Share it" icon="paper-plane"></b-step-item>
      </b-steps>
    </section>

    <!-- Step 2 share  -->
    <b-collapse
      v-if="url !== null && !isLoading"
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
            <strong>{{ option.down }}</strong> downloads or in
            <strong>{{ option.days }}</strong> days
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
            >
            </b-input>
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
    <article v-else-if="!isLoading" class="media">
      <div class="media-content" style="width: -webkit-fill-available;">
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
              <div v-if="dropFiles.length">
                <b-collapse class="card" aria-id="contentIdForA11y3">
                  <div
                    slot="trigger"
                    slot-scope="props"
                    class="card-header"
                    role="button"
                    aria-controls="contentIdForA11y3"
                  >
                    <p class="card-header-title">
                      Number of files : {{ dropFiles.length }} --
                      {{ globalSize() }}
                    </p>
                    <a class="card-header-icon">
                      <b-icon :icon="props.open ? 'caret-down' : 'caret-up'">
                      </b-icon>
                    </a>
                  </div>
                  <div class="card-content">
                    <div class="content">
                      <section>
                        <b-notification
                          v-for="(file, index) in dropFiles"
                          :key="index"
                          type="is-info"
                          aria-close-label="Close notification"
                          @close="
                            deleteDropFile(index)
                            changeStep(false)
                          "
                        >
                          <strong>{{ file.name }}</strong>
                          <small> {{ formatSize(file.size) }}</small>
                        </b-notification>
                      </section>
                    </div>
                  </div>
                </b-collapse>
              </div>
            </section>
            <br />
            <br />
            <br />
            <div v-if="dropFiles.length" class="container">
              <b-field label="Number of days">
                <b-numberinput
                  v-model="option.days"
                  min="1"
                  max="10"
                  controls-rounded
                >
                </b-numberinput>
              </b-field>
              <b-field label="Number of download">
                <b-numberinput
                  v-model="option.down"
                  min="1"
                  max="10000"
                  controls-rounded
                >
                </b-numberinput>
              </b-field>
            </div>
            <br />
            <b-button
              v-if="dropFiles.length"
              type="is-primary"
              @click="process()"
            >
              Upload
            </b-button>
            <b-button v-if="!dropFiles.length" type="is-primary" disabled>
              Upload
            </b-button>
          </section>
        </div>
      </div>
    </article>

    <!-- Step Progress -->
    <div v-if="isLoading">
      <h2 v-if="progress.status && progress.status !== null">
        {{ progress.status }}
      </h2>
      <h3 v-if="progress.value">({{ progress.value }}%)</h3>
      <progress :value="progress.value" class="progress is-info" max="100">
      </progress>
    </div>
  </div>
</template>

<script>
/* eslint-disable security/detect-non-literal-fs-filename */

import crypto from 'crypto'
import formatSizeImp from '../utils/formatSize'
import Process from '../zip-encrypt/process'
import getUrl from '../utils/getUrl'

export default {
  name: 'Upload',

  data() {
    return {
      step: 0,
      url: null,
      isLoading: false,
      option: {
        down: 1,
        days: 1,
      },
      processObject: new Process(undefined, (status, value) => {
        if (status) {
          this.progress.status = status
        }
        if (value) {
          this.progress.value = value
        }
      }),
      progress: {
        status: 'Initialisation',
        value: undefined,
      },
      dropFiles: [],
      owner: undefined,
      filesStock: undefined,
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

  created() {
    window.addEventListener('beforeunload', this.onBeforeUnload)
  },

  beforeDestroy() {
    window.removeEventListener('beforeunload', this.onBeforeUnload)
  },

  mounted() {
    if (localStorage) {
      this.owner = localStorage.getItem('owner')
      this.filesStock = JSON.parse(localStorage.getItem('files'))
    }
    if (!this.owner) {
      this.owner = crypto.randomBytes(256).toString('hex')
      localStorage.setItem('owner', this.owner)
      localStorage.setItem('files', '[]')
    }
  },

  methods: {
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
      if (this.$buefy.toast) {
        this.$buefy.toast.open({
          message: msg,
          type,
        })
      } else {
        console.log('toast', { msg, type })
      }
    },
    toastSuccess(msg) {
      this.toastOpen(msg, 'is-success')
    },
    toastDanger(msg) {
      this.toastOpen(msg, 'is-danger')
      this.$buefy.snackbar.open({
        message: 'Do you want to try again ?',
        type: 'is-warning',
        position: 'is-bottom-right',
        actionText: 'Retry',
        onAction: () => {
          this.process()
        },
      })
    },
    deleteDropFile(index) {
      this.dropFiles.splice(index, 1)
    },
    formatSize(byte) {
      return formatSizeImp(byte, 10)
    },
    globalSize() {
      let acc = 0
      this.dropFiles.forEach((file) => {
        acc += file.size
      })
      return this.formatSize(acc)
    },
    addNewFile() {
      if (!localStorage) {
        return
      }
      const date = new Date(Date.now())
      date.setDate(date.getDate() + this.option.days)
      const objFile = {
        id: this.processObject.getIdFile(),
        createDate: new Date(Date.now()),
        down: this.option.down,
        dayDiff: date,
      }
      this.filesStock.push(objFile)
      localStorage.setItem('files', JSON.stringify(this.filesStock))
    },
    onErrorProcess(error) {
      if (this.processObject.getError()) {
        this.toastDanger(this.processObject.getError())
      } else if (!error || `${error.name}` === 'TypeError') {
        this.toastDanger('Intern Error')
      } else {
        this.toastDanger(`${error}`)
      }
      this.isLoading = false
    },
    async process() {
      this.isLoading = true
      try {
        const secretRaw = await this.processObject.keys
          .getSecret()
          .toString('base64')
        this.processObject.opt = this.option
        await this.processObject.launch(
          this.dropFiles,
          this.owner,
          this.onErrorProcess,
        )
        this.url = `${getUrl.download()}${this.processObject.getIdFile()}#${secretRaw}`
        this.addNewFile()
        this.step = 2
        this.toastSuccess('Sent !!')
      } catch (error) {
        this.onErrorProcess(error)
      }
      this.isLoading = false
    },
  },
}
</script>
<style>
overFlow_perso {
  width: -webkit-fill-available;
  overflow: hidden;
}
</style>
