<script lang="ts" setup>
import type {
  ApiProperty,
  GetApiV1PlatformsByNameResponse,
  GetApiV1PlatformsResponse,
  GroupCreateRequest,
} from '~/client/generated';
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner';
import { getApiV1Platforms, getApiV1PlatformsByName } from '~/client/generated';
import { postApiV1GroupsMutation } from '~/client/generated/@tanstack/vue-query.gen';

const { data: platforms } = useCloudQuery<GetApiV1PlatformsResponse>(getApiV1Platforms, 'platforms')

const { handleSubmit, errors, defineField, resetForm } = useForm<GroupCreateRequest>({
  validationSchema: toTypedSchema(newCreateGroupSchema),
  initialValues: {
    name: '',
    platform: '',
    platformVersion: '',
    minServices: 1,
    maxServices: 1,
    maxPlayerCount: 100,
    maxMemory: 1024,
    fallback: false,
    staticServices: false,
    useModernVelocityForwarding: false,
    startPriority: 1,
    startPercentage: 80,
    javaCommand: '',
    customJvmFlags: [],
    properties: [],
  },
})

const [name, nameProps] = defineField('name')
const [platform, platformProps] = defineField('platform')
const [platformVersion, platformVersionProps] = defineField('platformVersion')
const [minServices, minServicesProps] = defineField('minServices')
const [maxServices, maxServicesProps] = defineField('maxServices')
const [maxPlayerCount, maxPlayerCountProps] = defineField('maxPlayerCount')
const [maxMemory, maxMemoryProps] = defineField('maxMemory')
const [fallback, fallbackProps] = defineField('fallback')
const [staticServices, staticServicesProps] = defineField('staticServices')
const [useModernVelocityForwarding, useModernVelocityForwardingProps] = defineField('useModernVelocityForwarding')
const [startPriority, startPriorityProps] = defineField('startPriority')
const [startPercentage, startPercentageProps] = defineField('startPercentage')
const [javaCommand, javaCommandProps] = defineField('javaCommand')
const [customJvmFlags, _customJvmFlagsProps] = defineField('customJvmFlags')
const [properties, _propertiesProps] = defineField('properties')

const platformParams = computed(() => ({
  path: {
    name: platform.value || '',
  },
}))

const selectedPlatform = ref<string | null>(null)

const { data: platformData } = useCloudQuery<GetApiV1PlatformsByNameResponse>(
  getApiV1PlatformsByName,
  'platformData',
  platformParams,
)

const platformVersions = computed(() => {
  if (!platform.value || !platformData.value)
    return []

  return platformData.value.versions ?? []
})

watch(platform, () => {
  platformVersion.value = ''
})

