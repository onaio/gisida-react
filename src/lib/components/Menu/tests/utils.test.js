import { canAccessLayer } from '../utils';
import { authConfigs, user1, user2, layer1, layer2, layer3 } from './fixtures';

describe('components/Menu/utils/canAccessLayer', () => {
  it('should return true if user can access all layers', () => {
    expect(canAccessLayer(layer1, authConfigs, user1)).toEqual(true);
    expect(canAccessLayer(layer2, authConfigs, user1)).toEqual(true);
    expect(canAccessLayer(layer3, authConfigs, user1)).toEqual(true);
  });

  it('it should return correctly if user has only access to a certain layer', () => {
    expect(canAccessLayer(layer1, authConfigs, user2)).toEqual(true);
    expect(canAccessLayer(layer2, authConfigs, user2)).toEqual(false);
  });
});
