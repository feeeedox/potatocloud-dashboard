<script lang="ts" setup>
import type { CloudProperty } from '~/types/cloud'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'

const emit = defineEmits(['add'])
const open = ref(false)
const { handleSubmit, errors, defineField, isSubmitting, resetForm } = useForm(({
  validationSchema: toTypedSchema(propertySchema),
  initialValues: {
    name: '',
    value: '',
    defaultValue: '',
  },
}))

const [name, nameProps] = defineField('name')
const [value, valueProps] = defineField('value')
const [defaultValue, defaultValueProps] = defineField('defaultValue')

const onSubmit = handleSubmit(async (values) => {
  const property: CloudProperty = {
    name: values.name,
    value: values.value,
    defaultValue: values.defaultValue,
  }

  emit('add', property)
  open.value = false

  resetForm({
    values: {
      name: '',
      value: '',
      defaultValue: '',
    },
  })
})

function close() {
  open.value = false
  resetForm({
    values: {
      name: '',
      value: '',
      defaultValue: '',
    },
  })
}
</script>

<template>
  <Dialog v-model:open="open">
    <form @submit="onSubmit">
      <DialogTrigger>
        <Button size="sm" variant="outline">
          Add Property
        </Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a new property to this group</DialogTitle>
        </DialogHeader>

        <div class="grid gap-4">
          <div class="grid gap-3">
            <Label for="name">Name</Label>
            <Input id="name" v-model="name" :class="{ 'border-destructive': errors.name }" :disabled="isSubmitting" name="name" placeholder="isCool" v-bind="nameProps" />
            <span v-if="errors.name" class="text-sm text-destructive">
              {{ errors.name }}
            </span>
          </div>
          <div class="grid gap-3">
            <Label for="value">Value</Label>
            <Input id="value" v-model="value" :class="{ 'border-destructive': errors.value }" :disabled="isSubmitting" name="value" placeholder="true" v-bind="valueProps" />
            <span v-if="errors.value" class="text-sm text-destructive">
              {{ errors.value }}
            </span>
          </div>
          <div class="grid gap-3">
            <Label for="defaultValue">Default Value</Label>
            <Input id="defaultValue" v-model="defaultValue" :class="{ 'border-destructive': errors.defaultValue }" :disabled="isSubmitting" name="defaultValue" placeholder="false" v-bind="defaultValueProps" />
            <span v-if="errors.defaultValue" class="text-sm text-destructive">
              {{ errors.defaultValue }}
            </span>
          </div>
        </div>
        <DialogFooter>
          <DialogClose as-child>
            <Button
              variant="outline" @click="close"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button :disabled="isSubmitting" type="submit" @click="onSubmit">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </form>
  </Dialog>
</template>
