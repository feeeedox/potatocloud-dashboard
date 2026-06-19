<script lang="ts" setup>
import type { GetApiV1GroupsByGroupNameResponse, GroupUpdateRequest } from '~/client/generated';
import type { CloudProperty } from '~/types/cloud'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { getApiV1GroupsByGroupName } from '~/client/generated';
import { putApiV1GroupsByGroupNameMutation } from '~/client/generated/@tanstack/vue-query.gen';
import { updateGroupSchema } from '~/lib/schemas'

const route = useRoute()
const groupId = route.params.id as string
const router = useRouter();

const { data: groupObject } = useCloudQuery<GetApiV1GroupsByGroupNameResponse>(
  getApiV1GroupsByGroupName,
  'groupDetails',
  {
    path: {
      groupName: groupId,
    },
  },
)

const { handleSubmit, errors, defineField, resetForm } = useForm<GroupUpdateRequest>({
  validationSchema: toTypedSchema(updateGroupSchema),
  initialValues: {
    customJvmFlags: [],
    maxPlayers: 0,
    maxMemory: 0,
    minServices: 0,
    maxServices: 0,
    fallback: false,
    startPriority: 0,
    startPercentage: 0,
    templates: [],
    properties: [],
  },
})

watch(groupObject, (newData) => {
  if (newData) {
    resetForm({
      values: {
        customJvmFlags: newData.customJvmFlags ?? [],
        maxPlayers: newData.maxPlayers ?? 0,
        maxMemory: newData.maxMemory ?? 0,
        minServices: newData.minServices ?? 0,
        maxServices: newData.maxServices ?? 0,
        fallback: newData.fallback ?? false,
        startPriority: newData.startPriority ?? 0,
        startPercentage: newData.startPercentage ?? 0,
        templates: newData.templates ?? [],
        properties: newData.properties ?? [],
      },
    })
  }
}, { immediate: true })

const [customJvmFlags, _customJvmFlagsProps] = defineField('customJvmFlags')
const [maxPlayers, maxPlayersProps] = defineField('maxPlayers')
const [maxMemory, maxMemoryProps] = defineField('maxMemory')
const [minServices, minServicesProps] = defineField('minServices')
const [maxServices, maxServicesProps] = defineField('maxServices')
const [fallback, fallbackProps] = defineField('fallback')
const [startPriority, startPriorityProps] = defineField('startPriority')
const [startPercentage, startPercentageProps] = defineField('startPercentage')
const [templates, templatesProps] = defineField('templates')
const [properties, _propertiesProps] = defineField('properties')

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

const { mutate: updateGroup, isPending: isUpdating } = useMutation(putApiV1GroupsByGroupNameMutation())

const onSubmit = handleSubmit(async (values) => {
  updateGroup({
    path: {
      groupName: groupId,
    },
    body: ref(values),
  },
  {
    onSuccess: () => {
      toast.success('Group updated successfully')
    },
    onError: (error: any) => {
      if (error?.data) {
        toast.error(error.data.message)
      }
      else {
        toast.error('Failed to update group')
      }
    },
  },
  )

  resetForm()
  router.back()
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

    <div v-if="!groupObject" class="flex justify-center py-20 text-muted-foreground">
      <Icon class="h-10 w-10 animate-spin" name="lucide:loader-2" />
    </div>

    <Card v-if="groupObject">
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
                <TagsInput v-model="templates" placeholder="new-template" v-bind="templatesProps" />
                <p class="text-xs text-muted-foreground">
                  The service templates that are used to merge existing data
                  (e.g. worlds, plugins) when starting new services in this
                  group.
                </p>
                <span v-if="errors.templates" class="text-sm text-destructive">
                  {{ errors.templates }}
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
                  <Select id="platform" disabled>
                    <SelectTrigger>
                      <SelectValue
                        :placeholder="groupObject.platform?.name || 'N/A'"
                      />
                    </SelectTrigger>
                  </Select>
                </div>

                <div class="flex flex-col gap-2">
                  <Label class="font-medium" for="platform-version">
                    Which version of the platform?
                  </Label>
                  <Select id="platform-version" disabled>
                    <SelectTrigger>
                      <SelectValue
                        :placeholder="groupObject.platformVersion?.name || 'N/A'"
                      />
                    </SelectTrigger>
                  </Select>
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
                    id="max-players" v-model="maxPlayers" :default-value="100" :min="0"
                    v-bind="maxPlayersProps"
                  >
                    <NumberFieldContent>
                      <NumberFieldDecrement />
                      <NumberFieldInput :class="{ 'border-destructive': errors.maxPlayers }" />
                      <NumberFieldIncrement />
                    </NumberFieldContent>
                  </NumberField>
                  <span v-if="errors.maxPlayers" class="text-sm text-destructive">
                    {{ errors.maxPlayers }}
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
                <Switch id="is-static" :checked="groupObject.staticServices" disabled />
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
                          id="java-command"
                          :placeholder="groupObject.javaCommand" class="max-w-md"
                          disabled
                        />
                        <p class="text-xs text-muted-foreground">
                          The command used to start the Java process. You can
                          customize this if you want to use a different Java
                          version or why ever else you might need it.
                        </p>
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
        <Button variant="outline" @click="router.back()">
          Cancel
        </Button>
        <Button :disabled="isUpdating" type="submit" @click="onSubmit">
          <Icon v-if="isUpdating" class="mr-2 h-4 w-4 animate-spin" name="lucide:loader-2" />
          Update Group
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
