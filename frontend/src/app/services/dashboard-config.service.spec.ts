import { TestBed } from '@angular/core/testing';
import { DashboardConfigService } from './dashboard-config.service';

describe('DashboardConfigService', () => {
  let service: DashboardConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return dashboard config', () => {
    const config = service.getDashboardConfig();
    expect(config).toBeDefined();
    expect(config.role).toBe('ADMINISTRATEUR');
    expect(config.permissions).toContain('admin');
  });

  it('should check permissions', () => {
    expect(service.hasPermission('admin')).toBeTruthy();
    expect(service.hasPermission('invalid')).toBeFalsy();
  });

  it('should update config', () => {
    const newConfig = { role: 'USER' };
    service.updateConfig(newConfig);
    const config = service.getDashboardConfig();
    expect(config.role).toBe('USER');
  });
});