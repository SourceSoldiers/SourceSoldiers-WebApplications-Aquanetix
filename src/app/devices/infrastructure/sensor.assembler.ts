import { Sensor } from '../domain/model/sensor.entity';

export class SensorAssembler {
  static toEntityFromResource(resource: any): Sensor {
    return new Sensor({ ...resource });
  }

  static toEntitiesFromArray(resources: any[]): Sensor[] {
    return resources.map(r => this.toEntityFromResource(r));
  }
}
