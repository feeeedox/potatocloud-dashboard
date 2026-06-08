<script lang="ts" setup>
const { data } = await useAsyncData('groups', () =>
  $fetch('http://localhost:8080/api/groups', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
  }),
)

function testRequest() {
  console.warn(data.value)
}
</script>

<template>
  <div>
    <Button @click="testRequest">
      Test
    </Button>
  </div>
</template>
