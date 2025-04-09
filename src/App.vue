<template>
  <div class="w-full">
    <div v-for="command in commands">
      <div v-if="command.type == 'user'">
        <p><span class="text-yellow-500">{{user}}</span> in <span class="text-cyan-200">~</span></p>
        <div class="flex flex-row gap-2">
          <p class="text-green-200 font-bold">❯</p>
          <p>{{command.text}}</p>
        </div>
      </div>

      <div v-else-if="command.type == 'error'">
        <p class="text-red-500">{{command.text}}</p>
      </div>

      <div v-else-if="command.type == 'style'" v-html="command.text">
      </div>

      <p v-else>{{command.text}}</p>
    </div>

    <form @submit.prevent="submit" v-if="running == null">
      <p><span class="text-yellow-500">{{user}}</span> in <span class="text-cyan-200">~</span></p>
      <div class="flex flex-row gap-2">
        <p class="text-green-200 font-bold">❯</p>
        <input ref="commandInput" class="border-none w-full focus:outline-none focus:ring-0" type="text"
          v-model="input">
      </div>
    </form>
    <p v-else ref="commandInput"></p>
  </div>
</template>

<script setup>
  import {Command, handleCommand} from '@/commands';
  import {ref, watch, onMounted, onBeforeUnmount, nextTick} from 'vue'

  const user = ref("guest");
  const input = ref("");
  const commandInput = ref(null);
  const commands = ref([]);
  const storedCmd = ref([]);
  let index = 0;
  const running = ref(null);

  async function submit() {
    const text = input.value
    input.value = "";

    storedCmd.value.push(text);
    index = 0;

    if (text == "") {
      commands.value.push(new Command(text, "user"))
    }
    else if (text == "clear") {
      commands.value = [];
    }
    else {
      commands.value.push(new Command(text, "user"))
      const output = handleCommand(text, (command) => {
        commands.value.push(command)
        nextTick(() => {
          commandInput.value?.scrollIntoView({block: 'end'})
        })
      });
      console.log(output);
      if (output.cancel) {
        running.value = output.cancel;
      }
      if (output.promise) {
        await output.promise;
        running.value = null;
      }
    }

    nextTick(() => {
      commandInput.value?.scrollIntoView({block: 'end'})
    })
  }

  function handleKeydown(e) {
    // Arrow Up
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index < storedCmd.value.length) {
        index++;
      }
      input.value = storedCmd.value[storedCmd.value.length - index];
      console.log('Arrow up pressed');
      focus()
      return;
    }

    // Arrow Down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      index--;
      if (index < 0) {
        index = 0;
      }

      if (index == 0) {
        input.value = "";
      }
      else {
        input.value = storedCmd.value[storedCmd.value.length - index];
      }
      console.log('Arrow down pressed');
      focus()
      return;
    }



    // Ctrl+U
    if (e.ctrlKey && e.key.toLowerCase() === 'u') {
      e.preventDefault()
      console.log('Ctrl+U pressed')
      input.value = "";
      nextTick(() => {
        commandInput.value?.scrollIntoView({block: 'end'})
      })
      focus()
      return
    }

    // Ctrl+L
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault()
      console.log('Ctrl+L pressed')
      commands.value = [];
      input.value = "";
      nextTick(() => {
        commandInput.value?.scrollIntoView({block: 'end'})
      })
      focus()
      return
    }

    // Ctrl+C
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault()
      if (running.value != null) {
        running.value();
      }
      running.value = null;
      console.log('Ctrl+C pressed')
      focus()
      return
    }

    // Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
      e.preventDefault()

      const selection = window.getSelection()
      const text = selection ? selection.toString() : ''

      if (text) {
        navigator.clipboard.writeText(text)
          .then(() => console.log('Copied to clipboard:', text))
          .catch(err => console.error('Failed to copy text:', err))
      } else {
        console.log('No text selected.')
      }

      focus()
      return
    }
  }

  function focus() {
    commandInput.value.focus()
  }

  onMounted(() => {
    commands.value = JSON.parse(localStorage.getItem('commands') || '[]');
    if (commands.value.length == 0) {
      commands.value.push(new Command("welcome", "user"))
      handleCommand("welcome", (command) => {
        commands.value.push(command)
        nextTick(() => {
          commandInput.value?.scrollIntoView({block: 'end'})
        })
      });
    }
    storedCmd.value = JSON.parse(localStorage.getItem('storedCmd') || '[]');


    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('click', focus)
    nextTick(() => {
      commandInput.value?.scrollIntoView({block: 'end'})
    })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('click', focus)
  })

  watch(
    commands,
    (newCommands) => {
      localStorage.setItem('commands', JSON.stringify(newCommands))
    },
    {deep: true}
  )

  watch(
    storedCmd,
    (newCommands) => {
      localStorage.setItem('storedCmd', JSON.stringify(newCommands))
    },
    {deep: true}
  )
</script>
