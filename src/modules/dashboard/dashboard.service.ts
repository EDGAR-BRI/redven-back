import { prisma } from '../../lib/prisma';
import * as sosService from '../sos/sos.service';
import * as personsService from '../persons/persons.service';
import * as resourcesService from '../resources/resources.service';
import * as volunteersService from '../volunteers/volunteers.service';
import * as alertsService from '../alerts/alerts.service';

export async function getStats() {
  const [activeSos, missingPersons, availableResources, totalVolunteers, activeAlerts] = await Promise.all([
    sosService.getActiveSOSCount(),
    personsService.getMissingCount(),
    resourcesService.getResourceCount(),
    volunteersService.getVolunteerCount(),
    alertsService.getActiveAlertsCount(),
  ]);

  return {
    activeSos,
    missingPersons,
    availableResources,
    totalVolunteers,
    activeAlerts,
  };
}
