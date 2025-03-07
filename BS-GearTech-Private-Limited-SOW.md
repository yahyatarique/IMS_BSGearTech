# BS Geartech Private Limited

<aside>
✴️ A streamlined order management system for precision manufacturing, focusing on creating and tracking `Pinion`/`Gear` orders with integrated buyer management, quotation creation, inventory tracking, and modular processing.

</aside>

# Project Plan Outline

- Logo Making
- Brand Color
- Emblem/Logo on Letter Head.

# Modules

### **Dashboard**

- **Orders**
    <aside>
    ✴️ This card will show info regarding order under process, draft orders & order profile actions.
    
    </aside>
    
    - Active Orders
        - Orders with status `Accepted` / `RawMaterialFinalized` / `In Process` / `Pending Fulfillment` / `Pending Payment` / `Dispatched`
            - up to 10 orders at a glance, with below info on display:
            **- Order Number:** `Order.**orderNumber` 
            - Date Created:** `Order.**createdAt` 
            - Buyer Name:** `Buyer.**name**` 
            **- Order Value:** `Order.**grandTotal**`
            - **Action:** `View All` / `View Order`
    - Draft Orders
        - up to 10 recent orders with status `Draft`
            - **Action:** `View All` / `View Order`
    - Profiles
        - up to 5 order profiles:
            - with below info:
            **- Profile Name:** `OrderProfile.**name**`
            **- Type:** `OrderProfile.**type**`
            **- Material:** `OrderProfile.**material**` 
            **- Cut Size:** `OrderProfile.cutSize.**width** *mm*` x `OrderProfile.cutSize.**height** *mm` 
            **-* Available Inventory:** `Inventory.**availableUnits**` where `OrderProfile.**material**` & `OrderProfile.**cutSize**` matches the current profile.
            - **Action:** `Edit` / `Add New`
- **Buyers**
    <aside>
    ✴️ This card will show info related to buyer with current orders and their contact details, & related actions.
    
    </aside>
    
    **Recents**
    
    - up to 5 recent buyers with orders created in last 15 days, (*excluding the current day)*
        - with below info:
        - Buyer name: `Buyer.**name**` 
        - Total Order Value: `*Order.**grandTotal**` where `Order.**createdAt**` < 90days 
        -* Buyer contact person & mobile: `Buyer.**mobile**` / `Buyer.**contactName**`
        - Action: `View Buyer` / `View Buyers' Orders`

### Order Profiles

<aside>
✴️

This module outlines the actions relating to Order Profiles and their management, also available inventory of the respective profiles can be seen inside the module.

</aside>

- **Order Profile Listing**
  - Orders profile will be listed with all the relevant information required, like:
  - Profile Name: `OrderProfile.**name**`
  - Type: `OrderProfile.**type`** = \*\***`Pinion` / `Gear`
  - Material:`OrderProfile.**material`\*\* = `CR-5`, `EN-9`
  - Rate: `OrderProfile.**materialRate** *INR/mm*`
  - Cut Size: `OrderProfile.cutSize.**width** *mm*` x `OrderProfile.cutSize.**height** *mm*`
  - Burning Wastage: **`O%** < OrderProfile.material.**burningWastage < 20%`** of `Order.**weight`\*\*
  - Heat Treatment Rate: `OrderProfile.**heatTreatmentRate** *INR/kg*`
  - Heat Treatment Inefficacy (Weight Loss): `OrderProfile.**heatTreatmentInefficacy** *%/kg` =\* `25%` \*\*
- List Order Profiles —— `Edit/Delete` —— Confirmation.

### Settings

- User Settings:
  - Create **User -** Username: `user.**username**`
  - Password: `AlphaNumberic`
  - Role: `SuperAdmin` / `Admin`
    - **`SuperAdmin`**
      - `Read/Write/Delete`
    - **`Supervisor`**
      - `Read`
  - Update **User**
    - Can be used to update access of existing users, or password.

### Buyer

- Create **Buyer**
- Organization Name: `Buyer?.**orgName**`
- Organization Address: `Buyer?.**orgAddress**`
- Organization Contact Person: `Buyer.**contactDetails.name**`
- Organization Contact Number: `Buyer.**contactDetails.mobile**`
- GST Number: `Buyer.**gstNumber**`
- PAN Number: `Buyer.**panNumber**`
- TIN Number: `Buyer.**tinNumber`\*\*
- List Orders, by `Buyer.**id**`
  - Order Details, up to 10 orders (if any):
    - `Order.**orderNumber**` | `Order.**profile`** | `Order.**status`** | `Order.**materialCost**`|`Order.**grandTotal`**
  - **Action:**
    - Create A `Quotation`
    - Create `Buyer`

### **Orders**

- Create Quotation
- Purchaser Name: `Order.**buyerName`** | `Order.buyer.orgName` | `Order.buyer.**id\*\*`
- PO Number: `Order.**orderNumber**` in the form of `BSGPL/{Month}/{Year}/{InitialNumber}`
- Date: `Order.**createdDate**`
- Profile: `Order.**profile**` | `Order.**profileName**` | `Order.**profileInventory**`
- Finish Size: `Order.**finishSize`** where `finishSize` is `{**width**: number, **height\*\*: number}`
- Turning Rate: `Order.processes.turning.**price**` = `{Turning, INR}`
- Module: `Order.details.**module**` `number`
- Face: `Order.details.**face**` `number`
- Number Of Teeth (Cutting & Grinding): `Order.**numberOfTeeth**` `number`
- Weight: `Order.**preWeighment**` = **`{CutSize[1]}^2 X {CutSize[2]} / 0.16202`**
- Material Cost: \***\*`Order.**estimatedMaterialCost**` = **`{Weight} X {MaterialRate}`\*\*
- TC+TG \***\*Price: `Order.process.**teethCutting** + Order.process.**teethGrinding**` = **`#Teeth X Module X {FaceOptions} X {Rate, INR}` -** HT Cost: `Order.process.**heatTreatment**` = **`{Weight} X (100% - 25%) X {HT Rate, INR}`

Processes: -** Process Type: `Order.process.**type\*\*`=`Milling - Fitting - Keyway - Heat Treatment - Teeth Cutting - Teeth Grinding`

- Process Cost: `Order.process.**rate**` = `{ManualEntry}`
- Process 2 Type: `Cylinderical/Internal Griding`
- Process 2 Cost: `{ManualEntry}`

**Total:**

- Total Order Value: `Order.**totalOrderValue**` = \*\*`{Material}+{Turning}+{TC+TG}+{HT}+{Process1}+{Process2}`
- Grand Total:** `Order.**grandTotal**` = **`{FinalOV} + {Profit Margin, number, %}`\*\*
- Convert to Order
- Status: `Draft/Accepted/RawMaterialFinalize/`

### **Inventory**

- Material Type: `CR-5`
- Material Weight: `weight` kg
- Cut-Size: `Width` X `Height`
- Related POs: `PO Number`

# Related Docs

[Types Documentation](/TypesDocumentation.md)
