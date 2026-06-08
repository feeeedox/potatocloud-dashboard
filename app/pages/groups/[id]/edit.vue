<script lang="ts" setup>
import type { CloudGroup, CloudPlatform, CloudProperty } from '~/types/cloud'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { updateGroupSchema } from '~/lib/schemas'

const route = useRoute()
const groupId = route.params.id as string

const { data: platforms } = await useFetch<CloudPlatform[]>(
  '/api/cloud/platform',
  {
    default: () => [],
  },
)

const { data: groupDetails } = await useFetch(`/api/cloud/group/${groupId}`, {
  default: () => null,
})

const groupObject = groupDetails.value as CloudGroup

const { handleSubmit, errors, defineField, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(updateGroupSchema),
  initialValues: {
    name: groupObject.name,
    serviceTemplates: groupObject.serviceTemplates,
    platform: groupObject.platform.name,
    platformVersion: groupObject.platformVersion.name,
    minOnlineCount: groupObject.minOnlineCount,
    maxOnlineCount: groupObject.maxOnlineCount,
    maxPlayerCount: groupObject.maxPlayerCount,
    maxMemory: groupObject.maxMemory,
    fallback: groupObject.fallback,
    static: groupObject.static,
    useModernVelocityForwarding: groupObject.useModernVelocityForwarding,
    startPriority: groupObject.startPriority,
    newServicePercent: groupObject.newServicePercent,
    startCommand: groupObject.javaCommand,
    customJvmFlags: groupObject.customJvmFlags,
    properties: groupObject.properties,
  },
})

const [serviceTemplates, serviceTemplatesProps]
  = defineField('serviceTemplates')
const [platform, platformProps] = defineField('platform')
const [platformVersion, platformVersionProps] = defineField('platformVersion')
const [minOnlineCount, minOnlineCountProps] = defineField('minOnlineCount')
const [maxOnlineCount, maxOnlineCountProps] = defineField('maxOnlineCount')
const [maxPlayerCount, maxPlayerCountProps] = defineField('maxPlayerCount')
const [maxMemory, maxMemoryProps] = defineField('maxMemory')
const [fallback, fallbackProps] = defineField('fallback')
const [isStatic, staticProps] = defineField('static')
const [useModernVelocityForwarding, useModernVelocityForwardingProps]
  = defineField('useModernVelocityForwarding')
const [startPriority, startPriorityProps] = defineField('startPriority')
const [newServicePercent, newServicePercentProps]
  = defineField('newServicePercent')
const [startCommand, startCommandProps] = defineField('startCommand')
const [customJvmFlags, _customJvmFlagsProps] = defineField('customJvmFlags')
const [properties, _propertiesProps] = defineField('properties')

const selectedPlatform = ref<string | null>(null)

const platformVersions = computed(() => {
  if (!platform.value || !platforms.value)
    return []

  const foundPlatform = platforms.value.find(p => p.name === platform.value)
  return foundPlatform?.versions ?? []
})

watch(platform, () => {
  platformVersion.value = ''
})

const isProxyBased = computed(() => {
  if (!platform.value || !platforms.value)
    return false
  const foundPlatform = platforms.value.find(p => p.name === platform.value)
  return foundPlatform?.proxy ?? false
})

function addCustomJvmFlag(flag: string) {
  const trimmedFlag = flag.trim()
  const currentFlags = customJvmFlags.value || []

  if (trimmedFlag && !currentFlags.includes(trimmedFlag)) {
    customJvmFlags.value = [...currentFlags, trimmedFlag]
  }
}

function removeJvmFlag(flagToRemove: string) {
  customJvmFlags.value = (customJvmFlags.value || []).filter(
    f => f !== flagToRemove,
  )
}

