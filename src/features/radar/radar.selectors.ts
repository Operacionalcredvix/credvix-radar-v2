import type {
  Coordinator,
  RadarPayload,
  RadarPriority,
  Store,
} from '../../types/radar'

export function getCoordinatorById(
  data: RadarPayload,
  coordinatorId: string,
): Coordinator | undefined {
  return data.coordinators.find(
    (coordinator) => coordinator.id === coordinatorId,
  )
}

export function getStoreById(
  data: RadarPayload,
  storeId: string,
): Store | undefined {
  return data.stores.find(
    (store) => store.id === storeId,
  )
}

export function getStoresByCoordinator(
  data: RadarPayload,
  coordinatorId: string,
): Store[] {
  return data.stores.filter(
    (store) => store.coordinatorId === coordinatorId,
  )
}

export function getPrioritiesByCoordinator(
  data: RadarPayload,
  coordinatorId: string,
): RadarPriority[] {
  return data.priorities.filter(
    (priority) =>
      priority.coordinatorId === coordinatorId,
  )
}

export function getPriorityStore(
  data: RadarPayload,
  priority: RadarPriority,
): Store | undefined {
  if (!priority.storeId) {
    return undefined
  }

  return getStoreById(data, priority.storeId)
}

export function getPriorityCoordinator(
  data: RadarPayload,
  priority: RadarPriority,
): Coordinator | undefined {
  return getCoordinatorById(
    data,
    priority.coordinatorId,
  )
}