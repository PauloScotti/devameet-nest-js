/* eslint-disable prettier/prettier */
import { ToglVideoSchema } from './toglVideo.dto';
import { RoomMessgesHelper } from '../helpers/roommessages.helper';

describe('ToglVideoSchema', () => {
  it('aceita booleano e descarta campos extras', () => {
    expect(ToglVideoSchema.parse({ video: true, userId: 'x' })).toEqual({ video: true });
  });

  it.each([undefined, 'true', 1])('rejeita %p', (video) => {
    const result = ToglVideoSchema.safeParse({ video });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(RoomMessgesHelper.VIDEO_NOT_VALID);
    }
  });
});
