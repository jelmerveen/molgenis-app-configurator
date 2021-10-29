<template>
  <div id="app" @keyup.ctrl.f="format" class="p-1">
    <select class="form-select mb-2 p-1 input-item" v-model="selectedAppId">
      <option :key="app.id" v-for="app in appsList" :value="app.id">
        {{ app.label || app.name }}
      </option>
    </select>
    <div ref="editor" class="editor"></div>
    <button @click="save" class="btn btn-primary mt-2 px-5 input-item">
      Save
    </button>
    <span id="message" class="m-3"></span>
  </div>
</template>

<script>
import * as monaco from 'monaco-editor'

export default {
  name: 'MolgenisAppConfigurator',
  data () {
    return {
      editor: {},
      appsList: [],
      selectedAppId: ''
    }
  },
  watch: {
    async selectedAppId () {
      await this.fetchData()
      const appConfig = this.appsList.find(
        (app) => app.id === this.selectedAppId
      ).appConfig
      this.editor.getModel().setValue(appConfig)
    }
  },
  methods: {
    format () {
      this.editor.getAction('editor.action.formatDocument').run()
    },
    async save () {
      const appConfig = this.editor.getValue()

      const result = await fetch(`/api/data/sys_App/${this.selectedAppId}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin',
        method: 'PATCH',
        body: JSON.stringify({ appConfig })
      })
      document.getElementById('message').innerText =
        result.status < 400 ? 'Success!' : 'Failed to save'
    },
    async fetchData () {
      const results = await fetch('/api/data/sys_App')
      const rows = await results.json()

      this.appsList = rows.items.map((item) => item.data)
    }
  },
  async beforeMount () {
    await this.fetchData()
    this.selectedAppId = this.appsList[0].id
  },
  mounted () {
    this.editor = monaco.editor.create(this.$refs.editor, {
      value: '',
      language: 'json'
    })
  }
}
</script>

<style>
#app {
  margin: 0 auto;
  width: 90vw;
  display: flex;
  flex-flow: column;
  align-items: center;
}

.input-item {
  align-self: flex-start;
}

.editor {
  border: 1px solid black;
  height: 65vh;
  width: 100%;
}
</style>
