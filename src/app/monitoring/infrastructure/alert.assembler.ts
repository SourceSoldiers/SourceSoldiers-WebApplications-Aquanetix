import { Alert } from '../domain/model/alert.entity';

export class AlertAssembler {
  static toEntityFromResource(resource: any): Alert {
    return new Alert({ ...resource });
  }

  static toEntitiesFromArray(resources: any[]): Alert[] {
    return resources.map(r => this.toEntityFromResource(r));
  }
}
