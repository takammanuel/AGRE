// AVANT : import { Environments } from './environment';
// APRÈS :
import { environment } from './environment';

describe('Environment', () => {
  it('should have the correct API URL', () => {
    expect(environment.apiUrl).toBe('http://localhost:8000/api');
  });
});
