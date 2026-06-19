<script setup lang="ts">
type Todo = {
  id: number
  title: string
  done: boolean
}

const newTodo = ref('')
const todos = ref<Todo[]>([
  {
    id: 1,
    title: 'Belajar Nuxt UI',
    done: false
  },
  {
    id: 2,
    title: 'Build Todo List',
    done: true
  }
])

const completedTodos = computed(() => todos.value.filter(todo => todo.done).length)
const totalTodos = computed(() => todos.value.length)

function addTodo() {
  const title = newTodo.value.trim()

  if (!title) return

  todos.value.unshift({
    id: Date.now(),
    title,
    done: false
  })

  newTodo.value = ''
}

function removeTodo(id: number) {
  todos.value = todos.value.filter(todo => todo.id !== id)
}

function clearCompleted() {
  todos.value = todos.value.filter(todo => !todo.done)
}
</script>

<template>
  <div class="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
    <UPageHero
      title="Todo List"
      description="Simple todo app built with Nuxt UI. Add tasks, mark them as done, and keep your workflow clean."
      :links="[{
        label: 'Total: ' + totalTodos,
        color: 'primary',
        size: 'xl'
      }, {
        label: 'Done: ' + completedTodos,
        color: 'neutral',
        variant: 'subtle',
        size: 'xl'
      }]"
    />

    <UPageSection>
      <div class="mx-auto max-w-2xl space-y-6">
        <UCard>
          <form class="flex gap-3" @submit.prevent="addTodo">
            <UInput
              v-model="newTodo"
              placeholder="Add new task..."
              size="xl"
              class="flex-1"
            />

            <UButton
              color="primary"
              type="submit"
              size="xl"
              icon="i-lucide-plus"
            >
              Add
            </UButton>
          </form>
        </UCard>

        <div v-if="todos.length" class="space-y-3">
          <UCard
            v-for="todo in todos"
            :key="todo.id"
            class="transition hover:shadow-md"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <UCheckbox v-model="todo.done" />

                <p
                  class="text-base font-medium"
                  :class="todo.done ? 'text-neutral-400 line-through' : 'text-neutral-900 dark:text-white'"
                >
                  {{ todo.title }}
                </p>
              </div>

              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                @click="removeTodo(todo.id)"
              />
            </div>
          </UCard>
        </div>

        <UCard v-else>
          <div class="py-10 text-center">
            <UIcon
              name="i-lucide-list-checks"
              class="mx-auto mb-4 size-10 text-primary"
            />

            <h3 class="text-lg font-semibold">
              No tasks yet
            </h3>

            <p class="mt-1 text-sm text-neutral-500">
              Add your first task above.
            </p>
          </div>
        </UCard>

        <div v-if="completedTodos > 0" class="flex justify-center">
          <UButton
            color="neutral"
            variant="subtle"
            icon="i-lucide-eraser"
            @click="clearCompleted"
          >
            Clear completed
          </UButton>
        </div>
      </div>
    </UPageSection>
  </div>
</template>