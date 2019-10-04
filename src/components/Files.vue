<template>
  <div class="container">
    <h1>FILES</h1>
    <p v-if="filesStock">You don't have file</p>
    <div v-for="(file, index) in filesStock" :key="index">
      <b-collapse class="card" aria-id="contentIdForA11y3">
        <div
          slot="trigger"
          slot-scope="props"
          class="card-header"
          role="button"
          aria-controls="contentIdForA11y3"
        >
          <p class="card-header-title">
            Archive {{ index }} --
            {{ new Date(file.createDate).toLocaleDateString() }}
          </p>
          <a class="card-header-icon">
            <b-icon :icon="props.open ? 'caret-down' : 'caret-up'"> </b-icon>
          </a>
        </div>
        <div class="card-content">
          <div class="content">
            Your file expires on
            {{ new Date(file.dayDiff).toLocaleDateString() }}
            days or in {{ file.down }} download(s)
          </div>
        </div>
        <footer class="card-footer">
          <b-button
            class="card-footer-item"
            @click="confirmCustomDelete(file.id)"
          >
            Delete
          </b-button>
        </footer>
      </b-collapse>
      <br />
    </div>
  </div>
</template>

<script>
import getUrl from '../utils/getUrl'

export default {
  /* eslint-disable-next-line */
  name: 'files',
  data() {
    return {
      owner: undefined,
      filesStock: undefined,
    }
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
    this.filesStock.forEach((file) => {
      this.checkInfo(file)
    })
  },
  methods: {
    snackOpen(msg, type) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      this.$buefy.snackbar.open({
        message: msg,
        type,
        position: 'is-bottom-right',
      })
    },
    snackSuccess(msg) {
      this.snackOpen(msg, 'is-success')
    },
    snackDanger(msg) {
      this.snackOpen(msg, 'is-danger')
    },
    updateLocalStorage() {
      localStorage.setItem('files', JSON.stringify(this.filesStock))
    },
    confirmCustomDelete(id) {
      this.$buefy.dialog.confirm({
        title: 'Deleting file',
        message:
          'Are you sure you want to <b>delete</b> your file? This action cannot be undone.',
        confirmText: 'Delete File',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => this.deleteFile(id),
      })
    },
    deleteFile(id) {
      const xhr = new XMLHttpRequest()
      xhr.onerror = () => {
        this.snackDanger('Error')
        this.deleteOne(id)
      }
      xhr.onload = (ev) => {
        if (ev.target.status === 200) {
          // eslint-disable-next-line no-param-reassign
          this.snackSuccess('The file is deleted')
          this.deleteOne(id)
        } else if (ev.target.status === 401) {
          this.snackDanger('Your are not Authorized')
          this.deleteOne(id)
        }
      }
      xhr.open('DELETE', getUrl.deleteFile(id), true)
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
      xhr.setRequestHeader('owner', this.owner)
      xhr.send()
    },
    deleteOne(id) {
      // eslint-disable-next-line prettier/prettier
      this.filesStock = this.filesStock.filter(file => file.id !== id)
      this.updateLocalStorage()
    },
    checkInfo(file) {
      const xhr = new XMLHttpRequest()
      xhr.onerror = () => {
        this.deleteOne(file.id)
      }
      xhr.onload = (ev) => {
        if (ev.target.status === 200) {
          const rep = JSON.parse(ev.target.response)
          // eslint-disable-next-line no-param-reassign
          file.down = rep.down
          this.updateLocalStorage()
        } else {
          this.deleteOne(file.id)
        }
      }
      xhr.open('GET', getUrl.getInfo(file.id), true)
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
      xhr.setRequestHeader('owner', this.owner)
      xhr.send()
    },
  },
}
</script>
<style scoped></style>
