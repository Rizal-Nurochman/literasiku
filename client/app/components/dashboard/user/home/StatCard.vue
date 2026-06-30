<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon: string
  color: string
  description?: string
  loading?: boolean
}>()
</script>

<template>
  <UCard class="bg-default/80 backdrop-blur border-default shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors duration-300">
    <div class="flex items-start justify-between">
      <div class="space-y-2">
        <p class="text-sm font-medium text-muted">{{ title }}</p>
        
        <div v-if="loading" class="h-8 flex items-center">
          <UIcon name="i-lucide-loader-2" class="w-5 h-5 animate-spin text-muted" />
        </div>
        <p v-else class="text-3xl font-bold text-default">
          {{ value }}
        </p>
        
        <p v-if="description" class="text-xs text-muted">
          {{ description }}
        </p>
      </div>
      
      <div :class="`p-3 rounded-xl bg-${color}-500/10 text-${color}-500 ring-1 ring-inset ring-${color}-500/20 group-hover:scale-110 transition-transform duration-300`">
        <UIcon :name="icon" class="w-6 h-6" />
      </div>
    </div>
  </UCard>
</template>
