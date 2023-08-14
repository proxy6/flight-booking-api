const { v4: uuidv4 } = require('uuid');
const TempDb = require('./temp-datastore');

// Mocking uuid
jest.mock('uuid');
uuidv4.mockReturnValue('mocked-uuid');


const mockFlightStore = [];


describe('Temp DB Module Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should save data and return generated UUID', async () => {
    const mockData = { some: 'data' };
    const mockStatus = 'reserve';
    const mockPaymentRef = 'payment123';

    const result = await TempDb.saveData(mockData, mockStatus, mockPaymentRef);

    expect(result).toBe('mocked-uuid');

  });


  it('should update data by ID if found', async () => {
    const mockUId = 'mocked-uuid';
    mockFlightStore.push({
      uId: 'mocked-uuid',
      status: 'reserve',
      paymentRef: 'payment123',
      data: { some: 'data' },
    });
    const mockStatus = 'confirmed';
    const mockPaymentRef = 'payment456';

    const result = await TempDb.updateData(mockUId, mockStatus, mockPaymentRef);

    expect(result).toEqual({
      uId: 'mocked-uuid',
      status: 'confirmed',
      paymentRef: 'payment456',
      data: { some: 'data' },
    });
  });

  it('should return false when updating data by ID if not found', async () => {
    const mockUId = 'non-existent-uuid';
    const mockStatus = 'confirmed';
    const mockPaymentRef = 'payment456';

    const result = await TempDb.updateData(mockUId, mockStatus, mockPaymentRef);

    expect(result).toBe(false);
  });
});
