<template>
  <div class="flex items-center gap-2 bg-foundation rounded-lg p-1">
    <button
      v-for="option in options"
      :key="option.value"
      @click="$emit('update:modelValue', option.value)"
      :class="[
        'px-4 py-2 text-sm font-medium rounded transition-colors',
        modelValue === option.value
          ? 'bg-primary text-primary-content'
          : 'text-foreground-muted hover:text-foreground'
      ]"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: 'weekly' | 'monthly' | 'yearly'
  label: string
}

const props = defineProps<{
  modelValue: 'weekly' | 'monthly' | 'yearly'
}>()

defineEmits<{
  'update:modelValue': [value: 'weekly' | 'monthly' | 'yearly']
}>()

const options: Option[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]
</script>