const isProxyBased = computed(() => {
  if (!platform.value || !platformData.value)
    return false

  return platformData.value.proxy ?? false
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

function addCustomProperty(property: ApiProperty) {
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

const { mutate: createGroup, isPending: isCreating } = useMutation(postApiV1GroupsMutation())
const router = useRouter();

const onSubmit = handleSubmit(async (values) => {
  createGroup({
    body: ref(values),
  }, {
    onSuccess: () => {
      toast.success('The group has been successfully created.')
      resetForm()
      navigateTo('/groups')
    },
    onError: (error: any) => {
      if (error?.data) {
        toast.error(error.data.message)
      }
      else {
        toast.error('Failed to create group')
      }
    },
  })

  resetForm()
  router.back()
})
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          Create Server Group
        </h2>
        <p class="text-sm text-muted-foreground">
          Set up a new server group by defining its name and platform.
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
            <div class="flex flex-col gap-2">
              <Label class="font-medium" for="group-name"> Group Name </Label>
              <Input
                id="group-name" v-model="name" :class="{ 'border-destructive': errors.name }" class="max-w-md"
                placeholder="e.g. lobby" v-bind="nameProps"
              />
              <p class="text-xs text-muted-foreground">
                This name is used to identify the group internally.
              </p>
              <span v-if="errors.name" class="text-sm text-destructive">
                {{ errors.name }}
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
                <Select id="platform" v-model="platform" v-bind="platformProps">
                  <SelectTrigger :class="{ 'border-destructive': errors.platform }">
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="platform in platforms"
                      :key="platform.name || ''"
                      :value="platform.name || ''"
                    >
                      {{ platform.name || 'N/A' }}
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
                <Select
                  id="platform-version" v-model="platformVersion"
                  :disabled="!platform || platformVersions.length === 0" v-bind="platformVersionProps"
                >
                  <SelectTrigger :class="{ 'border-destructive': errors.platformVersion }">
                    <SelectValue
                      :placeholder="selectedPlatform
                        ? 'Select a version'
                        : 'Select a platform first'
                      "
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="version in platformVersions" :key="version.name" :value="version.name || ''">
                      {{ version.name || 'N/A' }}
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
                  id="min-online" v-model="minServices" :default-value="1" :min="0"
                  v-bind="minServicesProps"
                >
                  <NumberFieldContent>
                    <NumberFieldDecrement />
                    <NumberFieldInput :class="{ 'border-destructive': errors.minServices }" />
                    <NumberFieldIncrement />
                  </NumberFieldContent>
                </NumberField>
                <span v-if="errors.minServices" class="text-sm text-destructive">
                  {{ errors.minServices }}
                </span>
              </div>
              <div class="flex flex-col gap-2">
                <Label class="font-medium" for="max-players">
                  What is the maximum of services that can be online in this
                  group?
                </Label>
                <NumberField
                  id="max-services" v-model="maxServices" :default-value="100" :min="0"
                  v-bind="maxServicesProps"
                >
                  <NumberFieldContent>
                    <NumberFieldDecrement />
                    <NumberFieldInput :class="{ 'border-destructive': errors.maxServices }" />
                    <NumberFieldIncrement />
                  </NumberFieldContent>
                </NumberField>
                <span v-if="errors.maxServices" class="text-sm text-destructive">
                  {{ errors.maxServices }}
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
              <Switch id="is-static" v-model="staticServices" v-bind="staticServicesProps" />
              <span v-if="errors.staticServices" class="text-sm text-destructive">
                {{ errors.staticServices }}
              </span>
            </div>
            <div v-if="isProxyBased">
              <div class="flex flex-col gap-2">
                <Label class="font-medium" for="is-default-proxy">
                  Do you want to use Velocity modern forwarding? Modern
                  forwarding is more secure but will break support for versions
                  below 1.13
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
                  What is the start priority of this group? (Services in groups
                  with higher priority are started first)
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
                  id="player-percentage" v-model="startPercentage" :default-value="80" :min="-1"
                  v-bind="startPercentageProps"
                >
                  <NumberFieldContent>
                    <NumberFieldDecrement />
                    <NumberFieldInput
                      :class="{
                        'border-destructive': errors.startPercentage,
                      }"
                    />
                    <NumberFieldIncrement />
                  </NumberFieldContent>
                </NumberField>
                <span v-if="errors.startPercentage" class="text-sm text-destructive">
                  {{ errors.startPercentage }}
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
                        id="java-command" v-model="javaCommand"
                        :class="{ 'border-destructive': errors.javaCommand }" class="max-w-md" placeholder="java"
                        v-bind="javaCommandProps"
                      />
                      <p class="text-xs text-muted-foreground">
                        The command used to start the Java process. You can
                        customize this if you want to use a different Java
                        version or why ever else you might need it.
                      </p>
                      <span v-if="errors.javaCommand" class="text-sm text-destructive">
                        {{ errors.javaCommand }}
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
                        Additional JVM flags that are added to the Java command
                        when starting a service. You can use this to e.g. add
                        performance enhancing flags or enable remote debugging.
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
        </form>
      </CardContent>

      <CardFooter class="border-t px-6 flex justify-end gap-3">
        <Button variant="outline" @click="router.back()">
          Cancel
        </Button>
        <Button :disabled="isCreating" type="submit" @click="onSubmit">
          <Icon v-if="isCreating" class="mr-2 h-4 w-4 animate-spin" name="lucide:loader-2" />
          Create Group
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