function addCustomProperty(property: CloudProperty) {
  const currentProps = properties.value || []
  if (!currentProps.some(p => p.name === property.name)) {
    properties.value = [...currentProps, property]
  }
}
function removeProperty(index: number) {
  const currentProps = [...(properties.value || [])]
  currentProps.splice(index, 1)
  properties.value = currentProps
}

const { runAction } = useApiAction()

const onSubmit = handleSubmit(async (values) => {
  await runAction(
    () =>
      $fetch<any>(`/api/cloud/group/${groupId}/update`, {
        method: 'POST',
        body: values,
      }),
    'The group has been successfully updated.',
  )

  resetForm()
  await navigateTo('/groups')
})
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          Edit {{ groupId }}
        </h2>
        <p class="text-sm text-muted-foreground">
          Configure the settings for this server group. Make sure to save your
          changes when you're done.
        </p>
      </div>
    </div>

    <Separator />

    <Card>
      <CardHeader>
        <CardTitle>Group Configuration</CardTitle>
        <CardDescription>
          Define the basic settings and platform for your new server group.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form class="grid gap-6" @submit="onSubmit">
          <div class="grid gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col gap-2">
                <Label class="font-medium" for="group-name"> Group Name </Label>
                <Input id="group-name" v-model="groupObject.name" class="max-w-md" disabled placeholder="e.g. lobby" />
                <p class="text-xs text-muted-foreground">
                  This name is used to identify the group internally.
                </p>
              </div>
              <div class="flex flex-col gap-2">
                <Label class="font-medium" for="group-name">
                  Service Templates
                </Label>
                <TagsInput v-model="serviceTemplates" placeholder="new-template" v-bind="serviceTemplatesProps" />
                <p class="text-xs text-muted-foreground">
                  The service templates that are used to merge existing data
                  (e.g. worlds, plugins) when starting new services in this
                  group.
                </p>
                <span v-if="errors.serviceTemplates" class="text-sm text-destructive">
                  {{ errors.serviceTemplates }}
                </span>
              </div>
            </div>

            <Separator />

            <div class="grid gap-4">
              <h3 class="text-lg font-semibold tracking-tight">
                Platform Settings
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <Label class="font-medium" for="platform">
                    Which platform should be used?
                  </Label>
                  <Select id="platform" v-model="platform" disabled v-bind="platformProps">
                    <SelectTrigger :class="{ 'border-destructive': errors.platform }">
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="platform in platforms" :key="platform.name" :value="platform.name">
                        {{ platform.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <span v-if="errors.platform" class="text-sm text-destructive">
                    {{ errors.platform }}
                  </span>
                </div>

                <div class="flex flex-col gap-2">
                  <Label class="font-medium" for="platform-version">
                    Which version of the platform?
                  </Label>
                  <Select id="platform-version" v-model="platformVersion" disabled v-bind="platformVersionProps">
                    <SelectTrigger :class="{ 'border-destructive': errors.platformVersion }">
                      <SelectValue
                        :placeholder="selectedPlatform
                          ? 'Select a version'
                          : 'Select a platform first'
                        "
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="version in platformVersions" :key="version.name" :value="version.name">
                        {{ version.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <span v-if="errors.platformVersion" class="text-sm text-destructive">
                    {{ errors.platformVersion }}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div class="grid gap-4">
              <h3 class="text-lg font-semibold tracking-tight">
                Service Settings
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <Label class="font-medium" for="min-online">
                    How many services should always be online?
                  </Label>
                  <NumberField
                    id="min-online" v-model="minOnlineCount" :default-value="1" :min="0"
                    v-bind="minOnlineCountProps"
                  >
                    <NumberFieldContent>
                      <NumberFieldDecrement />
                      <NumberFieldInput :class="{ 'border-destructive': errors.minOnlineCount }" />
                      <NumberFieldIncrement />
                    </NumberFieldContent>
                  </NumberField>
                  <span v-if="errors.minOnlineCount" class="text-sm text-destructive">
                    {{ errors.minOnlineCount }}
                  </span>
                </div>
                <div class="flex flex-col gap-2">
                  <Label class="font-medium" for="max-players">
                    What is the maximum of services that can be online in this
                    group?
                  </Label>
                  <NumberField
                    id="max-services" v-model="maxOnlineCount" :default-value="100" :min="0"
                    v-bind="maxOnlineCountProps"
                  >
                    <NumberFieldContent>
                      <NumberFieldDecrement />
                      <NumberFieldInput :class="{ 'border-destructive': errors.maxOnlineCount }" />
                      <NumberFieldIncrement />
                    </NumberFieldContent>
                  </NumberField>
                  <span v-if="errors.maxOnlineCount" class="text-sm text-destructive">
                    {{ errors.maxOnlineCount }}
                  </span>
                </div>
                <div class="flex flex-col gap-2">
                  <Label class="font-medium" for="max-players">
                    What is the maximum of players that can be online in this
                    group?
                  </Label>
                  <NumberField
                    id="max-players" v-model="maxPlayerCount" :default-value="100" :min="0"
                    v-bind="maxPlayerCountProps"
                  >
                    <NumberFieldContent>
                      <NumberFieldDecrement />
                      <NumberFieldInput :class="{ 'border-destructive': errors.maxPlayerCount }" />
                      <NumberFieldIncrement />
                    </NumberFieldContent>
                  </NumberField>
                  <span v-if="errors.maxPlayerCount" class="text-sm text-destructive">
                    {{ errors.maxPlayerCount }}
                  </span>
                </div>
                <div class="flex flex-col gap-2">
                  <Label class="font-medium" for="max-ram">
                    What is the maximum memory (RAM) that each service in this
                    group can use? (in MB)
                  </Label>
                  <NumberField id="max-ram" v-model="maxMemory" :default-value="1024" :min="0" v-bind="maxMemoryProps">
                    <NumberFieldContent>
                      <NumberFieldDecrement />
                      <NumberFieldInput :class="{ 'border-destructive': errors.maxMemory }" />
                      <NumberFieldIncrement />
                    </NumberFieldContent>
                  </NumberField>
                  <span v-if="errors.maxMemory" class="text-sm text-destructive">
                    {{ errors.maxMemory }}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div class="grid gap-4">
              <h3 class="text-lg font-semibold tracking-tight">
                Additional Settings
              </h3>

              <div class="flex flex-col gap-2">
                <Label class="font-medium" for="is-fallback">
                  Is this a fallback group? (Should be enabled for the Lobby)
                </Label>
                <Switch id="is-fallback" v-model="fallback" v-bind="fallbackProps" />
                <span v-if="errors.fallback" class="text-sm text-destructive">
                  {{ errors.fallback }}
                </span>
              </div>
              <div class="flex flex-col gap-2">
                <Label class="font-medium" for="is-static">
                  Are services in this group static? (Service files are not
                  deleted when stopped)
                </Label>
                <Switch id="is-static" v-model="isStatic" disabled v-bind="staticProps" />
                <span v-if="errors.static" class="text-sm text-destructive">
                  {{ errors.static }}
                </span>
              </div>
              <div v-if="isProxyBased">
                <div class="flex flex-col gap-2">
                  <Label class="font-medium" for="is-default-proxy">
                    Do you want to use Velocity modern forwarding? Modern
                    forwarding is more secure but will break support for
                    versions below 1.13
                  </Label>
                  <Switch
                    id="is-default-proxy" v-model="useModernVelocityForwarding"
                    v-bind="useModernVelocityForwardingProps"
                  />
                  <span v-if="errors.useModernVelocityForwarding" class="text-sm text-destructive">
                    {{ errors.useModernVelocityForwarding }}
                  </span>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <Label class="font-medium" for="start-priority">
                    What is the start priority of this group? (Services in
                    groups with higher priority are started first)
                  </Label>
                  <NumberField
                    id="start-priority" v-model="startPriority" :default-value="1" :min="0"
                    v-bind="startPriorityProps"
                  >
                    <NumberFieldContent>
                      <NumberFieldDecrement />
                      <NumberFieldInput :class="{ 'border-destructive': errors.startPriority }" />
                      <NumberFieldIncrement />
                    </NumberFieldContent>
                  </NumberField>
                  <span v-if="errors.startPriority" class="text-sm text-destructive">
                    {{ errors.startPriority }}
                  </span>
                </div>
                <div class="flex flex-col gap-2">
                  <Label class="font-medium" for="player-percentage">
                    At which percentage of online players should new services in
                    this group be started? (-1 = disabled)
                  </Label>
                  <NumberField
                    id="player-percentage" v-model="newServicePercent" :default-value="80" :min="-1"
                    v-bind="newServicePercentProps"
                  >
                    <NumberFieldContent>
                      <NumberFieldDecrement />
                      <NumberFieldInput
                        :class="{
                          'border-destructive': errors.newServicePercent,
                        }"
                      />
                      <NumberFieldIncrement />
                    </NumberFieldContent>
                  </NumberField>
                  <span v-if="errors.newServicePercent" class="text-sm text-destructive">
                    {{ errors.newServicePercent }}
                  </span>
                </div>
              </div>

              <Accordion collapsible type="single">
                <AccordionItem value="item-1">
                  <AccordionTrigger> Advanced Settings </AccordionTrigger>
                  <AccordionContent class="flex flex-col gap-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="flex flex-col gap-2">
                        <Label class="font-medium" for="java-command">
                          Java Command
                        </Label>
                        <Input
                          id="java-command" v-model="startCommand"
                          :class="{ 'border-destructive': errors.startCommand }" class="max-w-md" disabled
                          placeholder="java" v-bind="startCommandProps"
                        />
                        <p class="text-xs text-muted-foreground">
                          The command used to start the Java process. You can
                          customize this if you want to use a different Java
                          version or why ever else you might need it.
                        </p>
                        <span v-if="errors.startCommand" class="text-sm text-destructive">
                          {{ errors.startCommand }}
                        </span>
                      </div>
                      <div class="flex flex-col gap-2">
                        <Label class="font-medium" for="group-name">
                          Custom JVM Flags
                        </Label>
                        <Input
                          id="group-name" class="max-w-md" placeholder="e.g. -XX:+UseG1GC" @keydown.enter.prevent="
                            addCustomJvmFlag($event.target.value);
                            $event.target.value = '';
                          "
                        />
                        <div class="flex flex-row gap-1">
                          <Badge v-for="customFlag in customJvmFlags" :key="customFlag" variant="outline">
                            {{ customFlag }}
                            <Icon
                              class="ml-1 h-3 w-3 cursor-pointer" name="i-lucide-x"
                              @click="removeJvmFlag(customFlag)"
                            />
                          </Badge>
                        </div>
                        <p class="text-xs text-muted-foreground">
                          Additional JVM flags that are added to the Java
                          command when starting a service. You can use this to
                          e.g. add performance enhancing flags or enable remote
                          debugging.
                        </p>
                      </div>
                      <div class="col-span-2 flex flex-col gap-2">
                        <Label class="font-medium" for="group-name">
                          Properties
                        </Label>
                        <div class="flex flex-col gap-2">
                          <div
                            v-for="(property, index) in properties" :key="index"
                            class="flex flex-row items-center gap-2"
                          >
                            <PropertyBadge :property="property" @remove="removeProperty(index)" />
                          </div>
                          <GroupsAddPropertyDialog @add="addCustomProperty" />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter class="border-t px-6 flex justify-end gap-3">
        <Button variant="outline">
          Cancel
        </Button>
        <Button :disabled="isSubmitting" type="submit" @click="onSubmit">
          <Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" name="lucide:loader-2" />
          Update Group
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
