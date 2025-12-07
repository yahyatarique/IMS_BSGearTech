
export const INVALID_CREDS = 'Invalid credentials';
export const INVALID_PASSWORD = 'Invalid Password';
export const CALCULATE_WEIGHT_CONST = 0.16202; // Weight calculation constant

// Burning wastage percentage options
export const BURNING_WASTAGE_PERCENTAGES = (process.env.NEXT_PUBLIC_BURNING_WASTAGE_PERCENTAGES || '3,5,10,15,20,25,30')
  .split(',')
  .map(val => parseFloat(val.trim()))
  .filter(val => !isNaN(val));

export const StorageKeys = {
    USER_STORAGE_KEY: 'userInfo',
}

export const INVENTORY_ITEMS_TYPES = [
    {
        name: 'All Types',
        value: 'all',
    },
    {
        name: 'Gear',
        value: '0',
    },
    {
        name: 'Pinion',
        value: '1',
    }
]