export interface SendGeofenceEventPayload {
  alias: string;
  guid: string;
  geofence_guid: string;
  event: 'enter' | 'exit';
  current_location: [number, number];
  horizontal_accuracy: number;
}
