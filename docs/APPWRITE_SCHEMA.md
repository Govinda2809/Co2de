# CO2DE Appwrite Collection Schema

# Add these attributes to your 'analyses' collection in Appwrite Console

## Required String Attributes:

| Attribute Key | Type   | Size | Required | Array |
| ------------- | ------ | ---- | -------- | ----- |
| fileName      | String | 256  | Yes      | No    |
| fileId        | String | 256  | Yes      | No    |
| userId        | String | 256  | Yes      | No    |
| createdAt     | String | 64   | Yes      | No    |
| bottleneck    | String | 2048 | Yes      | No    |
| optimization  | String | 2048 | Yes      | No    |
| improvement   | String | 2048 | Yes      | No    |
| engineVersion | String | 32   | No       | No    |

## Optional String Attributes:

| Attribute Key   | Type   | Size | Required | Array |
| --------------- | ------ | ---- | -------- | ----- |
| region          | String | 64   | No       | No    |
| hardwareProfile | String | 64   | No       | No    |
| language        | String | 32   | No       | No    |
| summary         | String | 4096 | No       | No    |
| securityNotes   | String | 2048 | No       | No    |
| clientCity      | String | 128  | No       | No    |
| clientCountry   | String | 128  | No       | No    |
| clientIp        | String | 64   | No       | No    |

## Number Attributes:

| Attribute Key     | Type    | Required | Min | Max       |
| ----------------- | ------- | -------- | --- | --------- |
| fileSize          | Integer | Yes      | 0   | 999999999 |
| estimatedEnergy   | Float   | Yes      | 0   | 999999    |
| estimatedCO2      | Float   | Yes      | 0   | 999999    |
| score             | Integer | Yes      | 0   | 10        |
| complexity        | Float   | No       | 0   | 100       |
| memPressure       | Float   | No       | 0   | 100       |
| lineCount         | Integer | No       | 0   | 999999    |
| gridIntensity     | Integer | No       | 0   | 1000      |
| optimizationDelta | Float   | No       | 0   | 100       |

## Boolean Attributes:

| Attribute Key     | Type    | Required |
| ----------------- | ------- | -------- |
| recursionDetected | Boolean | No       |

## Required Indexes:

| Index Key     | Type | Attributes       |
| ------------- | ---- | ---------------- |
| userId_idx    | Key  | userId           |
| createdAt_idx | Key  | createdAt (DESC) |

---

## How to Add Attributes in Appwrite Console:

1. Go to your Database → Collection → **Attributes** tab
2. Click **Create Attribute**
3. Select the type (String/Integer/Float/Boolean)
4. Fill in the Attribute Key and Size (for strings)
5. Check "Required" if needed
6. Click **Create**

## How to Add Indexes:

1. Go to **Indexes** tab
2. Click **Create Index**
3. Enter Index Key (e.g., `userId_idx`)
4. Select Index Type: **Key**
5. Add Attribute: `userId`
6. Click **Create**

Repeat for `createdAt_idx` with descending order.
