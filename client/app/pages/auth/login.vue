<script setup lang="ts">
import AuthFormCard from '~/components/auth/AuthFormCard.vue'
import AuthPageShell from '~/components/auth/AuthPageShell.vue'
</script>

<template>
  <AuthPageShell>
    <AuthFormCard mode="login" />
  </AuthPageShell>
</template>
